
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Discovery from './pages/Discovery';
import ProfileSetup from './pages/ProfileSetup';
import ChatList from './pages/ChatList';
import ChatWindow from './pages/ChatWindow';
import Subscription from './pages/Subscription';
import Matches from './pages/Matches';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import PublicProfile from './pages/PublicProfile';
import { Terms, Privacy, Guidelines } from './pages/Legal';

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guidelines" element={<Guidelines />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={isAuthenticated ? <Discovery /> : <Landing />} />
            <Route path="/profile-setup" element={isAuthenticated ? <ProfileSetup /> : <Navigate to="/login" />} />
            <Route path="/matches" element={isAuthenticated ? <Matches /> : <Navigate to="/login" />} />
            <Route path="/profile/:userId" element={isAuthenticated ? <PublicProfile /> : <Navigate to="/login" />} />
            <Route path="/chat/:userId" element={isAuthenticated ? <ChatWindow /> : <Navigate to="/login" />} />
            <Route path="/chats" element={isAuthenticated ? <ChatList /> : <Navigate to="/login" />} />
            <Route path="/chats" element={isAuthenticated ? <ChatList /> : <Navigate to="/login" />} />
            <Route path="/subscription" element={isAuthenticated ? <Subscription /> : <Navigate to="/login" />} />
            <Route path="/admin-dashboard" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
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
