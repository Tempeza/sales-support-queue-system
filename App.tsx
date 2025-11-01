
import React, { useState, useCallback, useEffect } from 'react';
import { Job, JobStatus, User, Role } from './types';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import JobForm from './components/JobForm';
import JobQueue from './components/JobQueue';
import SalespersonDashboard from './components/SalespersonDashboard';

// --- IMPORTANT ---
// Replace this with your actual Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0qt-sUfEl_lQD0itauwCBQQPIgS0sOtuTTacZVW-CFWpVawOkL0EvfjFt2TvgmPHs5g/exec';

const THEMES = {
  indigo: {
    '50': '239 246 255', '100': '219 234 254', '200': '191 219 254',
    '300': '147 197 253', '400': '96 165 250', '500': '59 130 246',
    '600': '37 99 235', '700': '29 78 216', '800': '30 64 175',
    '900': '30 58 138', '950': '23 37 84',
  },
  sky: {
    '50': '240 249 255', '100': '224 242 254', '200': '186 230 253',
    '300': '125 211 252', '400': '56 189 248', '500': '14 165 233',
    '600': '2 132 199', '700': '3 105 161', '800': '7 89 133',
    '900': '12 74 110', '950': '8 47 73',
  },
  emerald: {
    '50': '236 253 245', '100': '209 250 229', '200': '167 243 208',
    '300': '110 231 183', '400': '52 211 153', '500': '16 185 129',
    '600': '5 150 105', '700': '4 120 87', '800': '6 95 70',
    '900': '6 78 59', '950': '2 44 34',
  },
  rose: {
    '50': '255 241 242', '100': '255 228 230', '200': '254 205 211',
    '300': '253 164 175', '400': '251 113 133', '500': '244 63 94',
    '600': '225 29 72', '700': '190 18 60', '800': '159 18 57',
    '900': '136 19 55', '950': '76 5 25',
  },
};
export type ThemeName = keyof typeof THEMES;

const applyTheme = (themeName: ThemeName) => {
  const theme = THEMES[themeName];
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-primary-${key}`, value);
  });
  localStorage.setItem('app-theme', themeName);
};

// Helper to parse dates from API response
const parseJobDates = (job: any): Job => ({
  ...job,
  dueDate: new Date(job.dueDate),
  createdAt: new Date(job.createdAt),
  completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
});


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>(() => (localStorage.getItem('app-theme') as ThemeName) || 'indigo');
  
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (GOOGLE_APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID') || !GOOGLE_APPS_SCRIPT_URL) {
      setError('กรุณาตั้งค่า URL ของ Google Apps Script ในไฟล์ App.tsx');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getInitialData`);
      if (!response.ok) {
          throw new Error(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${response.statusText}`);
      }
      const data = await response.json();
      const allUsers = data.users || [];
      setRegisteredUsers(allUsers);
      setJobs((data.jobs || []).map(parseJobDates));
    } catch (err: any) {
      console.error(err);
      setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message}. โปรดตรวจสอบ URL ของ Google Apps Script และการตั้งค่า CORS`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users and jobs from Google Apps Script
  useEffect(() => {
    setLoading(true);
    fetchInitialData();
  }, [fetchInitialData]);

  // Real-time polling for updates
  useEffect(() => {
    if (!user) return; // Don't poll if not logged in

    const intervalId = setInterval(async () => {
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getInitialData`);
            if (response.ok) {
                const data = await response.json();
                setJobs((data.jobs || []).map(parseJobDates));
                setRegisteredUsers(data.users || []);
            }
        } catch (err) {
            console.error("Polling for data failed:", err);
        }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount or user change
  }, [user]);
  
  const handleRegister = async (newUser: Omit<User, 'id'>) => {
    const payload = {
      action: 'register',
      user: newUser
    };

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid CORS preflight
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'การลงทะเบียนล้มเหลว');
    }

    const registeredUser: User = result.user;
    
    const fullUserForLogin = { ...registeredUser, password: newUser.password };

    setRegisteredUsers(prev => [...prev, fullUserForLogin]);
    
    const { password, ...userToStore } = fullUserForLogin;
    localStorage.setItem('loggedInUser', JSON.stringify(userToStore));
    setUser(userToStore);
  };

  const handleLogin = async (email: string, password_raw: string): Promise<boolean> => {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'login', email, password: password_raw })
    });

    const result = await response.json();
    if(result.status === 'success') {
       const { password, ...userToStore } = result.user;
       localStorage.setItem('loggedInUser', JSON.stringify(userToStore));
       setUser(userToStore);
       return true;
    } else {
       throw new Error(result.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
  };

  const handleAddJob = useCallback(async (jobData: Omit<Job, 'id' | 'status' | 'createdAt'>) => {
    try {
      const payload = {
        action: 'addJob',
        job: jobData
      };

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message || 'ไม่สามารถเพิ่มงานได้');

      const newJob = parseJobDates(result.job);
      setJobs(prevJobs => [newJob, ...prevJobs].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));

    } catch (error: any) {
        console.error("Failed to add job:", error);
        alert(`เกิดข้อผิดพลาดในการเพิ่มงานใหม่: ${error.message}`);
    }
  }, []);
  
  const handleUpdateJobStatus = useCallback(async (jobId: string, status: JobStatus) => {
    const originalJobs = jobs;
    const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, status, ...(status === JobStatus.Completed && { completedAt: new Date() }) } : job
    );
    setJobs(updatedJobs);

    try {
        const payload = {
          action: 'updateJobStatus',
          jobId: jobId,
          status: status
        };

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        
        setJobs(prev => prev.map(j => j.id === jobId ? parseJobDates(result.job) : j).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));

    } catch (error: any) {
        console.error("Failed to update job status:", error);
        alert(`เกิดข้อผิดพลาดในการอัปเดตสถานะงาน: ${error.message}`);
        setJobs(originalJobs); // Rollback on error
    }
  }, [jobs]);

  const handleDeleteJob = useCallback(async (jobId: string) => {
    const originalJobs = jobs;
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId)); // Optimistic update

    try {
        const payload = {
            action: 'deleteJob', // Reverted to 'deleteJob' as the most likely action name.
            jobId: jobId,
        };
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.status !== 'success') {
            throw new Error(result.message || 'ไม่สามารถลบงานบนเซิร์ฟเวอร์ได้');
        }
    } catch (error: any) {
        console.error("Failed to delete job:", error);
        alert(`เกิดข้อผิดพลาดในการลบงาน: ${error.message}`);
        setJobs(originalJobs); // Rollback on error
    }
  }, [jobs]);

  const handleChangeTheme = useCallback((newTheme: ThemeName) => {
    applyTheme(newTheme);
    setTheme(newTheme);
  }, []);

  if (loading && !user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center space-y-4">
                  <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-lg font-semibold text-gray-700">กำลังเชื่อมต่อกับ Google Sheet...</p>
              </div>
          </div>
      );
  }

  if (error) {
       return (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
              <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md">
                  <h2 className="text-2xl font-bold text-red-600">เกิดข้อผิดพลาดในการเชื่อมต่อ</h2>
                  <p className="text-gray-700 mt-2">{error}</p>
                   <p className="text-xs text-gray-500 mt-4">
                    โปรดตรวจสอบว่าคุณได้ใส่ URL ของ Google Apps Script ที่ถูกต้องในไฟล์ App.tsx และได้ปรับใช้สคริปต์ให้ทุกคนสามารถเข้าถึงได้
                  </p>
              </div>
          </div>
      );
  }


  if (!user) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }
  
  const salesUsers = registeredUsers.filter(u => u.role === Role.Sales);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header user={user} onLogout={handleLogout} currentTheme={theme} onChangeTheme={handleChangeTheme} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <JobQueue jobs={jobs} salesUsers={salesUsers} onUpdateJobStatus={handleUpdateJobStatus} onDeleteJob={handleDeleteJob} currentUser={user} />
            </div>
            <div className="space-y-8">
              {(user.role === Role.Sales || user.role === Role.Support) && (
                <JobForm 
                  onAddJob={handleAddJob}
                  currentUser={user}
                  salesUsers={salesUsers}
                />
              )}
              <SalespersonDashboard salesUsers={salesUsers} jobs={jobs} currentUser={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
