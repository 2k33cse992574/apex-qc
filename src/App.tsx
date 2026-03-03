import { useCallback, useEffect, useMemo, useState } from 'react';
import { SterlingGateNavigation } from './components/ui/sterling-gate-kinetic-navigation';
import { PyramidDashboard } from './components/PyramidDashboard';
import { ApexCinematicLoader } from './components/ui/ApexCinematicLoader';
import { LoginPage } from './components/ui/LoginPage';
import { MapPage } from './components/MapPage';
import { ProfilePage } from './components/ProfilePage';
import { SecurityPage } from './components/SecurityPage';
import { getCurrentPolicy, getHealth, listIncidents, listKpis, type IncidentRecord, type KpiSnapshot, type Policy, simulateIncident } from './lib/api';

type AppScreen = 'loader' | 'login' | 'dashboard';
export type DashboardTab = 'dashboard' | 'map' | 'profile' | 'security';

function App() {
  const [screen, setScreen] = useState<AppScreen>('loader');
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [latestIncident, setLatestIncident] = useState<IncidentRecord | null>(null);
  const [kpiSnapshots, setKpiSnapshots] = useState<KpiSnapshot[]>([]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [reasoningModel, setReasoningModel] = useState<string>('Amazon Nova (via Bedrock)');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [health, incidentsRes, kpisRes, policyRes] = await Promise.all([
        getHealth(),
        listIncidents(15),
        listKpis(15),
        getCurrentPolicy(),
      ]);
      setApiOnline(health.status === 'ok');
      setReasoningModel(health.reasoningModel || 'Amazon Nova (via Bedrock)');
      setLatestIncident(incidentsRes.incidents[0] ?? null);
      setKpiSnapshots(kpisRes.snapshots);
      setPolicy(policyRes.policy);
      setLoadError(null);
    } catch (error) {
      setApiOnline(false);
      setLoadError(error instanceof Error ? error.message : 'Unknown API error');
    }
  }, []);

  useEffect(() => {
    if (screen !== 'dashboard') return;
    void refreshData();
    const timer = setInterval(() => {
      void refreshData();
    }, 8000);
    return () => clearInterval(timer);
  }, [screen, refreshData]);

  const triggerIncident = useCallback(async () => {
    setLoading(true);
    try {
      const result = await simulateIncident();
      setLatestIncident(result);
      await refreshData();
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Incident trigger failed');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const latestKpi = useMemo(() => kpiSnapshots[0] ?? null, [kpiSnapshots]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <PyramidDashboard
            latestIncident={latestIncident}
            latestKpi={latestKpi}
            policy={policy}
            apiOnline={apiOnline}
            reasoningModel={reasoningModel}
            loading={loading}
            loadError={loadError}
            onTriggerIncident={triggerIncident}
          />
        );
      case 'map':
        return <MapPage latestIncident={latestIncident} apiOnline={apiOnline} />;
      case 'profile':
        return <ProfilePage latestKpi={latestKpi} incidentsCount={kpiSnapshots.length} policy={policy} />;
      case 'security':
        return <SecurityPage latestIncident={latestIncident} policy={policy} apiOnline={apiOnline} />;
      default:
        return (
          <PyramidDashboard
            latestIncident={latestIncident}
            latestKpi={latestKpi}
            policy={policy}
            apiOnline={apiOnline}
            reasoningModel={reasoningModel}
            loading={loading}
            loadError={loadError}
            onTriggerIncident={triggerIncident}
          />
        );
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
