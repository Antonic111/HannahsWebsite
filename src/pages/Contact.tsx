import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';
import styles from './Contact.module.css';

export const Contact: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | Ready to Respond</title>
        <meta name="description" content="Get in touch with us to book a class, request group training, or ask any questions about our BLS and CPR certification courses." />
      </Helmet>

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            
            {/* Contact Information */}
            <div className={styles.infoSection}>
              <h2>Get In Touch</h2>
              <p>
                Have questions about a course? Need to schedule group training at your facility? 
                Reach out to us using the form or the contact details below. We'll get back to you promptly.
              </p>

              <div className={styles.contactDetails}>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <MapPin size={24} />
                  </div>
                  <div className={styles.detailText}>
                    <h3>Service Area</h3>
                    <p>Ontario, Canada</p>
                  </div>
                </div>

                <a href="tel:4168444843" className={styles.detailItem} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.detailIcon}>
                    <Phone size={24} />
                  </div>
                  <div className={styles.detailText}>
                    <h3>Phone</h3>
                    <p style={{ textDecoration: 'underline' }}>(416) 844-4843</p>
                  </div>
                </a>

                <a href="mailto:readytorespond4u@gmail.com" className={styles.detailItem} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.detailIcon}>
                    <Mail size={24} />
                  </div>
                  <div className={styles.detailText}>
                    <h3>Email</h3>
                    <p style={{ textDecoration: 'underline' }}>readytorespond4u@gmail.com</p>
                  </div>
                </a>

              </div>

            </div>

            {/* Contact Form */}
            <div>
              <h2 className="sr-only">Contact Form</h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
