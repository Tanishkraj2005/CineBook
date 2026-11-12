import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Route Protections
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Customer Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageCinemas from './pages/admin/ManageCinemas';
import ManageScreens from './pages/admin/ManageScreens';
import ManageShows from './pages/admin/ManageShows';
import ManageBookings from './pages/admin/ManageBookings';
import ManageCustomers from './pages/admin/ManageCustomers';
import AdminSettings from './pages/admin/AdminSettings';
import VerifyTickets from './pages/admin/VerifyTickets';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f1f1f1',
              border: '1px solid #2a2a2a',
              fontSize: '13px',
              borderRadius: '8px',
            },
          }}
        />

        <Routes>
          {/* Customer Facing Web Platform */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/shows/:showId/seats" element={<SeatSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Customer Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Administrator Dashboard Platform */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movies" element={<ManageMovies />} />
            <Route path="cinemas" element={<ManageCinemas />} />
            <Route path="screens" element={<ManageScreens />} />
            <Route path="shows" element={<ManageShows />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="verify-tickets" element={<VerifyTickets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
