import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute       from './components/PrivateRoute';
import Layout             from './components/Layout';
import LoginPage          from './pages/LoginPage';
import Dashboard          from './pages/Dashboard';
import SellEnergy         from './pages/SellEnergy';
import BuyEnergy          from './pages/BuyEnergy';
import TransactionHistory from './pages/TransactionHistory';
import Profile            from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sell"      element={<SellEnergy />} />
              <Route path="/buy"       element={<BuyEnergy />} />
              <Route path="/history"   element={<TransactionHistory />} />
              <Route path="/profile"   element={<Profile />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
