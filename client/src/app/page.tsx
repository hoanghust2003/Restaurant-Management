'use client';

import LayoutProvider from './layouts/LayoutProvider';
import DashboardPage from './components/DashboardPage';

export default function Home() {
  return (
    <LayoutProvider title="Dashboard">
      <DashboardPage />
    </LayoutProvider>
  );
}
