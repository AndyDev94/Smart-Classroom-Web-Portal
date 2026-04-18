import { createContext, useState, useEffect, useContext } from 'react';
import { dbService } from '../services/dbService';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Initial Fetch (simulating Supabase mount fetch)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dbService.fetchAllData();
        setClassrooms(data.classrooms);
        setBatches(data.batches);
        setSubjects(data.subjects);
        setFaculties(data.faculties);
        setTimetables(data.timetables);
        setDepartments(data.departments);
        setShifts(data.shifts);
        setAttendance(data.attendance);
        setStudents(data.students);
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Async Methods
  const addClassroom = async (room) => {
    const newRoom = await dbService.createClassroom(room);
    setClassrooms(prev => [...prev, newRoom]);
  };

  const removeClassroom = async (id) => {
    await dbService.deleteClassroom(id);
    setClassrooms(prev => prev.filter(r => r.id !== id));
  };

  const addBatch = async (batch) => {
    const newBatch = await dbService.createBatch(batch);
    setBatches(prev => [...prev, newBatch]);
  };

  const removeBatch = async (id) => {
    await dbService.deleteBatch(id);
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  const addSubject = async (subject) => {
    const newSubject = await dbService.createSubject(subject);
    setSubjects(prev => [...prev, newSubject]);
  };

  const removeSubject = async (id) => {
    await dbService.deleteSubject(id);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const addFaculty = async (faculty) => {
    const newFaculty = await dbService.createFaculty(faculty);
    setFaculties(prev => [...prev, newFaculty]);
  };

  const removeFaculty = async (id) => {
    await dbService.deleteFaculty(id);
    setFaculties(prev => prev.filter(f => f.id !== id));
  };

  const saveTimetable = async (timetable) => {
    const newTimetable = await dbService.createTimetable(timetable);
    setTimetables(prev => [...prev, newTimetable]);
    return newTimetable.id;
  };

  const updateTimetableStatus = async (id, status) => {
    await dbService.updateTimetableStatus(id, status);
    setTimetables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };
  
  const addDepartment = async (dept) => {
    const newDept = await dbService.createDepartment(dept);
    setDepartments(prev => [...prev, newDept]);
  };
  
  const removeDepartment = async (id) => {
    await dbService.deleteDepartment(id);
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const addShift = async (shift) => {
    const newShift = await dbService.createShift(shift);
    setShifts(prev => [...prev, newShift]);
  };
  
  const removeShift = async (id) => {
    await dbService.deleteShift(id);
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const addStudent = async (student) => {
    const newStudent = await dbService.createStudent(student);
    setStudents(prev => [...prev, newStudent]);
  };
  
  const removeStudent = async (id) => {
    await dbService.deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const logAttendance = async (record) => {
    const newRec = await dbService.logAttendance(record);
    setAttendance(prev => [...prev, newRec]);
  };

  const updateSettings = async (newSettings) => {
    await dbService.updateSettings(newSettings);
    setSettings(newSettings);
  };

  const value = {
    isLoading,
    classrooms, addClassroom, removeClassroom,
    batches, addBatch, removeBatch,
    subjects, addSubject, removeSubject,
    faculties, addFaculty, removeFaculty,
    timetables, saveTimetable, updateTimetableStatus,
    departments, addDepartment, removeDepartment,
    shifts, addShift, removeShift,
    students, addStudent, removeStudent,
    attendance, logAttendance,
    settings, updateSettings
  };

  return (
    <AppDataContext.Provider value={value}>
      {isLoading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
          <div className="glow-effect" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AppDataContext.Provider>
  );
};
