import { Navigate, Route, Routes } from 'react-router';
import { Layout39 } from '@/components/layouts/layout-39';
import { Layout39Page } from '@/pages/layout-39/page';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ProtectedRoute } from '@/components/auth/protected-route';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout39 />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Layout39Page />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
