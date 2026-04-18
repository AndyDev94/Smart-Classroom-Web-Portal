import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  Settings, 
  Brain, 
  Camera, 
  BarChart3, 
  Layers,
  Info 
} from 'lucide-react';

export default function Guide() {
  const sections = [
    {
      id: "objective",
      title: "1. Platform Objective",
      icon: <Info className="gradient-text" />,
      content: "The SmartClass Administration Portal is designed to modernize and automate the complex ecosystem of institutional scheduling. By leveraging heuristic algorithms and real-time scanning hardware, we aim to eliminate resource clashes and provide transparent academic accountability for students, faculty, and administrators."
    },
    {
      id: "master-data",
      title: "2. Seeding Master Data",
      icon: <Layers className="gradient-text" />,
      content: (
        <>
          <p>Before generating any schedules, you must populate the foundational data in the <strong>Master Data</strong> tab. Follow this sequence for data integrity:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem' }}>
            <li><strong>Classrooms:</strong> Register all physical labs and lecture halls with their exact seating capacity.</li>
            <li><strong>Subjects:</strong> Define curriculum modules, codes, and set the required 'Classes Per Week' load.</li>
            <li><strong>Faculties:</strong> Assign professors to the departments and indicate which subjects they are qualified to teach.</li>
            <li><strong>Batches & Students:</strong> Create student groups (Semesters/Sections) and assign their core subject requirements.</li>
          </ul>
        </>
      )
    },
    {
      id: "scheduling",
      title: "3. Generating Algorithmic Timetables",
      icon: <Brain className="gradient-text" />,
      content: (
        <>
          <p>Navigate to <strong>Generate Schedule</strong> to initialize the heuristic engine.</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem' }}>
            <li><strong>Parameters:</strong> Set the lecture durations (e.g., 60 mins) and choose where to place the institutional Lunch/Break slot.</li>
            <li><strong>Fixed Pinning:</strong> Use the 'Manual Constraints' tool to lock high-priority guest lectures or lab sessions to specific times before the run.</li>
            <li><strong>Evaluation:</strong> The engine will produce 3 candidates. Check the 'Score' and 'Warnings' to choose the most optimal alignment.</li>
          </ul>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '0.75rem', borderLeft: '3px solid var(--accent-primary)' }}>
            <strong>Pro Tip:</strong> Toggle 'Respect Approved Timetables' to ensure new schedules don't double-book rooms already locked in other approved plans.
          </div>
        </>
      )
    },
    {
      id: "attendance",
      title: "4. Attendance & Live Tracking",
      icon: <Camera className="gradient-text" />,
      content: (
        <>
          <p>The platform supports high-speed student tracking via the <strong>Track Attendance</strong> module:</p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem' }}>
            <li><strong>Optical Scan:</strong> Use the integrated camera to scan student ID Barcodes or QR codes.</li>
            <li><strong>Hardware Sync:</strong> Plug in any standard USB Laser Scanner; the system will intercept keystrokes for rapid-fire logging.</li>
            <li><strong>Manual Entry:</strong> Tapping a student card in the interface manually toggles their presence status.</li>
          </ul>
        </>
      )
    },
    {
      id: "analytics",
      title: "5. Analytics & Performance Intelligence",
      icon: <BarChart3 className="gradient-text" />,
      content: "Use the Attendance Analytics dashboard to monitor institutional health. You can filter by Department or Faculty to see which sessions are falling behind. Clicking any individual student opens their 'Performance Ledger', showing every session they attended or missed since the beginning of the semester."
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div>
          <h1 className="gradient-text">Platform User Guide</h1>
          <p style={{ color: 'var(--text-secondary)' }}>A-to-Z Handbook for Institutional Administrators</p>
        </div>
        <BookOpen size={48} className="gradient-text" style={{ opacity: 0.2 }} />
      </div>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sections.map(section => (
            <div key={section.id} className="glass-card" id={section.id}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {section.icon}
                {section.title}
              </h3>
              <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h4 style={{ marginBottom: '1.5rem' }}>Jump to Section</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sections.map(section => (
                <a 
                  key={section.id} 
                  href={`#${section.id}`} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem 1rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '0.75rem', 
                    color: 'var(--text-primary)', 
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  {section.title.split('. ')[1]}
                  <ArrowRight size={16} className="gradient-text" />
                </a>
              ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} className="gradient-text" />
                <span style={{ fontWeight: 'bold' }}>Deployment Ready</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                This platform is optimized for Government of Jharkhand institutional standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
