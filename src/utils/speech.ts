const PREFERRED_LANG_PREFIXES = ['az', 'tr'];

const FEMALE_NAME_HINTS = [
  'female',
  'qadın',
  'banu',
  'aygün',
  'aygun',
  'seda',
  'yelda',
  'filiz',
  'zeynep',
  'google',
];

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  for (const prefix of PREFERRED_LANG_PREFIXES) {
    const matches = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(prefix),
    );
    if (matches.length === 0) continue;
    const female = matches.find((v) =>
      FEMALE_NAME_HINTS.some((h) => v.name.toLowerCase().includes(h)),
    );
    return female ?? matches[0];
  }
  return null;
}

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const handler = () => resolve(synth.getVoices());
    synth.addEventListener('voiceschanged', handler, { once: true });
    setTimeout(() => resolve(synth.getVoices()), 600);
  });
}

export async function speak(text: string): Promise<void> {
  if (!isSpeechSupported() || !text.trim()) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const voices = await getVoicesAsync();
  const voice = pickVoice(voices);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? 'az-AZ';
  utterance.pitch = 1.3;
  utterance.rate = 0.95;
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}
