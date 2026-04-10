import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Code2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithEmail, register, loginAsGuest } = useAuth();
  const { addToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await register(form.username, form.email, form.password);
        addToast('Account created successfully!', 'success');
      } else {
        await loginWithEmail(form.email, form.password);
        addToast('Welcome back!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    addToast('Logged in as guest', 'info');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-cp-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cp-primary to-cp-secondary">
            <Code2 size={22} className="text-white" />
          </div>
          <span className="text-2xl font-heading font-bold text-cp-text">
            trak<span className="text-cp-primary">CP</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-cp-card rounded-xl p-8 border border-cp-border">
          <h2 className="text-xl font-heading font-bold text-cp-text text-center mb-1">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-cp-muted text-center mb-6">
            {isRegister
              ? 'Sign up to sync your dashboard across devices'
              : 'Sign in to access your dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username — only for register */}
            {isRegister && (
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted"
                />
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cp-bg border border-cp-border text-cp-text placeholder-cp-muted text-sm focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-cp-bg border border-cp-border text-cp-text placeholder-cp-muted text-sm focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-muted"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-cp-bg border border-cp-border text-cp-text placeholder-cp-muted text-sm focus:outline-none focus:border-cp-primary focus:ring-1 focus:ring-cp-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cp-muted hover:text-cp-text"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cp-primary to-cp-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-cp-border" />
            <span className="text-xs text-cp-muted">or</span>
            <div className="flex-1 h-px bg-cp-border" />
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            className="w-full py-3 rounded-xl border border-cp-border text-cp-muted text-sm font-medium hover:text-cp-text hover:border-cp-primary/50 transition-colors"
          >
            Continue as Guest
          </button>

          {/* Toggle Login/Register */}
          <p className="text-center text-sm text-cp-muted mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-cp-primary hover:underline font-medium"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Back to Landing */}
        <p className="text-center text-sm text-cp-muted mt-4">
          <Link to="/" className="hover:text-cp-text transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
