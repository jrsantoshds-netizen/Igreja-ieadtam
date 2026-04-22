'use client';

import { usePathname } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';
import { AuthProvider, useAuth } from '@/components/AuthProvider';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  
  if (loading) return null; // Let AuthProvider handle redirect, or display a global loader if we wanted
  
  const isAuthPage = pathname === '/login';

  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutInner>{children}</LayoutInner>
    </AuthProvider>
  );
}
