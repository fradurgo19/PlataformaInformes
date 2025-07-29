import React, { useState } from 'react';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Select } from '../components/atoms/Select';
import { Textarea } from '../components/atoms/Textarea';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { state: authState, updateProfile } = useAuth();
  const user = authState.user;

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [zone, setZone] = useState(user?.zone || '');
  const [brands, setBrands] = useState(user?.brands?.join(', ') || '');
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [rating, setRating] = useState(user?.rating?.toString() || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!fullName || !email) {
      setError('Name and email are required');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validar rating
    const ratingNum = rating ? parseFloat(rating) : undefined;
    if (ratingNum !== undefined && (ratingNum < 0 || ratingNum > 5)) {
      setError('Rating must be between 0 and 5');
      return;
    }
    
    setLoading(true);
    try {
      const brandsArray = brands ? brands.split(',').map(b => b.trim()).filter(b => b) : undefined;
      await updateProfile({ 
        full_name: fullName, 
        email, 
        zone: zone || undefined,
        brands: brandsArray,
        specialty: specialty || undefined,
        rating: ratingNum,
        password: password || undefined 
      });
      setSuccess('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-lg shadow border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            value={user?.username || ''}
            readOnly
            disabled
          />
          <Input
            label="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Zone"
            value={zone}
            onChange={e => setZone(e.target.value)}
            placeholder="e.g., Bogotá, Medellín"
          />
          <Input
            label="Brands (comma separated)"
            value={brands}
            onChange={e => setBrands(e.target.value)}
            placeholder="e.g., CAT, Komatsu, Hitachi"
          />
          <Input
            label="Specialty"
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            placeholder="e.g., Excavadoras, Cargadores"
          />
          <Input
            label="Rating (0-5)"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={e => setRating(e.target.value)}
            placeholder="0.0 to 5.0"
          />
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage; 