import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * PageLayout — wraps public pages with the shared Navbar and Footer.
 * Uses <Outlet /> so it works as a React Router v6 nested layout route.
 */
export default function PageLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
