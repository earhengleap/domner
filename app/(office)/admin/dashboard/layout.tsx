interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Admin-wide layout is now defined at app/(office)/admin/layout.tsx
  return <>{children}</>;
}
