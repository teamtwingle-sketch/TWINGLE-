import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

// Static Import (Critical for LCP on Landing and SEO Pages)
import Landing from './pages/Landing';
import SeoLandingPage from './pages/SeoLandingPage';
import DistrictDatingPage from './pages/DistrictDatingPage';

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
import { Terms, Privacy, Guidelines, Safety } from './pages/Legal';

// Lazy Utility Components
const GlobalToast = lazy(() => import('./components/GlobalToast'));
const GoogleAuthWrapper = lazy(() => import('./components/GoogleAuthWrapper'));

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <GoogleAuthWrapper>
                <Login />
              </GoogleAuthWrapper>
            } />
            <Route path="/register" element={
              <GoogleAuthWrapper>
                <Register />
              </GoogleAuthWrapper>
            } />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/download" element={<Navigate to="/" replace />} />

            {/* Programmatic SEO Routes */}
            <Route path="/mallu-dating-app" element={<SeoLandingPage forcedSlug="mallu-dating-app" />} />
            <Route path="/mallu-dating-website" element={<SeoLandingPage forcedSlug="mallu-dating-website" />} />
            <Route path="/malayalis-dating-app" element={<SeoLandingPage forcedSlug="malayalis-dating-app" />} />
            <Route path="/malayalam-dating-app" element={<SeoLandingPage forcedSlug="malayalam-dating-app" />} />
            <Route path="/best-mallu-dating-app" element={<SeoLandingPage forcedSlug="best-mallu-dating-app" />} />
            <Route path="/affordable-dating-app-for-mallus" element={<SeoLandingPage forcedSlug="affordable-dating-app-for-mallus" />} />
            <Route path="/dating/:slug" element={<DistrictDatingPage />} />

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
          <GlobalToast />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
