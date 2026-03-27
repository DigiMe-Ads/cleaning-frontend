import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClientDashboard from './pages/client/ClientDashboard';
import MyProperties from './pages/client/MyProperties';
import AdminDashboard from './pages/admin/Dashboard';
import BookingsByDate from './pages/admin/BookingsByDate';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid #E8E2D9',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Client routes */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['client']}>
              <Layout><ClientDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/client/properties" element={
            <ProtectedRoute allowedRoles={['client']}>
              <Layout><MyProperties /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/calendar" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><BookingsByDate /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;