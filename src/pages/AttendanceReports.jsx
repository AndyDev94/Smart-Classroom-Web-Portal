import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { 
  PieChart, 
  Users, 
  Search, 
  Filter, 
  BookOpen, 
  Eye, 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  Printer
} from 'lucide-react';

export default function AttendanceReports() {
  const { attendance, students, batches, departments, subjects, faculties, timetables, settings } = useAppData();
  
  // Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail View State
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);

  // 1. Enrich attendance data with metadata
  const enrichedAttendance = useMemo(() => {
    return attendance.map(entry => {
      const batch = batches.find(b => b.id === entry.batch_id);
      const timetable = timetables.find(t => t.id === entry.timetable_id);
      
      const scheduleItem = timetable?.items.find(
        item => item.day === entry.day && item.slot === entry.slot && item.batchId === entry.batch_id
      );

      const subject = subjects.find(s => s.id === (scheduleItem?.subjectId || entry.subject_id));
      const faculty = faculties.find(f => f.id === (scheduleItem?.facultyId || entry.faculty_id));

      return {
        ...entry,
        batchName: batch?.name || 'Unknown Batch',
        deptId: batch?.department_id,
        subjectId: subject?.id,
        subjectName: subject?.name || 'N/A',
        facultyId: faculty?.id,
        facultyName: faculty?.name || 'N/A'
      };
    });
  }, [attendance, batches, timetables, subjects, faculties]);

  // 2. Aggregate per-student metrics
  const studentMetrics = useMemo(() => {
    return students.map(student => {
      const batch = batches.find(b => b.id === student.batch_id);
      const dept = departments.find(d => d.id === batch?.department_id);
      
      // Filter sessions for this student's batch
      let studentBatchSessions = enrichedAttendance.filter(a => a.batch_id === student.batch_id);
      
      // Apply cross-filters to the student's aggregate (Optional: should aggregate reflect filter?)
      // Usually aggregate metrics reflect the WHOLE history unless specified.
      // We will apply faculty/subject filters to the LEDGER but keep the % as overall.
      
      const sessionsHeld = studentBatchSessions.length;
      const sessionsAttended = studentBatchSessions.filter(a => 
        a.present_student_ids && a.present_student_ids.includes(student.id)
      ).length;

      const sessionsAbsent = sessionsHeld - sessionsAttended;
      const percentage = sessionsHeld > 0 ? (sessionsAttended / sessionsHeld) * 100 : 0;

      return {
        id: student.id,
        name: student.name,
        roll: student.roll_number,
        batchName: batch?.name || 'Unassigned',
        deptName: dept?.name || 'N/A',
        deptId: dept?.id,
        batchId: batch?.id,
        sessionsHeld,
        sessionsAttended,
        sessionsAbsent,
        percentage
      };
    });
  }, [students, enrichedAttendance, batches, departments]);

  // 3. Filtered metrics for the main table
  const filteredMetrics = useMemo(() => {
    return studentMetrics.filter(m => {
      const matchesDept = deptFilter === 'all' || m.deptId === deptFilter;
      const matchesBatch = batchFilter === 'all' || m.batchId === batchFilter;
      
      // Find if student has ANY session with this faculty/subject if those filters are active
      let matchesFaculty = true;
      if (facultyFilter !== 'all') {
        matchesFaculty = attendance.some(a => 
          a.batch_id === m.batchId && 
          enrichedAttendance.find(ea => ea.id === a.id)?.facultyId === facultyFilter
        );
      }

      let matchesSubject = true;
      if (subjectFilter !== 'all') {
        matchesSubject = attendance.some(a => 
          a.batch_id === m.batchId && 
          enrichedAttendance.find(ea => ea.id === a.id)?.subjectId === subjectFilter
        );
      }

      const matchesSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roll.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDept && matchesBatch && matchesFaculty && matchesSubject && matchesSearch;
    });
  }, [studentMetrics, deptFilter, batchFilter, facultyFilter, subjectFilter, searchQuery, attendance, enrichedAttendance]);

  const overallStats = useMemo(() => {
    const totalHeld = attendance.length;
    let totalPresentSum = 0;
    let totalStudentSlots = 0;

    attendance.forEach(a => {
      const batchStudents = students.filter(s => s.batch_id === a.batch_id).length;
      totalPresentSum += (a.present_student_ids?.length || 0);
      totalStudentSlots += batchStudents;
    });

    const averageAttendance = totalStudentSlots > 0 ? (totalPresentSum / totalStudentSlots) * 100 : 0;

    return { totalHeld, averageAttendance, totalEnrolled: students.length };
  }, [attendance, students]);

  const getStatusColor = (percent) => {
    if (percent >= 85) return 'var(--success)';
    if (percent >= 75) return 'var(--warning)';
    return 'var(--danger)';
  };

  const openStudentHistory = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const studentSessions = enrichedAttendance
      .filter(a => a.batch_id === student.batch_id)
      .map(s => ({
        ...s,
        isPresent: s.present_student_ids?.includes(studentId)
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setSelectedStudentHistory({ student, sessions: studentSessions });
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text">Institutional Attendance Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>End-to-end oversight of student participation health</p>
        </div>
        <button 
          className="btn btn-secondary no-print"
          onClick={() => {
            document.body.classList.add('body-portrait');
            window.print();
            document.body.classList.remove('body-portrait');
          }}
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '0.75rem' }}><PieChart /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Global Attendance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{overallStats.averageAttendance.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-secondary)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-secondary)', borderRadius: '0.75rem' }}><BookOpen /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Academic Sessions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{overallStats.totalHeld}</div>
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.75rem' }}><Users /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Enrollment</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{overallStats.totalEnrolled}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card no-print" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '250px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Global Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.5rem' }} 
              placeholder="Filter by Name, Roll, or PRN..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Department</label>
          <select className="form-control" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setBatchFilter('all'); }}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Batch</label>
          <select className="form-control" value={batchFilter} onChange={e => setBatchFilter(e.target.value)}>
            <option value="all">All Batches</option>
            {batches.filter(b => deptFilter === 'all' || b.department_id === deptFilter).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Faculty</label>
          <select className="form-control" value={facultyFilter} onChange={e => setFacultyFilter(e.target.value)}>
            <option value="all">All Faculty</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Subject</label>
          <select className="form-control" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Student Attendance Ledger</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing {filteredMetrics.length} Students</span>
        </div>
        <div className="table-responsive" style={{ flex: 1 }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)' }}>
              <tr>
                <th style={{ padding: '1rem 2rem' }}>Roll Number</th>
                <th>Student Name</th>
                <th>Batch Affiliation</th>
                <th style={{ textAlign: 'center' }}>Attended</th>
                <th style={{ textAlign: 'center' }}>Absent</th>
                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Performance Matrix</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>No student matching your filter criteria was found.</td></tr>
              ) : (
                filteredMetrics.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '1.25rem 2rem', fontFamily: 'monospace', fontWeight: '600' }}>{student.roll}</td>
                    <td style={{ fontWeight: '500' }}>{student.name}</td>
                    <td>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{student.batchName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.deptName}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{student.sessionsAttended}</td>
                    <td style={{ textAlign: 'center', color: student.sessionsAbsent > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{student.sessionsAbsent}</td>
                    <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${student.percentage}%`, height: '100%', background: getStatusColor(student.percentage) }}></div>
                        </div>
                        <span style={{ fontWeight: '700', minWidth: '40px', color: getStatusColor(student.percentage) }}>{student.percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => openStudentHistory(student.id)}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Detail Modal Overlay */}
      {selectedStudentHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedStudentHistory.student.name}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Attendance History & Session Engagement</p>
              </div>
              <button className="btn btn-secondary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setSelectedStudentHistory(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '2rem' }}>
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>STUDENT ID</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedStudentHistory.student.roll_number}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>PERCENTAGE</div>
                  <div style={{ fontWeight: 'bold', color: getStatusColor((selectedStudentHistory.sessions.filter(s => s.isPresent).length / selectedStudentHistory.sessions.length) * 100) }}>
                    {(selectedStudentHistory.sessions.filter(s => s.isPresent).length / selectedStudentHistory.sessions.length * 100 || 0).toFixed(1)}%
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>TOTAL CLASSES</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedStudentHistory.sessions.length}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedStudentHistory.sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No session data captured yet for this student.</div>
                ) : (
                  selectedStudentHistory.sessions.map((session, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                      <div style={{ color: session.isPresent ? 'var(--success)' : 'var(--danger)' }}>
                        {session.isPresent ? <CheckCircle size={24} /> : <XCircle size={24} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{session.subjectName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Prof. {session.facultyName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Calendar size={14} /> {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Clock size={14} /> {session.day}, Slot {session.slot + 1}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
