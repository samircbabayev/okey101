import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CreateGamePage } from './pages/CreateGamePage';
import { GameListPage } from './pages/GameListPage';
import { GamePage } from './pages/GamePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { StatsPage } from './pages/StatsPage';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: `'Plus Jakarta Sans', system-ui, sans-serif`,
    body: `'Plus Jakarta Sans', system-ui, sans-serif`,
  },
  styles: {
    global: {
      'html, body': {
        overflowX: 'hidden',
      },
      body: {
        bg: '#f3f6f5',
        color: 'gray.800',
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  shadows: {
    outline: '0 0 0 3px rgba(15, 118, 110, 0.35)',
  },
  components: {
    Button: {
      baseStyle: {
        minH: { base: '44px', md: '40px' },
        borderRadius: 'xl',
        fontWeight: '600',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          borderWidth: '1px',
          borderColor: 'blackAlpha.100',
          shadow: 'sm',
          bg: 'white',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          fontSize: { base: '16px', md: 'md' },
          borderRadius: 'xl',
        },
      },
      defaultProps: {
        focusBorderColor: 'teal.500',
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontSize: { base: '16px', md: 'md' },
          borderRadius: 'xl',
        },
      },
      defaultProps: {
        focusBorderColor: 'teal.500',
      },
    },
    FormLabel: {
      baseStyle: {
        mb: 1,
        fontSize: 'sm',
        fontWeight: '600',
        color: 'gray.600',
      },
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GameListPage />} />
      <Route path="/create" element={<CreateGamePage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/game/:id" element={<GamePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ChakraProvider>
  );
}
