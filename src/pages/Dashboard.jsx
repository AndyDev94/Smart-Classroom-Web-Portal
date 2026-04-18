import { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { 
  Users, 
  BookOpen, 
  Building, 
  GraduationCap, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { 
    classrooms, 
    faculties, 
    subjects, 
    batches, 
    timetables, 
    departments, 
    shifts, 
    attendance, 
    students,
    settings,
    substitutions,
    assignEmergencyFaculty
  } = useAppData();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSubModal, setShowSubModal] = useState(null); // { item, classroom }

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const activeTimetable = timetables.find(t => t.status === 'Approved');

  // Logic to determine current academic slot
  const currentSlotIndex = (() => {
    if (!settings?.startTime) return -1;
    const [startH, startM] = settings.startTime.split(':').map(Number);
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    
    const minutesSinceMidnight = nowH * 60 + nowM;
    const startMinutesSinceMidnight = startH * 60 + startM;
    
    const diff = minutesSinceMidnight - startMinutesSinceMidnight;
    if (diff < 0) return -1; // Before college starts
    
    const slotIdx = Math.floor(diff / settings.slotDurationMinutes);
    return slotIdx < settings.slotsPerDay ? slotIdx : -2; // -2 means college ended
  })();

  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentTime.getDay()];
  const isWorkingDay = settings?.workingDays.includes(currentDay);

  const getSubstitution = (roomId, slot) => {
    return substitutions.find(s => s.roomId === roomId && s.slot === slot && s.day === currentDay);
  };

  const currentLiveClasses = classrooms.map(room => {
    const item = activeTimetable?.items.find(i => i.roomId === room.id && i.day === currentDay && i.slot === currentSlotIndex);
    const sub = getSubstitution(room.id, currentSlotIndex);
    
    return {
      room,
      item,
      substitute: sub ? faculties.find(f => f.id === sub.substituteFacultyId) : null
    };
  });

  const handleSubstitution = (facultyId) => {
    if (!showSubModal) return;
    assignEmergencyFaculty({
      day: currentDay,
      slot: currentSlotIndex,
      roomId: showSubModal.classroom.id,
      batchId: showSubModal.item.batchId,
      originalFacultyId: showSubModal.item.facultyId,
      substituteFacultyId: facultyId,
      date: new Date().toISOString()
    });
    setShowSubModal(null);
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      <div className="page-header">
        <div>
          <h1 className="gradient-text">Institution Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Central Command Center</p>
        </div>
        <div style={{ textAlign: 'left' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
             <Clock size={20} className="gradient-text" /> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
           <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{currentDay}, {currentTime.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Hero Live Monitor Section */}
      <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="glow-effect" style={{ width: '10px', height: '10px', borderRadius: '50%', background: isWorkingDay && currentSlotIndex >= 0 ? 'var(--success)' : 'var(--danger)' }}></div>
          Live Campus Monitor
          {currentSlotIndex >= 0 && <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Ongoing: Slot {currentSlotIndex + 1}</span>}
        </h3>

        {!activeTimetable ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No approved timetable found. Activate a schedule to begin live monitoring.
          </div>
        ) : !isWorkingDay ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Campus is currently closed (Weekend). Monitor will resume on {settings.workingDays[0]}.
          </div>
        ) : currentSlotIndex === -1 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            College starts at {settings.startTime}. Live monitor is on standby.
          </div>
        ) : currentSlotIndex === -2 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Lectures have concluded for today.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classroom</th>
                  <th>Status</th>
                  <th>Ongoing Lecture</th>
                  <th>Batch</th>
                  <th>Faculty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentLiveClasses.map(({ room, item, substitute }) => (
                  <tr key={room.id}>
                    <td><strong>{room.name}</strong></td>
                    <td>
                      <span className={`badge ${item ? 'badge-success' : 'badge-primary'}`} style={{ opacity: item ? 1 : 0.5 }}>
                        {item ? 'Occupied' : 'Vacant'}
                      </span>
                    </td>
                    <td>{item ? subjects.find(s => s.id === item.subjectId)?.name : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{item ? batches.find(b => b.id === item.batchId)?.name : '—'}</td>
                    <td>
                       {item ? (
                         substitute ? (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                             <ShieldCheck size={14} /> {substitute.name} <span style={{ fontSize: '0.7rem' }}>(SUB)</span>
                           </div>
                         ) : (
                           faculties.find(f => f.id === item.facultyId)?.name
                         )
                       ) : '—'}
                    </td>
                    <td>
                      {item && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
                          onClick={() => setShowSubModal({ item, classroom: room })}
                        >
                          <UserPlus size={14} /> Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard title="Departments" value={departments.length} icon={<Building />} color="var(--accent-primary)" />
        <StatCard title="Faculties" value={faculties.length} icon={<Users />} color="var(--accent-secondary)" />
        <StatCard title="Batches" value={batches.length} icon={<GraduationCap />} color="var(--success)" />
        <StatCard title="Students" value={students.length} icon={<Users />} color="#14b8a6" />
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} className="gradient-text" /> 
            Active Timetable Insight
          </h3>
          
          {activeTimetable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Mode</span>
                  <span style={{ fontWeight: 'bold' }}>{activeTimetable.name}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Optimization Score</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{activeTimetable.score}%</span>
               </div>
               <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate(`/app/timetable/${activeTimetable.id}`)}>
                 View Full Repository Alignment <ArrowRight size={16} />
               </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No approved schedule currently in rotation.</p>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <AlertCircle size={20} className="gradient-text" />
             System Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Algorithm Engine</span>
                <span style={{ color: 'var(--success)' }}>V2.1 Scoped</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--success)', borderRadius: '2px' }}></div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cloud Sync</span>
                <span style={{ color: 'var(--success)' }}>Active</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                All institutional data is encrypted and persistent in Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {showSubModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '450px' }}>
             <h3 style={{ marginBottom: '0.5rem' }}>Emergency Faculty Reassign</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
               Assign a substitute teacher for <strong>{showSubModal.classroom.name}</strong> at <strong>Slot {currentSlotIndex+1}</strong>.
             </p>

             <div className="form-group">
               <label className="form-label">Select Substitute Faculty</label>
               <select className="form-control" onChange={(e) => handleSubstitution(e.target.value)} defaultValue="">
                 <option value="" disabled>-- Select Faculty --</option>
                 {faculties.map(f => (
                   <option key={f.id} value={f.id}>{f.name}</option>
                 ))}
               </select>
             </div>

             <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
               <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSubModal(null)}>Cancel</button>
             </div>
          </div>
        </div>
      )}
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
