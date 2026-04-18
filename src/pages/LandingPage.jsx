import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Users, Building, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{ padding: '1.5rem 10%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles className="gradient-text" size={28} />
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Smart<span className="gradient-text">Class</span></h1>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/login')}>
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ maxWidth: '800px', width: '100%' }}>
          <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '999px', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            v2.0 • AI-Powered Scheduling
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Intelligent Timetables <br />
            <span className="gradient-text glow-effect" style={{ display: 'inline-block' }}>Without the Hassle.</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
            An advanced constraint-satisfaction engine designed for Higher Education institutions to effortlessly generate clash-free, optimized class schedules.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-xl)', minWidth: '220px' }} onClick={() => navigate('/signup')}>
              Get Started <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: 'var(--radius-xl)', minWidth: '220px' }} onClick={() => navigate('/login')}>
              Sign In Existing
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid-3 animate-fade-in" style={{ marginTop: '5rem', maxWidth: '1000px', width: '100%', animationDelay: '0.2s', opacity: 0 }}>
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block', marginBottom: '1rem' }}>
              <Building size={24} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Resource Optimization</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Maximize utilization of classrooms and laboratories based on real-time capacities.</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(168,85,247,0.1)', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block', marginBottom: '1rem' }}>
              <Calendar size={24} color="var(--accent-secondary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Clash-Free Guarantee</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Advanced algorithms ensure no faculty or batch overlaps across the entire schedule.</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ background: 'rgba(236,72,153,0.1)', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block', marginBottom: '1rem' }}>
              <Users size={24} color="var(--accent-tertiary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Faculty Workloads</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Equitably distribute teaching hours and respect individual subject constraints.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
