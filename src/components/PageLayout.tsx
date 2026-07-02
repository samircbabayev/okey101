import { Box, Container, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const navLinks = [
  { to: '/', label: 'Games' },
  { to: '/create', label: 'New Game' },
];

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  const location = useLocation();

  return (
    <Box minH="100vh" bg="gray.50" overflowX="hidden">
      <Box
        bg="teal.600"
        color="white"
        py={{ base: 3, md: 4 }}
        px={{ base: 3, md: 4 }}
        shadow="md"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.lg" px={{ base: 0, md: 4 }}>
          <Flex justify="space-between" align="center" gap={3}>
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} minW={0}>
              <Heading size={{ base: 'sm', md: 'md' }} noOfLines={1}>
                <Text as="span" display={{ base: 'inline', sm: 'none' }}>
                  101 Okey
                </Text>
                <Text as="span" display={{ base: 'none', sm: 'inline' }}>
                  101 Okey Score Tracker
                </Text>
              </Heading>
            </Link>
            <Stack direction="row" spacing={{ base: 3, md: 4 }} flexShrink={0}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    as={RouterLink}
                    to={link.to}
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight={isActive ? 'bold' : 'medium'}
                    opacity={isActive ? 1 : 0.85}
                    _hover={{ textDecoration: 'underline', opacity: 1 }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </Stack>
          </Flex>
        </Container>
      </Box>

      <Container
        maxW="container.lg"
        py={{ base: 4, md: 8 }}
        px={{ base: 3, md: 4 }}
        pb={{ base: 8, md: 8 }}
      >
        <Box mb={{ base: 4, md: 6 }}>
          <Heading size={{ base: 'md', md: 'lg' }} mb={subtitle ? 1 : 0} noOfLines={2}>
            {title}
          </Heading>
          {subtitle && (
            <Text color="gray.600" fontSize="sm">
              {subtitle}
            </Text>
          )}
        </Box>
        {children}
      </Container>
    </Box>
  );
}
