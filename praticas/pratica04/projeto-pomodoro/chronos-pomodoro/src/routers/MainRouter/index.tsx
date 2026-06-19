import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router';
import { AboutPomodoro } from '../../pages/AboutPomodoro';
import { NotFound } from '../../pages/NotFound';
import { Home } from '../../pages/Home';
import { useEffect } from 'react';
import { History } from '../../pages/History';
import { Settings } from '../../pages/Settings';
import { LoginPage } from '../../pages/Login';
import { useAuth } from '../../contexts/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/login/' replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoutes() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
}

export function MainRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoutes />}>
          <Route path='/login/' element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path='/' element={<Home />} />
          <Route path='/history/' element={<History />} />
          <Route path='/settings/' element={<Settings />} />
          <Route path='/about-pomodoro/' element={<AboutPomodoro />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
}
