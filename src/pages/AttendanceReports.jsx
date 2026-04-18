import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { PieChart, Users, Search, Filter, BookOpen, UserCheck, UserX } from 'lucide-react';

export default function AttendanceReports() {
  const { attendance, students, batches, departments, subjects, faculties, timetables } = useAppData();
  
  // Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Enrich attendance data with metadata
  const enrichedAttendance = useMemo(() => {
    return attendance.map(entry => {
      const batch = batches.find(b => b.id === entry.batch_id);
      const timetable = timetables.find(t => t.id === entry.timetable_id);
      
      // Find the specific item in the timetable to get the faculty/subject
      const scheduleItem = timetable?.items.find(
        item => item.day === entry.day && item.slot === entry.slot && item.batchId === entry.batch_id
      );

      const subject = subjects.find(s => s.id === scheduleItem?.subjectId);
      const faculty = faculties.find(f => f.id === scheduleItem?.facultyId);

      return {
        ...entry,
        batchName: batch?.name || 'Unknown Batch',
        deptId: batch?.department_id,
        subjectName: subject?.name || 'N/A',
        facultyName: faculty?.name || 'N/A'
      };
    });
  }, [attendance, batches, timetables]);

  // 2. Aggregate per-student metrics
  const studentMetrics = useMemo(() => {
    return students.map(student => {
      const batch = batches.find(b => b.id === student.batch_id);
      const dept = departments.find(d => d.id === batch?.department_id);
      
      // Sessions held for this student's batch
      const batchSessions = attendance.filter(a => a.batch_id === student.batch_id);
      const sessionsHeld = batchSessions.length;
      
      // Sessions attended by this specific student
      const sessionsAttended = batchSessions.filter(a => 
        a.present_student_ids && a.present_student_ids.includes(student.id)
      ).length;

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
        percentage
      };
    });
  }, [students, attendance, batches, departments]);

  // 3. Filtered metrics
  const filteredMetrics = useMemo(() => {
    return studentMetrics.filter(m => {
      const matchesDept = deptFilter === 'all' || m.deptId === deptFilter;
      const matchesBatch = batchFilter === 'all' || m.batchId === batchFilter;
      const matchesSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.roll.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDept && matchesBatch && matchesSearch;
    });
  }, [studentMetrics, deptFilter, batchFilter, searchQuery]);

  // 4. Overal Institution Stats
  const overallStats = useMemo(() => {
    const totalHeld = attendance.length;
    let totalPresentSum = 0;
    let totalStudentSlots = 0;

    attendance.forEach(a => {
      const batch = batches.find(b => b.id === a.batch_id);
      const studentsInBatch = students.filter(s => s.batch_id === a.batch_id).length;
      
      totalPresentSum += (a.present_student_ids?.length || 0);
      totalStudentSlots += studentsInBatch;
    });

    const averageAttendance = totalStudentSlots > 0 ? (totalPresentSum / totalStudentSlots) * 100 : 0;

    return {
      totalHeld,
      averageAttendance,
      totalStudents: students.length
    };
  }, [attendance, students, batches]);

  const getStatusColor = (percent) => {
    if (percent >= 85) return 'var(--success)';
    if (percent >= 75) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1 className="gradient-text">Institutional Attendance Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Comprehensive oversight of student participation and faculty delivery</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Attendance</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overallStats.averageAttendance.toFixed(1)}%</div>
            </div>
            <div style={{ color: 'var(--accent-primary)' }}><PieChart size={32} /></div>
          </div>
        </div>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--accent-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lectures Recorded</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overallStats.totalHeld}</div>
            </div>
            <div style={{ color: 'var(--accent-secondary)' }}><BookOpen size={32} /></div>
          </div>
        </div>
        <div className="glass-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Students Enrolled</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{overallStats.totalStudents}</div>
            </div>
            <div style={{ color: 'var(--success)' }}><Users size={32} /></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="form-label"><Search size={14} /> Search Student</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Name or Roll Number..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <label className="form-label"><Filter size={14} /> Department</label>
          <select className="form-control" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setBatchFilter('all'); }}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ width: '200px' }}>
          <label className="form-label"><Filter size={14} /> Batch</label>
          <select className="form-control" value={batchFilter} onChange={e => setBatchFilter(e.target.value)}>
            <option value="all">All Batches</option>
            {batches
              .filter(b => deptFilter === 'all' || b.department_id === deptFilter)
              .map(b => <option key={b.id} value={b.id}>{b.name}</option>)
            }
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ marginBottom: '1rem' }}>Student Attendance Ledger</h3>
        <div className="table-responsive" style={{ flex: 1 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Batch / Dept</th>
                <th style={{ textAlign: 'center' }}>Held</th>
                <th style={{ textAlign: 'center' }}>Attended</th>
                <th style={{ textAlign: 'right' }}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No matching records found in the attendance matrix.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>{student.batchName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.deptName}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{student.sessionsHeld}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: student.sessionsAttended === 0 ? 'var(--text-muted)' : 'inherit' }}>
                        {student.sessionsAttended}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${student.percentage}%`, 
                            height: '100%', 
                            background: getStatusColor(student.percentage) 
                          }}></div>
                        </div>
                        <span style={{ fontWeight: 'bold', minWidth: '45px', color: getStatusColor(student.percentage) }}>
                          {student.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
