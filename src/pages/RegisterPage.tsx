import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/templates/AuthLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Solo se permite crear usuarios con rol viewer
  const roleOptions = [
    { value: 'viewer', label: 'Visualizador (Solo propios reportes)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !fullName || !email || !password || !confirmPassword || !role) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await apiService.register({ username, full_name: fullName, email, password, role });
      if (response.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-sm">
          <strong>Nota:</strong> Solo se pueden crear usuarios con rol de Visualizador. 
          Los usuarios visualizadores pueden ver únicamente sus propios reportes.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
        />
        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Enter your full name"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roleOptions}
          required
          disabled={true}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Repeat your password"
        />
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={!username || !fullName || !email || !password || !confirmPassword || !role}
        >
          Register
        </Button>
        <div className="text-center text-sm text-slate-600">
          <span>Already have an account? </span>
          <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage; 