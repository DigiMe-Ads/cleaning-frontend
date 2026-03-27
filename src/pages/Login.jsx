import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/client');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>

      {/* Left panel */}
      <div style={{
        width: '45%', minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--espresso) 0%, var(--mahogany) 60%, #3D1F0E 100%)',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-left">

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '280px', height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,98,45,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '80px', left: '-40px',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', right: '100px',
          width: '160px', height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,98,45,0.1) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '42px', height: '42px',
            background: 'linear-gradient(135deg, var(--terracotta), var(--amber))',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(196,98,45,0.5)',
          }}>
            <Home size={20} color="white" />
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px', fontWeight: '600',
              color: 'white', lineHeight: 1,
            }}>CleanSync</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
              PROPERTY MANAGEMENT
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative' }}>
          <p style={{
            fontSize: '12px', fontWeight: '500',
            letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--amber)', marginBottom: '20px',
          }}>
            ✦ Welcome back
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 3.5vw, 52px)',
            fontWeight: '600',
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Schedule cleaning,<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--amber), var(--gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              simplified.
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '340px' }}>
            Manage property checkouts, cleaning schedules, and client bookings — all from one beautiful dashboard.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
          {[
            { value: '500+', label: 'Properties managed' },
            { value: '98%', label: 'On-time cleans' },
            { value: '24/7', label: 'Access anytime' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px', fontWeight: '600',
                color: 'white', lineHeight: 1,
              }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px',
          animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          {/* Mobile logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '40px',
          }} className="mobile-logo">
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, var(--terracotta), var(--amber))',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Home size={18} color="white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px', fontWeight: '600',
              color: 'var(--espresso)',
            }}>CleanSync</span>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '34px', fontWeight: '600',
              color: 'var(--espresso)', lineHeight: 1.15,
              marginBottom: '8px',
            }}>
              Sign in
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--warm-400)' }}>
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Email address"
              type="email"
              name="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              loading={loading}
              style={{ width: '100%', marginTop: '8px', padding: '14px', fontSize: '15px' }}
            >
              Sign in to CleanSync
            </Button>
          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--warm-200)' }} />
            <p style={{ fontSize: '12px', color: 'var(--warm-300)' }}>New here?</p>
            <div style={{ flex: 1, height: '1px', background: 'var(--warm-200)' }} />
          </div>

          <Link to="/signup" style={{ textDecoration: 'none', display: 'block' }}>
            <Button
              variant="secondary"
              style={{ width: '100%', padding: '13px', fontSize: '14px' }}
            >
              Create an account
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;