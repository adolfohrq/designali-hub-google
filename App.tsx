import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { Page } from './types';
import { useAuth } from './contexts/AuthContext';
// @ts-ignore
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Ferramentas = lazy(() => import('./pages/Ferramentas'));
const Videos = lazy(() => import('./pages/Videos'));
const Notas = lazy(() => import('./pages/Notas'));
const Estudo = lazy(() => import('./pages/Estudo'));
const Recursos = lazy(() => import('./pages/Recursos'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard setActivePage={setActivePage} />;
      case Page.Ferramentas:
        return <Ferramentas />;
      case Page.Videos:
        return <Videos />;
      case Page.Notas:
        return <Notas />;
      case Page.Estudo:
        return <Estudo />;
      case Page.Recursos:
        return <Recursos />;
      case Page.Configuracoes:
        return <Configuracoes />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };
  
  const getPageTitle = (page: Page): string => {
    const titles: Record<Page, string> = {
        [Page.Dashboard]: 'Dashboard',
        [Page.Ferramentas]: 'Ferramentas',
        [Page.Videos]: 'Vídeos',
        [Page.Notas]: 'Notas',
        [Page.Estudo]: 'Aprendizado',
        [Page.Recursos]: 'Recursos',
        [Page.Configuracoes]: 'Configurações',
    };
    return titles[page];
  }

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-brand-gray">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <>
        <Toaster position="bottom-right" />
        <Suspense fallback={<LoadingSpinner fullPage message="Carregando página de login..." />}>
          <LoginPage onLogin={() => {}} />
        </Suspense>
      </>
    );
  }

  // Show main app if authenticated
  return (
    <div className="flex h-screen bg-brand-light font-sans text-brand-dark">
      <Toaster position="bottom-right" />
      <PWAInstallPrompt />
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle(activePage)} setActivePage={setActivePage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-light">
          <Suspense fallback={<LoadingSpinner fullPage message={`Carregando ${getPageTitle(activePage)}...`} />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
