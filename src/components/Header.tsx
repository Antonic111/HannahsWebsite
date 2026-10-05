import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Classes & Pricing', path: '/classes' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <img src="/cpr_logo.png" alt="Ready to Respond Logo" className={styles.logoImage} />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${
                location.pathname === link.path ? styles.navLinkActive : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Full Viewport Menu */}
      <div 
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className={styles.mobileMenuHeader}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <img src="/cpr_logo.png" alt="Ready to Respond Logo" className={styles.logoImageMobile} />
          </Link>
          <button
            className={styles.mobileCloseBtn}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>

        <nav className={styles.mobileNavLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.mobileNavLink} ${
                location.pathname === link.path ? styles.mobileNavLinkActive : ''
              }`}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}

          <div className={styles.mobileMenuFooter}>
            <Link 
              to="/contact" 
              className="btn btn-secondary" 
              onClick={closeMenu}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              Contact / Book Class
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
