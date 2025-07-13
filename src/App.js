import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import KullaniciListesi from "./pages/KullaniciListesi";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Giriş ekranı */}
        <Route path="/" element={<LoginPage />} />

        {/* Korunan yönetici paneli */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Korunan kullanıcı listesi */}
        <Route
          path="/kullanicilar"
          element={
            <ProtectedRoute>
              <KullaniciListesi />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
