// Heuristic-based Scheduling Algorithm
// Attempts to generate an optimal timetable fulfilling all constraints.

export function generateSchedules(data, numberOfOptions = 3, config = null) {
  const { classrooms, batches, subjects, faculties, settings } = data;
  
  const slotDuration = config?.slotDuration || settings.slotDurationMinutes || 60;
  const breakSlot = config?.breakSlot !== undefined && config?.breakSlot !== "" ? parseInt(config.breakSlot) : -1;
  const startTime = settings.startTime || '09:00';
  const targetBatchId = config?.targetBatchId || null;
  const targetFacultyId = config?.targetFacultyId || null;
  const specificDay = config?.specificDay || 'all';
  const existingItems = config?.existingItems || [];
  
  if (classrooms.length === 0 || batches.length === 0 || subjects.length === 0 || faculties.length === 0) {
    return { success: false, error: "Missing required master data (classrooms, batches, subjects, or faculties)." };
  }

  const generatedOptions = [];

  for (let optionIndex = 0; optionIndex < numberOfOptions; optionIndex++) {
    const schedule = [];
    const errors = [];
    
    // Create an empty grid
    const days = specificDay === 'all' ? settings.workingDays : [specificDay];
    const slots = Array.from({ length: settings.slotsPerDay }, (_, i) => i);

    // Track resource usage to check for collisions: Day -> Slot -> EntityID -> boolean
    const facultyUsage = {}; 
    const roomUsage = {};
    const batchUsage = {};

    days.forEach(day => {
      facultyUsage[day] = {};
      roomUsage[day] = {};
      batchUsage[day] = {};
      slots.forEach(slot => {
        facultyUsage[day][slot] = {};
        roomUsage[day][slot] = {};
        batchUsage[day][slot] = {};
      });
    });

    // Block existing items (Collision Avoidance)
    existingItems.forEach(item => {
      if (item.isConfig) return;
      if (facultyUsage[item.day] && facultyUsage[item.day][item.slot]) {
        facultyUsage[item.day][item.slot][item.facultyId] = true;
        batchUsage[item.day][item.slot][item.batchId] = true;
        roomUsage[item.day][item.slot][item.roomId] = true;
      }
    });

    // We must schedule: every batch needs 'classesPerWeek' of each of their 'subjects'
    const demands = []; // e.g., { batchId, subjectId, remainingClasses: 3 }
    
    batches.forEach(batch => {
      // Filtering for targeted batch scope
      if (targetBatchId && batch.id !== targetBatchId) return;

      batch.subjects.forEach(subId => {
        const subjectObj = subjects.find(s => s.id === subId);
        
        // Filtering for targeted faculty scope
        if (targetFacultyId) {
          const isTaughtByTarget = faculties.find(f => f.id === targetFacultyId)?.subjects.includes(subId);
          if (!isTaughtByTarget) return;
        }

        if (subjectObj) {
          demands.push({
            batchId: batch.id,
            subjectId: subId,
            remainingClasses: specificDay === 'all' ? subjectObj.classesPerWeek : 1, // If only one day, just do 1 class
            batchCapacity: batch.studentCount
          });
        }
      });
    });

    // Apply Fixed Classes Constraints
    if (config?.fixedClasses && Array.isArray(config.fixedClasses)) {
      for (let fixed of config.fixedClasses) {
        // Find matching demand to decrement it
        const demandIndex = demands.findIndex(d => d.batchId === fixed.batchId && d.subjectId === fixed.subjectId);
        if (demandIndex !== -1 && demands[demandIndex].remainingClasses > 0) {
          demands[demandIndex].remainingClasses--;
        }
        
        // Push the fixed valid slot into our timeline safely
        schedule.push({
          day: fixed.day,
          slot: fixed.slot,
          batchId: fixed.batchId,
          subjectId: fixed.subjectId,
          facultyId: fixed.facultyId,
          roomId: fixed.roomId,
          isFixed: true
        });

        // Block these resources securely
        batchUsage[fixed.day][fixed.slot][fixed.batchId] = true;
        facultyUsage[fixed.day][fixed.slot][fixed.facultyId] = true;
        roomUsage[fixed.day][fixed.slot][fixed.roomId] = true;
      }
    }

    // Shuffle demands slightly for variation between options
    demands.sort(() => Math.random() - 0.5);

    for (let demand of demands) {
      let classesAssigned = 0;
      let placementAttempts = 0;
      const MAX_ATTEMPTS = 500; // prevent infinite loops

      while (classesAssigned < demand.remainingClasses && placementAttempts < MAX_ATTEMPTS) {
        placementAttempts++;
        
        // Pick a random day, slot, available room, and available faculty
        const randomDay = days[Math.floor(Math.random() * days.length)];
        const randomSlot = slots[Math.floor(Math.random() * slots.length)];

        // Proceed only if batch is free, and we are not in the designated break slot
        if (randomSlot === breakSlot) continue;
        if (batchUsage[randomDay][randomSlot][demand.batchId]) continue;

        // Find a capable faculty who is free
        const capableFaculties = faculties.filter(f => f.subjects.includes(demand.subjectId));
        if (capableFaculties.length === 0) {
          if (placementAttempts === 1) errors.push(`No faculty capable of teaching Subject ID ${demand.subjectId}`);
          break;
        }

        // Shuffle faculties
        capableFaculties.sort(() => Math.random() - 0.5);
        let selectedFaculty = null;
        for (let fac of capableFaculties) {
          if (!facultyUsage[randomDay][randomSlot][fac.id]) {
            selectedFaculty = fac;
            break;
          }
        }
        if (!selectedFaculty) continue;

        // Find a suitable room that is free and large enough
        // Shuffle rooms
        const validRooms = classrooms.filter(r => r.capacity >= demand.batchCapacity).sort(() => Math.random() - 0.5);
        let selectedRoom = null;
        for (let room of validRooms) {
          if (!roomUsage[randomDay][randomSlot][room.id]) {
            selectedRoom = room;
            break;
          }
        }
        
        if (!selectedRoom) continue;

        // ALL CONSTRAINTS PASSED: Schedule the class!
        schedule.push({
          day: randomDay,
          slot: randomSlot,
          batchId: demand.batchId,
          subjectId: demand.subjectId,
          facultyId: selectedFaculty.id,
          roomId: selectedRoom.id
        });

        // Mark resources as used
        batchUsage[randomDay][randomSlot][demand.batchId] = true;
        facultyUsage[randomDay][randomSlot][selectedFaculty.id] = true;
        roomUsage[randomDay][randomSlot][selectedRoom.id] = true;

        classesAssigned++;
      }

      if (classesAssigned < demand.remainingClasses) {
        errors.push(`Could not fully schedule Subject ${demand.subjectId} for Batch ${demand.batchId} (${classesAssigned}/${demand.remainingClasses} assigned).`);
      }
    }

    generatedOptions.push({
      optionName: `Option ${optionIndex + 1}`,
      schedule: [
        { isConfig: true, slotDuration, breakSlot, startTime },
        ...schedule
      ],
      errors: [...new Set(errors)],
      score: 100 - errors.length * 10 // Mock scoring
    });
  }

  return { success: true, options: generatedOptions };
}
