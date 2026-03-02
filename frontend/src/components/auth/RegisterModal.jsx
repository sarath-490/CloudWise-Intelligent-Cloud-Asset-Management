import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordValidation, { validatePassword } from './PasswordValidation';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onSuccess }) => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prevent opening if already authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password does not meet requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setError('');
        onSuccess();
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Account"
      size="small"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={error && !formData.name.trim() ? 'Name is required' : ''}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={
            error && !formData.email.trim()
              ? 'Email is required'
              : error && formData.email && !validateEmail(formData.email)
              ? 'Please enter a valid email'
              : ''
          }
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {formData.password && (
            <PasswordValidation password={formData.password} />
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={
            formData.confirmPassword && formData.password !== formData.confirmPassword
              ? 'Passwords do not match'
              : ''
          }
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="large"
          loading={loading}
          disabled={!isFormValid()}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
        >
          Sign in
        </button>
      </div>
    </Modal>
  );
};

export default RegisterModal;
