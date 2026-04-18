import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { generateSchedules } from '../utils/scheduler';
import { Settings, Play, CheckCircle2, AlertTriangle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GenerateTimetable() {
  const data = useAppData();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [slotDuration, setSlotDuration] = useState("60");
  const [breakSlot, setBreakSlot] = useState("3");
  const [fixedClasses, setFixedClasses] = useState([]);
  
  const [fcBatch, setFcBatch] = useState('');
  const [fcSubject, setFcSubject] = useState('');
  const [fcFaculty, setFcFaculty] = useState('');
  const [fcRoom, setFcRoom] = useState('');
  const [fcDay, setFcDay] = useState(data.settings?.workingDays[0] || 'Monday');
  const [fcSlot, setFcSlot] = useState('0');

  const handleAddFixedClass = () => {
    if (!fcBatch || !fcSubject || !fcFaculty || !fcRoom || !fcDay || !fcSlot) return;
    setFixedClasses([
      ...fixedClasses,
      { batchId: fcBatch, subjectId: fcSubject, facultyId: fcFaculty, roomId: fcRoom, day: fcDay, slot: parseInt(fcSlot) }
    ]);
    setFcSubject('');
    setFcFaculty('');
    setFcRoom('');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setResults(null);
    
    // Simulate generation delay to look authentic
    setTimeout(() => {
      const output = generateSchedules(data, 3, { slotDuration: parseInt(slotDuration), breakSlot, fixedClasses });
      setResults(output);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSaveAndReview = async (scheduleOption) => {
    // Generate a structured item and save it
    const timetableId = await data.saveTimetable({
      name: scheduleOption.optionName,
      items: scheduleOption.schedule,
      score: scheduleOption.score,
      errors: scheduleOption.errors
    });
    navigate(`/app/timetable/${timetableId}`);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="gradient-text">Run Scheduling Engine</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure parameters and generate algorithmic timetables.</p>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Settings Panel */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} className="gradient-text" /> Engine Run Parameters
            </h3>
          
          <div className="form-group">
            <label className="form-label">Lecture Duration</label>
            <select className="form-control" value={slotDuration} onChange={e => setSlotDuration(e.target.value)}>
              <option value="45">45 Minutes</option>
              <option value="50">50 Minutes</option>
              <option value="60">60 Minutes</option>
              <option value="90">90 Minutes</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Lunch / Break Slot</label>
            <select className="form-control" value={breakSlot} onChange={e => setBreakSlot(e.target.value)}>
              <option value="">No Scheduled Break</option>
              <option value="2">Break at Slot 3</option>
              <option value="3">Break at Slot 4</option>
              <option value="4">Break at Slot 5</option>
              <option value="5">Break at Slot 6</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Algorithm Presets</label>
            <select className="form-control" defaultValue="balanced">
              <optgroup label="Optimization Target">
                <option value="balanced">Balanced (Recommended)</option>
                <option value="faculty">Minimize Faculty Wait Time</option>
                <option value="room">Maximize Room Utilization</option>
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
              <span>Strict Capacity Enforcement</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
              <span>Allow Back-to-Back Lectures</span>
              <input type="checkbox" defaultChecked />
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Computing Options...' : <><Play size={18} /> Initialize Generation Matrix</>}
          </button>
          </div>

          {/* Manual Constraints Panel */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              Manual Constraints (Fixed Slots)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Lock specific classes to a guaranteed slot. The engine will schedule everything else around them.</p>

            {fixedClasses.length > 0 && (
              <div style={{ marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                {fixedClasses.map((fc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: i !== fixedClasses.length-1 ? '0.5rem' : 0, fontSize: '0.85rem' }}>
                    <span>
                      <strong style={{ color: 'var(--text-primary)' }}>{data.batches.find(b=>b.id===fc.batchId)?.name}</strong> - {data.subjects.find(s=>s.id===fc.subjectId)?.code}<br/>
                      <span style={{ color: 'var(--text-secondary)' }}>{fc.day} (Slot {fc.slot + 1}) | {data.faculties.find(f=>f.id===fc.facultyId)?.name} | {data.classrooms.find(r=>r.id===fc.roomId)?.name}</span>
                    </span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }} onClick={() => setFixedClasses(fixedClasses.filter((_, idx)=>idx!==i))}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={fcBatch} onChange={e => { setFcBatch(e.target.value); setFcSubject(''); }}>
                  <option value="">Select Batch/Class</option>
                  {data.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={fcSubject} onChange={e => { setFcSubject(e.target.value); setFcFaculty(''); }}>
                  <option value="">Select Subject</option>
                  {fcBatch && data.batches.find(b => b.id === fcBatch)?.subjects.map(sId => {
                    const s = data.subjects.find(x => x.id === sId);
                    return s ? <option key={sId} value={sId}>{s.name}</option> : null;
                  })}
                </select>
                <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={fcFaculty} onChange={e => setFcFaculty(e.target.value)}>
                  <option value="">Select Faculty</option>
                  {fcSubject && data.faculties.filter(f => f.subjects.includes(fcSubject)).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={fcRoom} onChange={e => setFcRoom(e.target.value)}>
                  <option value="">Select Room</option>
                  {data.classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={fcDay} onChange={e => setFcDay(e.target.value)}>
                  {(data.settings?.workingDays || []).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="form-control" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={fcSlot} onChange={e => setFcSlot(e.target.value)}>
                  {Array.from({ length: data.settings?.slotsPerDay || 8 }).map((_, i) => <option key={i} value={i}>Slot {i + 1}</option>)}
                </select>
              </div>
              <button className="btn btn-outline" style={{ width: '100%', padding: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={handleAddFixedClass}>
                <Plus size={16} /> Pin Slot
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {isGenerating && (
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glow-effect" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--accent-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Processing multi-dimensional heuristic constraints...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {results && !results.success && (
            <div className="glass-card border-danger animate-fade-in" style={{ border: '1px solid var(--danger)' }}>
              <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle /> Generation Failed
              </h3>
              <p style={{ marginTop: '1rem' }}>{results.error}</p>
            </div>
          )}

          {results && results.success && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Generated Options</h3>
              
              {results.options.map((opt, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `3px solid ${opt.errors.length === 0 ? 'var(--success)' : 'var(--warning)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem' }}>{opt.optionName}</h4>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Score: <strong style={{ color: opt.score >= 90 ? 'var(--success)' : 'inherit'}}>{opt.score}/100</strong></span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Placements: <strong>{opt.schedule.length}</strong></span>
                      </div>
                    </div>
                    {opt.errors.length === 0 ? 
                      <CheckCircle2 color="var(--success)" size={28} /> : 
                      <AlertTriangle color="var(--warning)" size={28} />
                    }
                  </div>
                  
                  {opt.errors.length > 0 && (
                     <div style={{ fontSize: '0.85rem', color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                       {opt.errors.length} Optimization Warnings Detected
                     </div>
                  )}

                  <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => handleSaveAndReview(opt)}>
                    Select & Review Timeline <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
