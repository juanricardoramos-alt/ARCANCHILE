import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Entrada para el build de "página única" (npm run build:pagina).
// Usa HashRouter porque el archivo se abre desde un hosting sin reescritura
// de rutas (o incluso desde el disco), donde /catalogo daría 404.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
);
