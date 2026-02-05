import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Static Import (Critical for LCP on Landing)
import Landing from './pages/Landing';

// Components
import PageLoader from './components/PageLoader';

// Lazy Imports
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Discovery = lazy(() => import('./pages/Discovery'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const ChatList = lazy(() => import('./pages/ChatList'));
const PublicChat = lazy(() => import('./pages/PublicChat'));
const ChatWindow = lazy(() => import('./pages/ChatWindow'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Matches = lazy(() => import('./pages/Matches'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));

// Lazy load Legal pages
const Terms = lazy(() => import('./pages/Legal').then(module => ({ default: module.Terms })));
const Privacy = lazy(() => import('./pages/Legal').then(module => ({ default: module.Privacy })));
const Guidelines = lazy(() => import('./pages/Legal').then(module => ({ default: module.Guidelines })));

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/guidelines" element={<Guidelines />} />

            {/* Landing Route - Standalone (No AppLayout overhead) */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <AppLayout>
                    <Discovery />
                  </AppLayout>
                ) : (
                  <Landing />
                )
              }
            />

            {/* Authenticated App Routes */}
            <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/chat/:userId" element={<ChatWindow />} />
              <Route path="/public-chat" element={<PublicChat />} />
              <Route path="/chats" element={<ChatList />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Slide}
          className="mt-4 px-4 sm:px-0"
          toastClassName="!rounded-2xl !shadow-xl !backdrop-blur-md !bg-white/90 !text-slate-800 !font-medium !border !border-slate-100/50"
          bodyClassName="!p-0 !m-0 !flex !items-center !gap-3"
        />
      </div>
    </Router>
  );
}

export default App;
