import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — layout route that guards child routes by role.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['member', 'admin']} />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * @param {string[]} allowedRoles - roles permitted to access children
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to /login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to /unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Access granted → render matched child route
  return <Outlet />;
}
