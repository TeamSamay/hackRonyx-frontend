import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { VerdictConsoleApp } from '@/pages/VerdictConsoleApp';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
          className="h-full w-full"
        >
          <LoginPage />
        </motion.div>
      ) : (
        <motion.div
          key="console"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="h-full w-full"
        >
          <VerdictConsoleApp />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/console" element={<AppContent />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
