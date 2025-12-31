import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the i18n configuration

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </ErrorBoundary>
);