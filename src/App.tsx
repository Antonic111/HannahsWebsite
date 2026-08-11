import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Classes } from './pages/Classes';
import { Contact } from './pages/Contact';
import { CourseProvider } from './context/CourseContext';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { CourseManager } from './pages/admin/CourseManager';
import { CourseEditor } from './pages/admin/CourseEditor';

const PublicLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header />
    <main style={{ flexGrow: 1 }}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <CourseProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="classes" element={<Classes />} />
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
    </HelmetProvider>
  );
}

export default App;
