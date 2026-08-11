import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';
import styles from './Contact.module.css';

export const Contact: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | [Business Name]</title>
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
                    <p>Ontario, Canada<br/>[Specific City/Region Placeholder]</p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Phone size={24} />
                  </div>
                  <div className={styles.detailText}>
                    <h3>Phone</h3>
                    <p>[Phone Number]</p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Mail size={24} />
                  </div>
                  <div className={styles.detailText}>
                    <h3>Email</h3>
                    <p>[Email Address]</p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Clock size={24} />
                  </div>
                  <div className={styles.detailText}>
                    <h3>Business Hours</h3>
                    <p>Monday - Friday: 9:00 AM - 5:00 PM<br/>Saturday: [Weekend Hours]<br/>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Optional Map Placeholder */}
              <div className={styles.mapPlaceholder}>
                [Google Maps Integration / Service Area Map]
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
