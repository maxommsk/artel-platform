'use client';

import React from 'react';
import Dashboard, { LocaleProvider } from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <LocaleProvider>
      <Dashboard />
    </LocaleProvider>
  );
}

