import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLogin.module.css';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter your password.');
      inputRef.current?.focus();
      return;
    }

    const success = login(password);
    if (!success) {
      setError('Incorrect password. Access denied.');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <Helmet>
        <title>Admin Login | Ready to Respond</title>
      </Helmet>

      <div className={styles.card}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <Lock size={26} />
        </div>

        <span className={styles.brand}>READY TO RESPOND</span>
        <h1 className={styles.title}>Admin Portal</h1>
        <p className={styles.subtitle}>
          This section is restricted. Enter the administrator password to manage courses and pricing.
        </p>

        {error && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="adminPassword" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                ref={inputRef}
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                className={styles.passwordInput}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            <span>Unlock Admin Portal</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.backLinkWrapper}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
