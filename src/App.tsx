import { useState } from 'react';
import { SterlingGateNavigation } from './components/ui/sterling-gate-kinetic-navigation';
import { PyramidDashboard } from './components/PyramidDashboard';
import { ApexCinematicLoader } from './components/ui/ApexCinematicLoader';
import { LoginPage } from './components/ui/LoginPage';
import { MapPage } from './components/MapPage';
import { ProfilePage } from './components/ProfilePage';
import { SecurityPage } from './components/SecurityPage';

type AppScreen = 'loader' | 'login' | 'dashboard';
export type DashboardTab = 'dashboard' | 'map' | 'profile' | 'security';

function App() {
  const [screen, setScreen] = useState<AppScreen>('loader');
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <PyramidDashboard />;
      case 'map': return <MapPage />;
      case 'profile': return <ProfilePage />;
      case 'security': return <SecurityPage />;
      default: return <PyramidDashboard />;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto overflow-x-hidden">
      {screen === 'loader' && (
        <ApexCinematicLoader onComplete={() => setScreen('login')} />
      )}

      {screen === 'login' && (
        <LoginPage onLogin={() => setScreen('dashboard')} />
      )}

      {screen === 'dashboard' && (
        <>
          <SterlingGateNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderContent()}
        </>
      )}
    </div>
  );
}

export default App
