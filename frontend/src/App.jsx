import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AiChatInterface from './components/ai/AiChatInterface';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Analytics from './pages/dashboard/Analytics';
import UploadFile from './pages/files/UploadFile';
import MyFiles from './pages/files/MyFiles';
import FileDetails from './pages/files/FileDetails';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import AuthPage from './pages/auth/AuthPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/error/NotFound';
import Unauthorized from './pages/error/Unauthorized';
import TransferHub from './pages/transfer/TransferHub';
import TransferReceive from './pages/transfer/TransferReceive';
import PrivacyPolicy from './pages/legal/Privacy';
import TermsOfUse from './pages/legal/TermsOfUse';
import { useAuth } from './context/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Share2,
  User,
  ShieldCheck,
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const mobileItems = user?.role === 'ADMIN'
    ? [{ name: 'Admin', path: '/admin', icon: <ShieldCheck size={18} /> }]
    : [
        { name: 'Home', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Files', path: '/files', icon: <FolderOpen size={18} /> },
        { name: 'Upload', path: '/upload', icon: <UploadCloud size={18} /> },
        { name: 'Transfer', path: '/transfer', icon: <Share2 size={18} /> },
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
      ];

  const hasUser = Boolean(user);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar className={sidebarOpen ? 'open' : ''} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 mt-16 p-4 sm:p-6 lg:p-8 ${hasUser ? 'pb-24 sm:pb-6' : 'pb-6'}`}>
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {hasUser && (
        <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center lg:hidden pointer-events-none">
          <nav className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/60 dark:border-slate-800/60 shadow-lg rounded-full px-4 py-2 flex items-center gap-1">
            {mobileItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-full text-[10px] font-bold tracking-wide transition-all ` +
                  (isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white')
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

const PublicLayout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar withSidebar={false} />
      <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 pb-6">{children}</main>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <Home />
                  </PublicLayout>
                }
              />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/unauthorized"
                element={
                  <PublicLayout>
                    <Unauthorized />
                  </PublicLayout>
                }
              />
              <Route
                path="/transfer/:sessionId"
                element={
                  <PublicLayout>
                    <TransferReceive />
                  </PublicLayout>
                }
              />
              <Route
                path="/privacy"
                element={
                  <PublicLayout>
                    <PrivacyPolicy />
                  </PublicLayout>
                }
              />
              <Route
                path="/terms"
                element={
                  <PublicLayout>
                    <TermsOfUse />
                  </PublicLayout>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <UploadFile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyFiles />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <FileDetails />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Analytics />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <TransferHub />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <AiChatInterface />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
