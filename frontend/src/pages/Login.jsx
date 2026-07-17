import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthCardHeader from '../components/auth/AuthCardHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthLayout from '../components/auth/AuthLayout';
import GlassCard from '../components/auth/GlassCard';
import PasswordInput from '../components/auth/PasswordInput';
import SocialAuthActions from '../components/auth/SocialAuthActions';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await axios.post(
        'http://localhost:3000/api/auth/login',
        {
          email: form.email.trim(),
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to sign in. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <GlassCard aria-labelledby="login-heading">
        <AuthCardHeader
          heading="Welcome Back"
          subtitle="Continue your AI conversations."
        />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-form__error">{error}</p>}

          <AuthInput
            id="login-email"
            label="Email"
            icon="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <PasswordInput
            id="login-password"
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="auth-form__row">
            <span>Secure access to BrainStack AI</span>
            <Link className="auth-link" to="/login" aria-label="Forgot password">
              Forgot Password
            </Link>
          </div>

          <button type="submit" className="auth-primary-button" disabled={submitting}>
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <SocialAuthActions />

        <p className="auth-card-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
};

export default Login;
