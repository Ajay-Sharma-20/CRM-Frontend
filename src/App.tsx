import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginView } from './features/auth/LoginView';
import { AppLayout } from './layouts/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { TelecallerHome } from './features/dashboard/TelecallerHome';
import { LeadListView } from './features/leads/LeadListView';
import { LeadDetailView } from './features/leads/LeadDetailView';
import { CallHistoryView } from './features/calls/CallHistoryView';
import { FollowUpListView } from './features/follow-ups/FollowUpListView';
import { TeamListView } from './features/teams/TeamListView';
import { UserListView } from './features/users/UserListView';
import { RolePermissionsMatrix } from './features/access-control/RolePermissionsMatrix';
import { ReportsView } from './features/reports/ReportsView';
import { AuditTrailView } from './features/audit/AuditTrailView';
import { SettingsView } from './features/settings/SettingsView';

const RootRedirect: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  if (isLoading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role?.slug === 'telecaller') return <Navigate to="/telecaller" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginView />} />

          {/* Root Redirect based on role */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/telecaller" element={<TelecallerHome />} />
            <Route path="/leads" element={<LeadListView />} />
            <Route path="/leads/:id" element={<LeadDetailView />} />
            <Route path="/calls" element={<CallHistoryView />} />
            <Route path="/follow-ups" element={<FollowUpListView />} />
            <Route path="/teams" element={<TeamListView />} />
            <Route path="/users" element={<UserListView />} />
            <Route path="/access-control" element={<RolePermissionsMatrix />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/audit" element={<AuditTrailView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
