import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, MapPin, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <h3>
              <HeartPulse size={24} color="var(--color-secondary)" />
              Ready to Respond
            </h3>
            <p>
              Professional BLS and CPR training in Ontario, Canada. Learn the skills to save a life today.
            </p>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} Ready to Respond. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.links}>
            <h4>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/classes">Classes & Pricing</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.contact}>
            <h4>Contact</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <MapPin size={18} />
                <span>Ontario, Canada (Service Area)</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={18} />
                <span>(416) 844-4843</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={18} />
                <span>readytorespond4u@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
