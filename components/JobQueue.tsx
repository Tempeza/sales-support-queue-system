import React, { useState, useMemo } from 'react';
import { Job, JobStatus, User } from '../types';
import { QueueListIcon, ExclamationTriangleIcon, FunnelIcon, MagnifyingGlassIcon } from './icons';
import JobCard from './JobCard';

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
  supportUsers: User[];
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
  currentUser: User;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, salesUsers, supportUsers, onUpdateJobStatus, onDeleteJob, currentUser }) => {
    const [deletingJob, setDeletingJob] = useState<Job | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSalesperson, setSelectedSalesperson] = useState('all');
    
    const findSalesUser = (id?: string) => salesUsers.find(s => s.id === id);
    const findSupportUser = (id?: string) => supportUsers.find(s => s.id === id);
    
    const handleInitiateDelete = (job: Job) => {
        setDeletingJob(job);
    };

    const handleConfirmDelete = (jobId: string) => {
        onDeleteJob(jobId);
        setDeletingJob(null);
    };

    const filteredJobs = useMemo(() => {
      return jobs.filter(job => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
          job.title.toLowerCase().includes(searchTermLower) ||
          job.description.toLowerCase().includes(searchTermLower);
        
        const matchesSalesperson = selectedSalesperson === 'all' || job.salespersonId === selectedSalesperson;

        return matchesSearch && matchesSalesperson;
      });
    }, [jobs, searchTerm, selectedSalesperson]);

    const now = new Date();
    const overdueJobs = filteredJobs.filter(j => j.status !== JobStatus.Completed && new Date(j.dueDate) < now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const inProgressJobs = filteredJobs.filter(j => j.status === JobStatus.InProgress && new Date(j.dueDate) >= now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const queuedJobs = filteredJobs.filter(j => j.status === JobStatus.Queued && new Date(j.dueDate) >= now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const completedJobs = filteredJobs.filter(j => j.status === JobStatus.Completed).sort((a, b) => (b.completedAt?.getTime() ?? b.createdAt.getTime()) - (a.completedAt?.getTime() ?? a.createdAt.getTime()));
    
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSalesperson('all');
    };

    const JobSection = ({ title, count, jobs, icon }: { title: string; count: number; jobs: Job[]; icon: React.ReactNode; }) => {
        if (filteredJobs.length > 0 && jobs.length === 0) return null;
        return (
            <section>
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">{icon}<span className="ml-2">{title} ({count})</span></h3>
                <div className="space-y-3">
                    {jobs.length > 0 ? jobs.map(job => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            salesperson={findSalesUser(job.salespersonId)} 
                            supportHandler={findSupportUser(job.supportHandlerId)}
                            onUpdateJobStatus={onUpdateJobStatus} 
                            onInitiateComplete={() => onUpdateJobStatus(job.id, JobStatus.Completed)} 
                            onInitiateDelete={handleInitiateDelete} 
                            currentUser={currentUser}
                        />
                    )) : <p className="text-gray-500 text-sm">ไม่มีงานในหมวดหมู่นี้</p>}
                </div>
            </section>
        );
    };

  return (
    <>
    {deletingJob && (
        <DeleteJobModal
            job={deletingJob}
            onClose={() => setDeletingJob(null)}
            onConfirm={handleConfirmDelete}
        />
    )}
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <QueueListIcon className="w-6 h-6 mr-2 text-primary-500" />
          คิวงานทั้งหมด
        </h2>
      </div>
      
      {/* --- Filter Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="relative">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
            <MagnifyingGlassIcon className="pointer-events-none absolute top-8 left-3 h-5 w-5 text-gray-400" />
            <input
                type="text"
                id="search"
                placeholder="หัวข้อ, รายละเอียด..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
        </div>
        <div>
            <label htmlFor="salesperson-filter" className="block text-sm font-medium text-gray-700 mb-1">พนักงานขาย</label>
            <select
                id="salesperson-filter"
                value={selectedSalesperson}
                onChange={e => setSelectedSalesperson(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
                <option value="all">พนักงานขายทั้งหมด</option>
                {salesUsers.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                    </option>
                ))}
            </select>
        </div>
        <div className="flex items-end">
             <button
                onClick={clearFilters}
                className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                ล้างตัวกรอง
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {overdueJobs.length > 0 && (
          <section className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                งานเลยกำหนด ({overdueJobs.length})
              </h3>
              <div className="space-y-3">
                  {overdueJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        salesperson={findSalesUser(job.salespersonId)} 
                        supportHandler={findSupportUser(job.supportHandlerId)}
                        onUpdateJobStatus={onUpdateJobStatus} 
                        onInitiateComplete={() => onUpdateJobStatus(job.id, JobStatus.Completed)} 
                        onInitiateDelete={handleInitiateDelete} 
                        currentUser={currentUser}
                      />
                  ))}
              </div>
          </section>
        )}

        {filteredJobs.length === 0 && (
            <div className="text-center py-10">
                <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบงานที่ตรงกับเงื่อนไข</h3>
                <p className="mt-1 text-sm text-gray-500">ลองปรับเปลี่ยนการค้นหาหรือตัวกรองของคุณ</p>
            </div>
        )}
        
        {inProgressJobs.length > 0 && <JobSection title="กำลังดำเนินการ" count={inProgressJobs.length} jobs={inProgressJobs} icon={<ExclamationTriangleIcon className="w-6 h-6 text-blue-500" />} />}
        {queuedJobs.length > 0 && <JobSection title="อยู่ในคิว" count={queuedJobs.length} jobs={queuedJobs} icon={<ExclamationTriangleIcon className="w-6 h-6 text-gray-500" />} />}
        {completedJobs.length > 0 && <JobSection title="เสร็จสิ้น" count={completedJobs.length} jobs={completedJobs} icon={<ExclamationTriangleIcon className="w-6 h-6 text-green-500" />} />}
      </div>
    </div>
    </>
  );
};

export default JobQueue;
