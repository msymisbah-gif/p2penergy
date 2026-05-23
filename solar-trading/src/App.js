import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute       from './components/PrivateRoute';
import Layout             from './components/Layout';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import Dashboard          from './pages/Dashboard';
import SellEnergy         from './pages/SellEnergy';
import BuyEnergy          from './pages/BuyEnergy';
import TransactionHistory from './pages/TransactionHistory';
import Profile            from './pages/Profile';
import AdminPage          from './pages/AdminPage';
import NotFound           from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sell"      element={<SellEnergy />} />
              <Route path="/buy"       element={<BuyEnergy />} />
              <Route path="/history"   element={<TransactionHistory />} />
              <Route path="/profile"   element={<Profile />} />
              <Route path="/admin"     element={<AdminPage />} />
            </Route>
          </Route>

          {/* Root → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
