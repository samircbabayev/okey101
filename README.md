# 101 Okey Score Tracker

Frontend-only score tracker for 101 Okey games. Built with React, TypeScript, Vite, Chakra UI, React Router, and Supabase client.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (no local Node.js required)

## Setup

1. Copy the environment file and add your Supabase credentials:

```bash
cp .env.example .env
```

2. Install dependencies for IDE TypeScript support (no local Node.js needed):

```bash
docker run --rm -v "$(pwd):/app" -w /app node:20-alpine npm install
```

This writes `node_modules` to your project folder so Cursor/VS Code can resolve types. The app itself still runs via Docker.

3. Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Run with Docker

```bash
docker compose up --build
```

Open **http://localhost:5173** (not port 3000).

To run in the background (keeps running after you close the terminal):

```bash
docker compose up --build -d
```

Stop it later with:

```bash
docker compose down
```

### Troubleshooting localhost

1. **Docker Desktop must be running** (whale icon in the menu bar).
2. **Wait for Vite to be ready** — look for `VITE ... ready` in the logs before opening the browser.
3. **Use the correct URL:** `http://localhost:5173`
4. **Check the container is up:**
   ```bash
   docker compose ps
   ```
   `STATUS` should be `Up` and `PORTS` should show `0.0.0.0:5173->5173/tcp`.
5. **If you closed the terminal** without `-d`, the app stopped. Run `docker compose up` again or use `-d`.
6. **Port conflict:** if something else uses 5173, change the mapping in `docker-compose.yml` to `"3000:5173"` and open `http://localhost:3000`.
7. **View logs if it crashes:**
   ```bash
   docker compose logs -f
   ```

## Project Structure

```
src/
  components/   # Reusable UI (Scoreboard, modals, layout)
  pages/        # CreateGamePage, GamePage
  hooks/        # useGameData
  services/     # Supabase API calls
  types/        # TypeScript interfaces
  utils/        # Score calculations, penalty labels
```

## Supabase Tables

Expects existing tables: `games`, `teams`, `players`, `rounds`, `scores`, `penalties`.

## Build for Production

```bash
docker compose run --rm frontend npm run build
```

Output is in `dist/`.
