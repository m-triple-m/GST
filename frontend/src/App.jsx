import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Auth
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Route guard
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import PageLayout from './layouts/PageLayout';
import AdminLayout from './layouts/AdminLayout';
import DashboardLayout from './layouts/DashboardLayout';

// ── Public pages ──
import HomePage from './pages/public/HomePage2';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import MembershipPage from './pages/public/MembershipPage';
import ExecutiveBoardPage from './pages/public/ExecutiveBoardPage';
import ExecutiveProfilePage from './pages/public/ExecutiveProfilePage';
import ResourcesPage from './pages/public/ResourcesPage';
import DonatePage from './pages/public/DonatePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import SponsorPage from './pages/public/SponsorPage';
import LoginPage from './pages/public/LoginPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';

// ── Member pages (requires login) ──
import DashboardPage from './pages/member/DashboardPage';
import ManageEventsPage from './pages/member/ManageEventsPage';
import ScheduleEventPage from './pages/member/ScheduleEventPage';
import RegisterEventPage from './pages/member/RegisterEventPage';
import CartPage from './pages/member/CartPage';
import CheckoutPage from './pages/member/CheckoutPage';
import SettingsPage from './pages/member/SettingsPage';

// ── Admin pages (requires admin role) ──
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            {/* ── PUBLIC — wrapped in Navbar/Footer ── */}
            <Route element={<PageLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/executive" element={<ExecutiveBoardPage />} />
              <Route path="/executive/:id" element={<ExecutiveProfilePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/sponsor" element={<SponsorPage />} />
            </Route>

            {/* ── PUBLIC — fullscreen (no Navbar/Footer) ── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ── MEMBER — login required ── */}
            <Route element={<ProtectedRoute allowedRoles={['member', 'executive', 'admin']} />}>

              {/* Dashboard — all members */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/settings" element={<SettingsPage />} />
              </Route>

              {/* Event management — executive + admin only */}
              <Route element={<ProtectedRoute allowedRoles={['executive', 'admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard/manage-events" element={<ManageEventsPage />} />
                  <Route path="/dashboard/events/new" element={<ScheduleEventPage />} />
                  <Route path="/dashboard/events/:id/edit" element={<ScheduleEventPage />} />
                  <Route path="/dashboard/members" element={<AdminMembers />} />
                </Route>
              </Route>

              {/* Pages that reuse the public Navbar/Footer — all members */}
              <Route element={<PageLayout />}>
                <Route path="/events/:id/register" element={<RegisterEventPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Route>
            </Route>

            {/* ── ADMIN — admin role required ── */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/profile" element={<SettingsPage />} />
              </Route>
            </Route>


          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
