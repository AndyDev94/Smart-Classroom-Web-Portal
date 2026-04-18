import { useAppData } from '../context/AppDataContext';
import { Users, BookOpen, Building, GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { classrooms, faculties, subjects, batches, timetables, departments, shifts, attendance, students } = useAppData();
  const navigate = useNavigate();

  const activeTimetables = timetables.filter(t => t.status === 'Approved').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text">Institution Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of all scheduling resources</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/generate')}>
          <ArrowRight size={18} /> New Schedule
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard title="Departments" value={departments.length} icon={<Building />} color="var(--accent-primary)" />
        <StatCard title="Faculties" value={faculties.length} icon={<Users />} color="var(--accent-secondary)" />
        <StatCard title="Batches" value={batches.length} icon={<GraduationCap />} color="var(--success)" />
        <StatCard title="Students" value={students.length} icon={<Users />} color="#14b8a6" />
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard title="Classrooms" value={classrooms.length} icon={<BookOpen />} color="var(--warning)" />
        <StatCard title="Shifts" value={shifts.length} icon={<BookOpen />} color="#e879f9" />
        <StatCard title="Attendance Logs" value={attendance.length} icon={<Users />} color="#38bdf8" />
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
            Recent Timetables
          </h3>
          
          {timetables.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No timetables generated yet.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {timetables.slice(-5).map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace' }}>#{t.id.slice(0,6)}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${t.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/app/timetable/${t.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Algorithm Engine</span>
                <span style={{ color: 'var(--success)' }}>Online</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--success)', borderRadius: '2px' }}></div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Resource Adequacy</span>
                <span style={{ color: faculties.length > 0 && classrooms.length > 0 ? 'var(--success)' : 'var(--warning)' }}>
                  {faculties.length > 0 && classrooms.length > 0 ? 'Good' : 'Needs Data'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {faculties.length === 0 ? 'Add faculties and classrooms in Master Data to generate schedules.' : 'Resources are sufficient for trial generation.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `3px solid ${color}` }}>
      <div style={{ padding: '1rem', background: `color-mix(in srgb, ${color} 20%, transparent)`, borderRadius: '0.75rem', color: color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1.2' }}>{value}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</div>
      </div>
    </div>
  );
}
