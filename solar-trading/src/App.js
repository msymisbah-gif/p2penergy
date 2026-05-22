import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute    from './components/PrivateRoute';
import Layout          from './components/Layout';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import SellPage        from './pages/SellPage';
import BuyPage         from './pages/BuyPage';
import HistoryPage     from './pages/HistoryPage';
import ProfilePage     from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sell"      element={<SellPage />} />
              <Route path="/buy"       element={<BuyPage />} />
              <Route path="/history"   element={<HistoryPage />} />
              <Route path="/profile"   element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
