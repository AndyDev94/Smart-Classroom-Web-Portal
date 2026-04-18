import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Wait a moment for auth context to update contextually if needed, but it should be fast
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side banner */}
      <div className="auth-banner">
        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
          Welcome Back to<br />
          <span className="gradient-text glow-effect" style={{ display: 'inline-block' }}>SmartClass</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>
          Access your institution's central scheduling dashboard and intelligently deploy resources.
        </p>
      </div>

      {/* Right side form */}
      <div className="auth-form-side">
        <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
            <Sparkles className="gradient-text" size={32} />
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>SmartClass</span>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', textAlign: 'center' }}>Sign in to account</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              Enter your credentials to access the admin portal.
            </p>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    style={{ paddingLeft: '2.75rem' }} 
                    placeholder="admin@college.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ paddingLeft: '2.75rem' }} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }} disabled={loading}>
                {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '500' }}>Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
