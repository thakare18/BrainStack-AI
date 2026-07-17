import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthCardHeader from '../components/auth/AuthCardHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthLayout from '../components/auth/AuthLayout';
import GlassCard from '../components/auth/GlassCard';
import PasswordInput from '../components/auth/PasswordInput';
import SocialAuthActions from '../components/auth/SocialAuthActions';

const Register = () => {
  const [form, setForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  }

  function getValidationError() {
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }

    if (!form.agreed) {
      return 'Please agree to the Terms and Privacy Policy to continue.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(
        'http://localhost:3000/api/auth/register',
        {
          email: form.email.trim(),
          fullName: {
            firstName: form.firstname.trim(),
            lastName: form.lastname.trim(),
          },
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <GlassCard aria-labelledby="register-heading">
        <AuthCardHeader
          heading="Create Your BrainStack Account"
          subtitle="Start building smarter conversations with AI."
        />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-form__error">{error}</p>}

          <div className="auth-form__grid">
            <AuthInput
              id="register-firstname"
              label="First Name"
              icon="user"
              name="firstname"
              autoComplete="given-name"
              placeholder="Jane"
              value={form.firstname}
              onChange={handleChange}
              required
            />
            <AuthInput
              id="register-lastname"
              label="Last Name"
              icon="user"
              name="lastname"
              autoComplete="family-name"
              placeholder="Doe"
              value={form.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <AuthInput
            id="register-email"
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
            id="register-password"
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <PasswordInput
            id="register-confirm-password"
            label="Confirm Password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />

          <label className="auth-checkbox" htmlFor="register-agreed">
            <input
              id="register-agreed"
              name="agreed"
              type="checkbox"
              checked={form.agreed}
              onChange={handleChange}
              required
            />
            <span>
              I agree to the <Link className="auth-link" to="/register">Terms</Link> and{' '}
              <Link className="auth-link" to="/register">Privacy Policy</Link>.
            </span>
          </label>

          <button type="submit" className="auth-primary-button" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <SocialAuthActions />

        <p className="auth-card-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
};

export default Register;
