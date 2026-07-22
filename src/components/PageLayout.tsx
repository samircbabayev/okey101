import { Box, Container, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { az } from '../i18n/az';

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const navLinks = [
  { to: '/', label: az.nav.games },
  { to: '/create', label: az.nav.newGame },
  { to: '/stats', label: az.nav.stats },
];

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  const location = useLocation();

  return (
    <Box
      minH="100vh"
      bgGradient="linear(180deg, #e8f2f0 0%, #f3f6f5 28%, #f3f6f5 100%)"
      overflowX="hidden"
    >
      <Box
        bg="teal.700"
        color="white"
        py={{ base: 3, md: 3.5 }}
        px={{ base: 3, md: 4 }}
        shadow="sm"
        position="sticky"
        top={0}
        zIndex={10}
        borderBottomWidth="1px"
        borderBottomColor="teal.800"
      >
        <Container maxW="container.lg" px={{ base: 0, md: 4 }}>
          <Flex justify="space-between" align="center" gap={3}>
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} minW={0}>
              <Heading size={{ base: 'sm', md: 'md' }} letterSpacing="-0.02em" noOfLines={1}>
                <Text as="span" display={{ base: 'inline', sm: 'none' }}>
                  {az.appTitle}
                </Text>
                <Text as="span" display={{ base: 'none', sm: 'inline' }}>
                  {az.appTitleFull}
                </Text>
              </Heading>
            </Link>
            <Stack direction="row" spacing={1} flexShrink={0}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    as={RouterLink}
                    to={link.to}
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight={isActive ? '700' : '500'}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                    _hover={{ bg: 'whiteAlpha.200', textDecoration: 'none' }}
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
        pb={{ base: 10, md: 10 }}
      >
        {title && (
          <Box mb={{ base: 4, md: 6 }}>
            <Heading
              size={{ base: 'md', md: 'lg' }}
              mb={subtitle ? 1 : 0}
              letterSpacing="-0.02em"
              noOfLines={2}
            >
              {title}
            </Heading>
            {subtitle && (
              <Text color="gray.500" fontSize="sm">
                {subtitle}
              </Text>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
}
