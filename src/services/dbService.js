import { supabase } from './supabaseClient';

export const dbService = {
  // Fetch all collections
  async fetchAllData() {
    // Note: If you have not created your tables in Supabase yet, this will fail.
    // Make sure to run the SQL provided in the markdown guide!
    try {
      const [
        { data: classrooms, error: errC }, 
        { data: batches, error: errB }, 
        { data: subjects, error: errS },
        { data: faculties, error: errF },
        { data: timetables, error: errT },
        { data: departments, error: errD },
        { data: shifts, error: errSh },
        { data: attendance, error: errA },
        { data: students, error: errSt }
      ] = await Promise.all([
        supabase.from('classrooms').select('*'),
        supabase.from('batches').select('*'),
        supabase.from('subjects').select('*'),
        supabase.from('faculties').select('*'),
        supabase.from('timetables').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('shifts').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('students').select('*')
      ]);

      // If relations don't exist yet, we fall back gracefully to empty arrays so the UI doesn't crash
      if (errC || errB || errS || errF || errT) {
        console.warn("One or more tables do not exist in Supabase yet. Have you run the SQL migration?");
      }

      return {
        classrooms: classrooms || [],
        batches: batches || [],
        subjects: subjects || [],
        faculties: faculties || [],
        timetables: timetables || [],
        departments: departments || [],
        shifts: shifts || [],
        attendance: attendance || [],
        students: students || [],
        settings: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          slotsPerDay: 8,
          slotDurationMinutes: 60,
          startTime: '09:00',
        }
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Classrooms
  async createClassroom(room) {
    const { data, error } = await supabase
      .from('classrooms')
      .insert([{ name: room.name, capacity: room.capacity }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteClassroom(id) {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (error) throw error;
  },

  // Faculties
  async createFaculty(faculty) {
    const { data, error } = await supabase
      .from('faculties')
      .insert([{ 
        name: faculty.name, 
        subjects: faculty.subjects, 
        avgLeaves: faculty.avgLeaves,
        avgleaves: faculty.avgLeaves,
        department_id: faculty.department_id || null
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteFaculty(id) {
    const { error } = await supabase.from('faculties').delete().eq('id', id);
    if (error) throw error;
  },

  // Subjects
  async createSubject(subject) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ 
        code: subject.code, 
        name: subject.name, 
        classesPerWeek: subject.classesPerWeek,
        classesperweek: subject.classesPerWeek
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteSubject(id) {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
  },

  // Batches
  async createBatch(batch) {
    const { data, error } = await supabase
      .from('batches')
      .insert([{ 
        name: batch.name, 
        studentCount: batch.studentCount, 
        studentcount: batch.studentCount,
        subjects: batch.subjects,
        department_id: batch.department_id || null,
        shift_id: batch.shift_id || null
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteBatch(id) {
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) throw error;
  },

  // Timetables
  async createTimetable(timetable) {
    const { data, error } = await supabase
      .from('timetables')
      .insert([{ 
         name: timetable.name, 
         score: timetable.score, 
         items: timetable.items, 
         errors: timetable.errors,
         status: 'Pending' 
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateTimetableStatus(id, status) {
    const { data, error } = await supabase
      .from('timetables')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateSettings(settings) {
    // Optional implementation: Save global settings somewhere
  },

  // Departments
  async createDepartment(department) {
    const { data, error } = await supabase
      .from('departments')
      .insert([{ name: department.name }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteDepartment(id) {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
  },

  // Shifts
  async createShift(shift) {
    const { data, error } = await supabase
      .from('shifts')
      .insert([{ name: shift.name, startTime: shift.startTime, endTime: shift.endTime }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteShift(id) {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) throw error;
  },

  // Students
  async createStudent(student) {
    const { data, error } = await supabase
      .from('students')
      .insert([{ 
        name: student.name, 
        roll_number: student.roll_number,
        email: student.email,
        batch_id: student.batch_id
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteStudent(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  },

  // Attendance
  async logAttendance(attendanceRecord) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ 
         timetable_id: attendanceRecord.timetable_id,
         batch_id: attendanceRecord.batch_id,
         day: attendanceRecord.day,
         slot: attendanceRecord.slot,
         present_student_ids: attendanceRecord.present_student_ids,
         date: attendanceRecord.date
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
