import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { az } from '../i18n/az';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = az.common.loading }: LoadingStateProps) {
  return (
    <Box textAlign="center" py={12}>
      <Spinner size="lg" color="teal.500" mb={4} />
      <Text color="gray.600">{message}</Text>
    </Box>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({
  title = az.common.errorTitle,
  message,
}: ErrorStateProps) {
  return (
    <Alert status="error" borderRadius="md" variant="left-accent">
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Box>
    </Alert>
  );
}
