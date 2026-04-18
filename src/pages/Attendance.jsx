import { useState, useEffect, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { CheckCircle, Users, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const CameraScanner = ({ itemId, batchStudents, onMatch }) => {
  const latestBatchStudents = useRef(batchStudents);
  const latestOnMatch = useRef(onMatch);

  useEffect(() => {
    latestBatchStudents.current = batchStudents;
    latestOnMatch.current = onMatch;
  }, [batchStudents, onMatch]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      `qr-reader-${itemId}`,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        if (!decodedText) return;
        const student = latestBatchStudents.current.find(s => 
          (s.roll_number || "").toLowerCase() === decodedText.toLowerCase() ||
          (s.name || "").toLowerCase() === decodedText.toLowerCase()
        );
        if (student) {
          latestOnMatch.current(student.id);
        } else {
          console.warn("Student PRN not matched:", decodedText);
        }
      },
      (error) => {
        // quiet fail on individual scan frames
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [itemId]);

  return <div id={`qr-reader-${itemId}`} style={{ width: '100%', maxWidth: '400px', margin: '1rem auto' }}></div>;
};

export default function Attendance() {
  const { timetables, batches, students, logAttendance, attendance, settings, subjects, faculties } = useAppData();
  
  // Find an active/approved timetable to track attendance for
  const activeTimetable = timetables.find(t => t.status === 'Approved') || timetables[0];
  
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedSlot, setSelectedSlot] = useState("0");

  const [formState, setFormState] = useState({});
  const [barcodeInputs, setBarcodeInputs] = useState({});
  const [activeScanner, setActiveScanner] = useState(null);

  const configItem = activeTimetable?.items.find(i => i.isConfig) || { 
    slotDuration: settings?.slotDurationMinutes || 60, 
    startTime: settings?.startTime || '09:00' 
  };

  const formatTime = (minutesAdded) => {
    if (!configItem.startTime) return "";
    const [h, m] = configItem.startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutesAdded, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeTimetable) {
    return (
      <div className="animate-fade-in page-header">
        <h1 className="gradient-text">Detailed Attendance Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>You need to generate and approve a timetable first before tracking attendance.</p>
      </div>
    );
  }

  // Filter classes happening on the selected day and slot
  const scheduledClasses = activeTimetable.items.filter(
    item => item.day === selectedDay && item.slot === parseInt(selectedSlot)
  );

  const getBatchName = (batchId) => batches.find(b => b.id === batchId)?.name || 'Unknown Batch';
  const getBatchStudents = (batchId) => students.filter(s => s.batch_id === batchId);

  const toggleStudentAttendance = (itemId, studentId) => {
    setFormState(prev => {
      const currentList = prev[itemId] || [];
      if (currentList.includes(studentId)) {
        return { ...prev, [itemId]: currentList.filter(id => id !== studentId) };
      } else {
        return { ...prev, [itemId]: [...currentList, studentId] };
      }
    });
  };

  const handleCameraMatch = (itemId, studentId) => {
    setFormState(prev => {
      const currentList = prev[itemId] || [];
      if (!currentList.includes(studentId)) {
        return { ...prev, [itemId]: [...currentList, studentId] };
      }
      return prev;
    });
  };

  const handleBarcodeKeyDown = (e, itemId, batchStudents) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const barcode = (barcodeInputs[itemId] || "").trim();
      if (!barcode) return;
      
      const student = batchStudents.find(s => 
        (s.roll_number || "").toLowerCase() === barcode.toLowerCase() ||
        (s.name || "").toLowerCase() === barcode.toLowerCase()
      );
      
      if (student) {
        setFormState(prev => {
          const currentList = prev[itemId] || [];
          if (!currentList.includes(student.id)) {
            return { ...prev, [itemId]: [...currentList, student.id] };
          }
          return prev;
        });
      } else {
        alert(`Student PRN "${barcode}" not recognized for this class roster.`);
      }
      
      // Clear input instantly globally for this item
      setBarcodeInputs(prev => ({ ...prev, [itemId]: '' }));
    }
  };

  const markAllPresent = (itemId, batchStudents) => {
    setFormState(prev => ({
      ...prev,
      [itemId]: batchStudents.map(s => s.id)
    }));
  };

  const submitAttendance = async (item) => {
    const presentStudents = formState[item.id] || [];
    const date = new Date().toISOString();
    
    await logAttendance({
      timetable_id: activeTimetable.id,
      batch_id: item.batchId,
      day: item.day,
      slot: item.slot,
      present_student_ids: presentStudents,
      date: date
    });
    
    alert('Attendance ledger successfully committed to database!');
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1 className="gradient-text">Granular Attendance Ledger</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track individual student participation across all active sessions</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label">Active Timetable</label>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{activeTimetable.name}</div>
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">Select Day</label>
          <select className="form-control" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">Select Slot</label>
          <select className="form-control" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
            {[...Array(settings?.slotsPerDay || 8)].map((_, s) => {
              const sessions = activeTimetable.items.filter(i => i.day === selectedDay && i.slot === s && !i.isConfig);
              const time = formatTime(s * (configItem.slotDuration || 60));
              let label = `Slot ${s + 1} (${time})`;
              
              if (sessions.length > 0) {
                const sessionDetails = sessions.map(sess => {
                  const subject = subjects.find(sub => sub.id === sess.subjectId);
                  const faculty = faculties.find(f => f.id === sess.facultyId);
                  return `${subject?.name || 'Unknown'} (${faculty?.name || 'Unknown'})`;
                }).join(' | ');
                label += ` - ${sessionDetails}`;
              } else {
                label += ` - [Empty]`;
              }
              
              return <option key={s} value={s}>{label}</option>;
            })}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Classes Scheduled for {selectedDay}, Slot {parseInt(selectedSlot) + 1}</h3>
        
        {scheduledClasses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
            No classes are scheduled for this day and slot.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {scheduledClasses.map(item => {
              const bName = getBatchName(item.batchId);
              const batchStudents = getBatchStudents(item.batchId);
              const presentList = formState[item.id] || [];
              
              return (
                <div key={item.id} className="glass-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--accent-primary)' }}>{item.subjectName}</h4>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {bName} • Room: {item.roomName} • Prof: {item.facultyName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {presentList.length} / {batchStudents.length} Present
                      </div>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                        onClick={() => markAllPresent(item.id, batchStudents)}
                      >
                        Mark All Present
                      </button>
                    </div>
                  </div>

                  {batchStudents.length > 0 && (
                     <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                       <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: activeScanner === item.id ? '1rem' : '0' }}>
                         <div style={{ flex: 1 }}>
                           <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>Fast-Track with Barcode / PRN Scanner</label>
                           <input 
                             type="text" 
                             className="form-control" 
                             placeholder="Scan student ID card via USB scanner here..." 
                             value={barcodeInputs[item.id] || ''}
                             onChange={e => setBarcodeInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                             onKeyDown={e => handleBarcodeKeyDown(e, item.id, batchStudents)}
                           />
                         </div>
                         <button 
                           className={`btn ${activeScanner === item.id ? 'btn-danger' : 'btn-secondary'}`}
                           onClick={() => setActiveScanner(activeScanner === item.id ? null : item.id)}
                         >
                           <Camera size={18} /> {activeScanner === item.id ? "Close Camera" : "Use Camera"}
                         </button>
                       </div>
                       
                       {activeScanner === item.id && (
                         <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                           <CameraScanner 
                             itemId={item.id} 
                             batchStudents={batchStudents} 
                             onMatch={(studentId) => handleCameraMatch(item.id, studentId)} 
                           />
                         </div>
                       )}
                     </div>
                  )}

                  {batchStudents.length === 0 ? (
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No students are officially registered in this batch. Please add students in Master Data.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {batchStudents.map(student => {
                        const isPresent = presentList.includes(student.id);
                        return (
                          <div 
                            key={student.id} 
                            onClick={() => toggleStudentAttendance(item.id, student.id)}
                            style={{ 
                              padding: '0.75rem', 
                              borderRadius: '0.5rem', 
                              background: isPresent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                              border: isPresent ? '1px solid var(--success)' : '1px solid var(--border-color)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ 
                              width: '18px', height: '18px', borderRadius: '4px', 
                              border: '2px solid', borderColor: isPresent ? 'var(--success)' : 'var(--text-muted)',
                              background: isPresent ? 'var(--success)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {isPresent && <CheckCircle size={12} color="#000" />}
                            </div>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '0.9rem', color: isPresent ? 'var(--success)' : 'var(--text-primary)' }}>{student.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.roll_number}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => submitAttendance(item)}
                      disabled={batchStudents.length === 0}
                    >
                      <CheckCircle size={18} /> Commit Ledger to Database
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
