
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Dashboard as DashboardComponent } from '@/components/dashboard/Dashboard';
import { initializeExtensionSync } from '@/utils/extensionSync';

const Dashboard = () => {
  useEffect(() => {
    // Initialize extension sync when dashboard loads
    initializeExtensionSync();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DashboardComponent />
      </main>
    </div>
  );
};

export default Dashboard;
