import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { CheckCircle, XCircle, ArrowLeft, Printer, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function TimetableViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { timetables, updateTimetableStatus, settings, batches, subjects, faculties, classrooms } = useAppData();
  
  const timetable = timetables.find(t => t.id === id);
  const [viewFilter, setViewFilter] = useState('all'); // could be specific batch id

  if (!timetable) {
    return <div className="animate-fade-in"><div className="glass-card">Timetable not found.</div></div>;
  }

  const { items, status, errors } = timetable;
  const configItem = items.find(i => i.isConfig) || { slotDuration: settings.slotDurationMinutes || 60, breakSlot: -1, startTime: settings.startTime || '09:00' };
  const actualItems = items.filter(i => !i.isConfig);

  const formatTime = (minutesAdded) => {
    const [h, m] = configItem.startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutesAdded, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render grid helper
  const renderCell = (day, slot) => {
    if (slot === configItem.breakSlot) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed var(--warning)', borderRadius: '0.25rem', color: 'var(--warning)', fontWeight: 'bold' }}>
          LUNCH<br/>BREAK
        </div>
      );
    }

    // find items for this slot
    let slotItems = actualItems.filter(i => i.day === day && i.slot === slot);
    
    if (viewFilter !== 'all') {
      slotItems = slotItems.filter(i => i.batchId === viewFilter);
    }

    if (slotItems.length === 0) return <div style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>-</div>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {slotItems.map((item, idx) => {
          const batch = batches.find(b => b.id === item.batchId)?.name || 'Unknown Batch';
          const subject = subjects.find(s => s.id === item.subjectId)?.code || 'Subj';
          const fac = faculties.find(f => f.id === item.facultyId)?.name || 'Fac';
          const room = classrooms.find(r => r.id === item.roomId)?.name || 'Room';
          
          return (
            <div key={idx} style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              borderLeft: '2px solid var(--accent-primary)',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.8rem',
              lineHeight: '1.4'
            }}>
              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{subject}</strong>
              <div style={{ color: 'var(--text-secondary)' }}>{batch}</div>
              <div style={{ color: 'var(--accent-secondary)' }}>{fac}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{room}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="gradient-text">Schedule #{timetable.id.slice(0,6).toUpperCase()}</h1>
            <span className={`badge ${status === 'Approved' ? 'badge-success' : status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
              {status}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Generated on {new Date(timetable.createdAt).toLocaleString()}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {status === 'Pending' && (
            <>
              <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => updateTimetableStatus(id, 'Rejected')}>
                <XCircle size={18} /> Reject
              </button>
              <button className="btn btn-primary" style={{ background: 'var(--success)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }} onClick={() => updateTimetableStatus(id, 'Approved')}>
                <CheckCircle size={18} /> Approve Schedule
              </button>
            </>
          )}
          {status !== 'Pending' && (
            <button className="btn btn-outline" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }} onClick={() => updateTimetableStatus(id, 'Pending')}>
              <AlertTriangle size={18} /> Move to Review (Unlock)
            </button>
          )}
          <button className="btn btn-secondary">
             <Printer size={18} /> Print / Export
          </button>
        </div>
      </div>

      {errors && errors.length > 0 && (
         <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: '2rem' }}>
           <h4 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
             <AlertTriangle size={18} /> Algorithm Warnings
           </h4>
           <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
             {errors.map((e, i) => <li key={i}>{e}</li>)}
           </ul>
         </div>
      )}

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Interactive Grid View</h3>
          <select className="form-control" style={{ width: 'auto' }} value={viewFilter} onChange={e => setViewFilter(e.target.value)}>
            <option value="all">View All Batches (Master)</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table className="data-table" style={{ minWidth: '1000px' }}>
             <thead>
               <tr>
                 <th style={{ width: '100px' }}>Day \ Slot</th>
                 {Array.from({ length: settings.slotsPerDay }).map((_, i) => (
                   <th key={i}>
                     Slot {i + 1}
                     <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                       {formatTime(i * configItem.slotDuration)} - {formatTime((i + 1) * configItem.slotDuration)}
                     </div>
                   </th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {settings.workingDays.map(day => (
                 <tr key={day}>
                   <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{day}</td>
                   {Array.from({ length: settings.slotsPerDay }).map((_, slot) => (
                     <td key={slot} style={{ verticalAlign: 'top', minWidth: '150px' }}>
                       {renderCell(day, slot)}
                     </td>
                   ))}
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
