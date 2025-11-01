import React, { useState } from 'react';
import { Job, JobStatus, User, Role } from '../types';
import { QueueListIcon, ClockIcon, PlayIcon, CheckCircleIcon, UserIcon, CalendarDaysIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from './icons';

interface CompleteJobModalProps {
    job: Job;
    salesperson: User;
    currentUser: User;
    onClose: () => void;
    onConfirm: (job: Job, files: FileList | null, notes: string) => void;
}

const CompleteJobModal: React.FC<CompleteJobModalProps> = ({ job, salesperson, currentUser, onClose, onConfirm }) => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        onConfirm(job, files, notes);
    };

    // FIX: Explicitly type `f` as `File` to help TypeScript infer the correct type.
    const fileNames = files ? Array.from(files).map((f: File) => f.name).join(', ') : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">ส่งมอบงาน: {job.title}</h3>
                    <p className="text-sm text-gray-500">ถึง: {salesperson.firstName} {salesperson.lastName}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">แนบไฟล์ (ถ้ามี)</label>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                        />
                        {files && files.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1 truncate" title={fileNames}>
                                เลือกแล้ว {files.length} ไฟล์: {fileNames}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">บันทึกถึงเซล</label>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="เพิ่มข้อความ..."
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        ยกเลิก
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        เสร็จสิ้นและส่งมอบงาน
                    </button>
                </div>
            </div>
        </div>
    );
};


interface JobCardProps {
  job: Job;
  salesperson?: User;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onInitiateComplete: (job: Job) => void;
  currentUser: User;
}

const JobCard: React.FC<JobCardProps> = ({ job, salesperson, onUpdateJobStatus, onInitiateComplete, currentUser }) => {
    const statusTextMap: Record<JobStatus, string> = {
        [JobStatus.Queued]: 'อยู่ในคิว',
        [JobStatus.InProgress]: 'กำลังดำเนินการ',
        [JobStatus.Completed]: 'เสร็จสิ้น',
    };

    const isOverdue = job.status !== JobStatus.Completed && new Date(job.dueDate) < new Date();

    const statusConfig = {
        [JobStatus.Queued]: {
            icon: <ClockIcon className="w-5 h-5 text-gray-400" />,
            bgColor: isOverdue ? 'bg-red-100' : 'bg-gray-100',
            textColor: 'text-gray-500',
            actions: [
                <button key="start" onClick={() => onUpdateJobStatus(job.id, JobStatus.InProgress)} className="text-sm font-medium text-primary-600 hover:text-primary-900">เริ่มงาน</button>
            ]
        },
        [JobStatus.InProgress]: {
            icon: <PlayIcon className="w-5 h-5 text-blue-500" />,
            bgColor: isOverdue ? 'bg-red-100' : 'bg-blue-50',
            textColor: 'text-blue-700',
            actions: [
                <button key="complete" onClick={() => onInitiateComplete(job)} className="text-sm font-medium text-green-600 hover:text-green-900">เสร็จสิ้น</button>
            ]
        },
        [JobStatus.Completed]: {
            icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            actions: []
        }
    };

    const config = statusConfig[job.status];

    const getDueDateInfo = (date: Date, status: JobStatus, completedAt?: Date) => {
        const today = new Date();
        const dueDate = new Date(date);

        const localeOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        
        const formattedDueDate = dueDate.toLocaleString('th-TH', localeOptions);

        if (status === JobStatus.Completed) {
            const formattedCompletedDate = completedAt 
                ? new Date(completedAt).toLocaleString('th-TH', localeOptions)
                : '';
            return { label: `เสร็จสิ้น ${formattedCompletedDate}`, colorClass: 'text-gray-500' };
        }

        if (dueDate < today) {
            return { label: `เลยกำหนด`, colorClass: 'text-red-600 font-bold' };
        }
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        if (diffHours <= 48) {
            return { label: `กำหนดส่ง ${formattedDueDate}`, colorClass: 'text-amber-600 font-semibold' };
        }

        return { label: `กำหนดส่ง ${formattedDueDate}`, colorClass: 'text-gray-500' };
    };
    
    const salespersonName = salesperson ? `${salesperson.firstName} ${salesperson.lastName}` : 'ไม่ระบุ';
    const { label: dueDateLabel, colorClass: dueDateColor } = getDueDateInfo(job.dueDate, job.status, job.completedAt);

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${config.bgColor}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-semibold text-gray-800">{job.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{job.description}</p>
            </div>
             <div className={`flex items-center space-x-2 text-sm whitespace-nowrap ${dueDateColor}`}>
                <CalendarDaysIcon className="w-4 h-4" />
                <span>{dueDateLabel}</span>
            </div>
        </div>

        {job.status === JobStatus.Completed && (job.workDurationDays !== undefined && job.overdueDays !== undefined) && (
            <div className="mt-3 pt-3 border-t border-green-200 text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                    <p className="font-semibold w-24">สรุปผล:</p>
                    <div className="flex gap-x-4">
                        <span>ใช้เวลาทำ: <strong>{job.workDurationDays} วัน</strong></span>
                        <span>สถานะ: 
                            {job.overdueDays > 0
                                ? <span className="font-bold text-red-600"> เลยกำหนด {job.overdueDays} วัน</span>
                                : <span className="font-bold text-green-700"> ทันกำหนด</span>
                            }
                        </span>
                    </div>
                </div>
            </div>
        )}

        <div className="mt-4 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-2">
                {config.icon}
                <span className={`${config.textColor} font-medium capitalize`}>{statusTextMap[job.status]}</span>
            </div>
            <div className="flex items-center space-x-4">
                 {salesperson ? (
                    <div className="flex items-center space-x-2" title={`มอบหมายให้ ${salespersonName}`}>
                        <img className="w-6 h-6 rounded-full" src={salesperson.avatarUrl} alt={salespersonName}/>
                        <span className="text-gray-600 hidden sm:block">{salespersonName}</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                        <UserIcon className="w-5 h-5"/>
                        <span>ไม่ระบุ</span>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    {currentUser.role === Role.Support && config.actions}
                </div>
            </div>
        </div>
    </div>
  );
};

interface JobQueueProps {
  jobs: Job[];
  salesUsers: User[];
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  currentUser: User;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, salesUsers, onUpdateJobStatus, currentUser }) => {
    const [completingJob, setCompletingJob] = useState<Job | null>(null);
    const findSalesUser = (id?: string) => salesUsers.find(s => s.id === id);

    const handleInitiateComplete = (job: Job) => {
        setCompletingJob(job);
    };

    const handleConfirmComplete = (job: Job, files: FileList | null, notes: string) => {
        const salesperson = findSalesUser(job.salespersonId);
        if (!salesperson) {
            alert('ไม่พบข้อมูลเซลล์เจ้าของงาน');
            return;
        }

        const subject = `งานเสร็จสิ้น: ${job.title}`;
        
        let fileAttachmentInfo = '';
        if (files && files.length > 0) {
            const fileNames = Array.from(files).map(f => f.name).join(', ');
            fileAttachmentInfo = `มีการแนบไฟล์ ${files.length} ไฟล์: ${fileNames}\n\n**สำคัญ: กรุณาแนบไฟล์นี้ด้วยตนเองเมื่อส่งอีเมล**`;
        }

        const body = `สวัสดีคุณ ${salesperson.firstName},

งานของคุณ '${job.title}' ได้ดำเนินการเสร็จสิ้นแล้ว

รายละเอียดงาน:
${job.description}

${notes ? `บันทึกจากทีมซัพพอร์ต:\n${notes}\n\n` : ''}${fileAttachmentInfo ? `${fileAttachmentInfo}\n\n` : ''}ขอแสดงความนับถือ,
${currentUser.firstName} ${currentUser.lastName}
(${currentUser.email})
`;

        const mailtoLink = `mailto:${salesperson.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        onUpdateJobStatus(job.id, JobStatus.Completed);
        setCompletingJob(null);
    };

    const now = new Date();
    const overdueJobs = jobs.filter(j => j.status !== JobStatus.Completed && new Date(j.dueDate) < now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const inProgressJobs = jobs.filter(j => j.status === JobStatus.InProgress && new Date(j.dueDate) >= now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const queuedJobs = jobs.filter(j => j.status === JobStatus.Queued && new Date(j.dueDate) >= now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const completedJobs = jobs.filter(j => j.status === JobStatus.Completed).sort((a, b) => (b.completedAt?.getTime() ?? b.createdAt.getTime()) - (a.completedAt?.getTime() ?? a.createdAt.getTime()));
    
    const completingJobSalesperson = completingJob ? findSalesUser(completingJob.salespersonId) : undefined;
    
  return (
    <>
    {completingJob && completingJobSalesperson && (
        <CompleteJobModal 
            job={completingJob} 
            salesperson={completingJobSalesperson}
            currentUser={currentUser}
            onClose={() => setCompletingJob(null)}
            onConfirm={handleConfirmComplete}
        />
    )}
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <QueueListIcon className="w-6 h-6 mr-2 text-primary-500" />
        คิวงานทั้งหมด
      </h2>
      <div className="space-y-6">
        {overdueJobs.length > 0 && (
          <section className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                งานเลยกำหนด ({overdueJobs.length})
              </h3>
              <div className="space-y-3">
                  {overdueJobs.map(job => (
                      <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} currentUser={currentUser}/>
                  ))}
              </div>
          </section>
        )}
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-3">กำลังดำเนินการ ({inProgressJobs.length})</h3>
            <div className="space-y-3">
                {inProgressJobs.length > 0 ? inProgressJobs.map(job => (
                    <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} currentUser={currentUser}/>
                )) : <p className="text-gray-500 text-sm">ไม่มีงานที่กำลังดำเนินการ</p>}
            </div>
        </section>
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-3">อยู่ในคิว ({queuedJobs.length})</h3>
            <div className="space-y-3">
                {queuedJobs.length > 0 ? queuedJobs.map(job => (
                    <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} currentUser={currentUser}/>
                )) : <p className="text-gray-500 text-sm">ไม่มีงานอยู่ในคิว</p>}
            </div>
        </section>
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-3">เสร็จสิ้น ({completedJobs.length})</h3>
            <div className="space-y-3">
                {completedJobs.length > 0 ? completedJobs.map(job => (
                    <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} currentUser={currentUser}/>
                )) : <p className="text-gray-500 text-sm">ยังไม่มีงานที่เสร็จสิ้น</p>}
            </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default JobQueue;