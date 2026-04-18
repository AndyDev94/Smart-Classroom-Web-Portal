import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Plus, Trash2 } from 'lucide-react';

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('classrooms');

  const tabs = [
    { id: 'classrooms', label: 'Classrooms' },
    { id: 'departments', label: 'Departments' },
    { id: 'shifts', label: 'Shifts' },
    { id: 'faculties', label: 'Faculties' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'batches', label: 'Batches' },
    { id: 'students', label: 'Students' },
  ];

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1 className="gradient-text">Master Data Configuration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage the resources for schedule generation</p>
      </div>

      <div className="tabs-scrollable">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 2rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              fontSize: '1rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        { activeTab === 'classrooms' && <ClassroomsTab /> }
        { activeTab === 'departments' && <DepartmentsTab /> }
        { activeTab === 'shifts' && <ShiftsTab /> }
        { activeTab === 'faculties' && <FacultiesTab /> }
        { activeTab === 'subjects' && <SubjectsTab /> }
        { activeTab === 'batches' && <BatchesTab /> }
        { activeTab === 'students' && <StudentsTab /> }
      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function ClassroomsTab() {
  const { classrooms, addClassroom, removeClassroom } = useAppData();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !capacity) return;
    await addClassroom({ name, capacity: parseInt(capacity) });
    setName('');
    setCapacity('');
  };

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Classroom</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Room Identifier / Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lab-1, Room 101" />
          </div>
          <div className="form-group">
            <label className="form-label">Seating Capacity</label>
            <input type="number" className="form-control" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="e.g. 60" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Add Classroom
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Existing Classrooms ({classrooms.length})</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Capacity</th><th>Action</th></tr></thead>
            <tbody>
              {classrooms.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.capacity}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeClassroom(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FacultiesTab() {
  const { faculties, addFaculty, removeFaculty, subjects, departments } = useAppData();
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [leaves, setLeaves] = useState('0');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    await addFaculty({ 
      name, 
      subjects: selectedSubjects, 
      avgLeaves: parseInt(leaves),
      department_id: departmentId || null
    });
    setName('');
    setSelectedSubjects([]);
    setLeaves('0');
    setDepartmentId('');
  };

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Faculty</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Faculty Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Jane Smith" />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-control" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">No Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subjects They Can Teach</label>
            <select multiple className="form-control" style={{ minHeight: '100px' }} value={selectedSubjects} onChange={e => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedSubjects(options);
            }}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hold Ctrl/Cmd to select multiple. Add subjects in the Subjects tab first.</p>
          </div>
          <div className="form-group">
            <label className="form-label">Avg. Monthly Leaves</label>
            <input type="number" className="form-control" value={leaves} onChange={e => setLeaves(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Add Faculty
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Existing Faculties ({faculties.length})</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Subjects Count</th><th>Leaves</th><th>Action</th></tr></thead>
            <tbody>
              {faculties.map(f => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.subjects.length} subjects</td>
                  <td>{f.avgLeaves}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeFaculty(f.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubjectsTab() {
  const { subjects, addSubject, removeSubject } = useAppData();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [classesPerWeek, setClassesPerWeek] = useState('3');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !code) return;
    await addSubject({ name, code, classesPerWeek: parseInt(classesPerWeek) });
    setName(''); setCode(''); setClassesPerWeek('3');
  };

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Subject</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Subject Code</label>
            <input type="text" className="form-control" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS101" />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Data Structures" />
          </div>
          <div className="form-group">
            <label className="form-label">Classes Per Week</label>
            <input type="number" className="form-control" value={classesPerWeek} onChange={e => setClassesPerWeek(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Add Subject
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Existing Subjects ({subjects.length})</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Name</th><th>Classes/Wk</th><th>Action</th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.classesPerWeek}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeSubject(s.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BatchesTab() {
  const { batches, addBatch, removeBatch, subjects, departments, shifts } = useAppData();
  const [name, setName] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [shiftId, setShiftId] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !studentCount) return;
    await addBatch({ 
      name, 
      studentCount: parseInt(studentCount), 
      subjects: selectedSubjects,
      department_id: departmentId || null,
      shift_id: shiftId || null
    });
    setName(''); setStudentCount(''); setSelectedSubjects([]); setDepartmentId(''); setShiftId('');
  };

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Batch</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Batch Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CS Year 3 Sec A" />
          </div>
          <div className="form-group">
            <label className="form-label">Number of Students</label>
            <input type="number" className="form-control" value={studentCount} onChange={e => setStudentCount(e.target.value)} placeholder="e.g. 50" />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-control" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">No Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Shift Timing</label>
            <select className="form-control" value={shiftId} onChange={e => setShiftId(e.target.value)}>
              <option value="">Select Shift</option>
              {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Required Subjects</label>
            <select multiple className="form-control" style={{ minHeight: '100px' }} value={selectedSubjects} onChange={e => {
               const options = Array.from(e.target.selectedOptions, option => option.value);
               setSelectedSubjects(options);
            }}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Add Batch
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Existing Batches ({batches.length})</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Size</th><th>Subjects</th><th>Action</th></tr></thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.studentCount}</td>
                  <td>{b.subjects.length}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeBatch(b.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DepartmentsTab() {
  const { departments, addDepartment, removeDepartment } = useAppData();
  const [name, setName] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    await addDepartment({ name });
    setName('');
  };

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Department</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Add Department
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Existing Departments</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Action</th></tr></thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeDepartment(d.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ShiftsTab() {
  const { shifts, addShift, removeShift } = useAppData();
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('13:00');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !startTime || !endTime) return;
    await addShift({ name, startTime, endTime });
    setName(''); setStartTime('08:00'); setEndTime('13:00');
  };

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Shift</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Shift Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Shift" />
          </div>
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input type="time" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Add Shift
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Existing Shifts</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Timing</th><th>Action</th></tr></thead>
            <tbody>
              {shifts.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.startTime} - {s.endTime}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeShift(s.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentsTab() {
  const { students, addStudent, removeStudent, batches } = useAppData();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [batchId, setBatchId] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !rollNumber || !batchId) return;
    await addStudent({ name, roll_number: rollNumber, email, batch_id: batchId });
    setName(''); setRollNumber(''); setEmail(''); setBatchId('');
  };

  const getBatchName = (bId) => batches.find(b => b.id === bId)?.name || 'Unknown Batch';

  return (
    <div className="grid-2">
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Register New Student</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Roll / Enrollment #</label>
            <input type="text" className="form-control" value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. CS-2023-001" />
          </div>
          <div className="form-group">
            <label className="form-label">Email (Optional)</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. jdoe@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Assign to Batch</label>
            <select className="form-control" value={batchId} onChange={e => setBatchId(e.target.value)}>
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} /> Register Student
          </button>
        </form>
      </div>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Registered Students ({students.length})</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr><th>Roll #</th><th>Name</th><th>Batch</th><th>Action</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.roll_number}</td>
                  <td>{s.name}</td>
                  <td>{getBatchName(s.batch_id)}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '0.25rem' }} onClick={() => removeStudent(s.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
