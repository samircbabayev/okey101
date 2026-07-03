import { Button, Card, CardBody, Heading, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { az } from '../i18n/az';

export function NotFoundPage() {
  return (
    <PageLayout>
      <Card maxW="480px" mx="auto" mt={{ base: 6, md: 12 }}>
        <CardBody py={{ base: 8, md: 12 }} textAlign="center">
          <Stack spacing={4} align="center">
            <Heading size="4xl" color="teal.500" lineHeight={1}>
              {az.notFound.code}
            </Heading>
            <Heading size="md">{az.notFound.title}</Heading>
            <Text color="gray.600">{az.notFound.message}</Text>
            <Button
              as={RouterLink}
              to="/"
              colorScheme="teal"
              size="lg"
              mt={2}
              w={{ base: 'full', sm: 'auto' }}
            >
              {az.notFound.backHome}
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </PageLayout>
  );
}
