# Smart Classroom & Timetable Scheduler - Administration Portal

An advanced, production-ready administrative platform designed to automate institution-wide scheduling through complex heuristic constraints, real-time hardware scanning, and cloud-synchronized attendance tracking.

---

## 🚀 System Architecture & Technology Stack

The platform is built on a high-performance modern stack optimized for administrative efficiency:

- **Frontend:** React 18+ with Vite (Hyper-fast HMR and build optimization).
- **Core Logic:** Heuristic Constraint-Satisfaction Algorithm (Custom-built Scheduler).
- **Styling:** Premium Glassmorphic Vanilla CSS architecture (Dynamic Theme Switching).
- **Backend/Database:** Supabase (PostgreSQL with Realtime Row Level Security).
- **Icons:** Lucide-React (State-of-the-art vector iconography).
- **Scanning:** html5-qrcode (WebRTC based optical PRN parsing).

---

## 🧠 Core Features

### 1. Heuristic Scheduling Engine (`scheduler.js`)
The "Brain" of the project. It uses a customized randomized heuristic approach to solve NP-complete scheduling problems.
- **Constraints Supported:**
    - **Fixed Slots:** Lock specific high-priority lectures to specific times manually.
    - **Break Slots:** Global institution-wide break times where no scheduling occurs.
    - **Faculty Conflict:** Instant verification ensuring no professor is double-booked across departments.
    - **Room Capacity:** Automatic matching of batch sizes against physical classroom capacity.
    - **Classes/Week:** Distributes subject total load evenly across the working week.

### 2. Live Hardware-Integrated Attendance
A dual-mode attendance ledger designed for rapid classroom deployment:
- **Optical Scanner:** Native WebRTC camera integration to scan barcode/QR ID badges.
- **USB Scanner Support:** Native keystroke interception for rapid-fire hardware laser scanning.
- **Real-time Commits:** Immediate Supabase synchronization for institutional reporting.

### 3. Responsive Theme Architecture
- **Light/Dark Synchronized:** Persistent theme provider with instantaneous CSS variable inversion.
- **Mobile-First Layout:** Collapsible hamburger navigation and touch-scrollable tables optimized for use on $10.5"$ tablets or $6"$ smartphones.

---

## 🛠 Installation & Secure Setup

### Prerequisites
- Node.js (v18+)
- A Supabase Project

### Environment Initialization
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Schema Calibration
Run the following SQL in your Supabase SQL Editor to prepare the cloud tables:
- `classrooms` (id, name, capacity)
- `departments` (id, name)
- `shifts` (id, name, start_time, end_time)
- `faculties` (id, name, subjects, avg_leaves, department_id)
- `subjects` (id, name, code, classes_per_week)
- `batches` (id, name, student_count, subjects, department_id, shift_id)
- `students` (id, name, roll_number, email, batch_id)
- `timetables` (id, name, items, status, score, errors)
- `attendance` (id, timetable_id, batch_id, day, slot, present_student_ids, date)

### Run Locally
```bash
npm install
npm run dev
```

---

## 📖 Administrative Workflow Guide

1. **Populate Master Data:** Register Departments -> Subjects -> Faculties -> Batches -> Students sequentially.
2. **Configure Generation:** Navigate to "Generate Schedule". Set slot durations and Lunch breaks.
3. **Apply Fixed Constraints:** Use the "Pin Slot" tool to manually lock specific lab sessions or guest lectures before the algorithm runs.
4. **Alrogithmic Run:** Initialize the engine. Choose from 3 optimized candidates based on conflict scores.
5. **Approve & Track:** Once approved, the schedule becomes the "Ground Truth" for the Attendance ledger.

---

## 📁 Repository & Deployment
This project is officially staged for deployment to:
[AndyDev94/Smart-Classroom-Web-Portal](https://github.com/AndyDev94/Smart-Classroom-Web-Portal)

---
*Created for the Jharkhand Seminar Evaluation Project - Government of Jharkhand.*
