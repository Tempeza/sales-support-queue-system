import React, { useState } from 'react';
import { Job, JobStatus, User, Role } from '../types';
import { QueueListIcon, ClockIcon, PlayIcon, CheckCircleIcon, UserIcon, CalendarDaysIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from './icons';
import JobCard from './JobCard';

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

interface DeleteJobModalProps {
    job: Job;
    onClose: () => void;
    onConfirm: (jobId: string) => void;
}

const DeleteJobModal: React.FC<DeleteJobModalProps> = ({ job, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            ยืนยันการลบงาน
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                คุณแน่ใจหรือไม่ว่าต้องการลบงาน "{job.title}"? การกระทำนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => onConfirm(job.id)}
                >
                    ลบ
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                >
                    ยกเลิก
                </button>
            </div>
        </div>
    </div>
);

interface JobQueueProps {
  jobs: Job[];
  salesUsers: User[];
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
  currentUser: User;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, salesUsers, onUpdateJobStatus, onDeleteJob, currentUser }) => {
    const [completingJob, setCompletingJob] = useState<Job | null>(null);
    const [deletingJob, setDeletingJob] = useState<Job | null>(null);
    
    const findSalesUser = (id?: string) => salesUsers.find(s => s.id === id);

    const handleInitiateComplete = (job: Job) => {
        setCompletingJob(job);
    };
    
    const handleInitiateDelete = (job: Job) => {
        setDeletingJob(job);
    };

    const handleConfirmDelete = (jobId: string) => {
        onDeleteJob(jobId);
        setDeletingJob(null);
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
    {deletingJob && (
        <DeleteJobModal
            job={deletingJob}
            onClose={() => setDeletingJob(null)}
            onConfirm={handleConfirmDelete}
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
                      <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} onInitiateDelete={handleInitiateDelete} currentUser={currentUser}/>
                  ))}
              </div>
          </section>
        )}
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-3">กำลังดำเนินการ ({inProgressJobs.length})</h3>
            <div className="space-y-3">
                {inProgressJobs.length > 0 ? inProgressJobs.map(job => (
                    <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} onInitiateDelete={handleInitiateDelete} currentUser={currentUser}/>
                )) : <p className="text-gray-500 text-sm">ไม่มีงานที่กำลังดำเนินการ</p>}
            </div>
        </section>
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-3">อยู่ในคิว ({queuedJobs.length})</h3>
            <div className="space-y-3">
                {queuedJobs.length > 0 ? queuedJobs.map(job => (
                    <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} onInitiateDelete={handleInitiateDelete} currentUser={currentUser}/>
                )) : <p className="text-gray-500 text-sm">ไม่มีงานอยู่ในคิว</p>}
            </div>
        </section>
        <section>
            <h3 className="text-lg font-medium text-gray-700 mb-3">เสร็จสิ้น ({completedJobs.length})</h3>
            <div className="space-y-3">
                {completedJobs.length > 0 ? completedJobs.map(job => (
                    <JobCard key={job.id} job={job} salesperson={findSalesUser(job.salespersonId)} onUpdateJobStatus={onUpdateJobStatus} onInitiateComplete={handleInitiateComplete} onInitiateDelete={handleInitiateDelete} currentUser={currentUser}/>
                )) : <p className="text-gray-500 text-sm">ยังไม่มีงานที่เสร็จสิ้น</p>}
            </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default JobQueue;
