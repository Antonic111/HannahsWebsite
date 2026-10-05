import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Classes } from './pages/Classes';
import { Contact } from './pages/Contact';
import { CourseDetail } from './pages/CourseDetail';
import { CourseProvider } from './context/CourseContext';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { CourseManager } from './pages/admin/CourseManager';
import { CourseEditor } from './pages/admin/CourseEditor';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Header />
      <main style={{ flexGrow: 1 }} key={location.pathname} className="page-fade-up">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CourseProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="classes" element={<Classes />} />
                <Route path="classes/:id" element={<CourseDetail />} />
                <Route path="contact" element={<Contact />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="courses/new" element={<CourseEditor />} />
                <Route path="courses/edit/:id" element={<CourseEditor />} />
              </Route>
            </Routes>
          </Router>
        </CourseProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
