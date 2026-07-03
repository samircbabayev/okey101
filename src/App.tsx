import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CreateGamePage } from './pages/CreateGamePage';
import { GameListPage } from './pages/GameListPage';
import { GamePage } from './pages/GamePage';
import { StatsPage } from './pages/StatsPage';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      'html, body': {
        overflowX: 'hidden',
      },
      body: {
        bg: 'gray.50',
        WebkitTapHighlightColor: 'transparent',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        minH: { base: '44px', md: '40px' },
      },
    },
    Input: {
      baseStyle: {
        field: {
          fontSize: { base: '16px', md: 'md' },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontSize: { base: '16px', md: 'md' },
        },
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
      <Route path="*" element={<Navigate to="/" replace />} />
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
