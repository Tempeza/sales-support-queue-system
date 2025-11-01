import React from 'react';
import { Job, JobStatus, User, Role } from '../types';
import { ClockIcon, PlayIcon, CheckCircleIcon, UserIcon, CalendarDaysIcon, TrashIcon, WrenchScrewdriverIcon } from './icons';

interface JobCardProps {
  job: Job;
  salesperson?: User;
  supportHandler?: User;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => void;
  onInitiateComplete: (job: Job) => void;
  onInitiateDelete: (job: Job) => void;
  currentUser: User;
}

const JobCard: React.FC<JobCardProps> = ({ job, salesperson, supportHandler, onUpdateJobStatus, onInitiateComplete, onInitiateDelete, currentUser }) => {
    const statusTextMap: Record<JobStatus, string> = {
        [JobStatus.Queued]: 'อยู่ในคิว',
        [JobStatus.InProgress]: 'กำลังดำเนินการ',
        [JobStatus.Completed]: 'เสร็จสิ้น',
    };

    const isOverdue = job.status !== JobStatus.Completed && new Date(job.dueDate) < new Date();

    const statusConfig = {
        [JobStatus.Queued]: {
            icon: <ClockIcon className="w-5 h-5 text-gray-400" />,
            bgColor: isOverdue ? 'bg-red-100 border-red-200' : 'bg-gray-100 border-gray-200',
            textColor: 'text-gray-500',
            actions: [
                <button key="start" onClick={() => onUpdateJobStatus(job.id, JobStatus.InProgress)} className="text-sm font-medium text-primary-600 hover:text-primary-900">เริ่มงาน</button>
            ]
        },
        [JobStatus.InProgress]: {
            icon: <PlayIcon className="w-5 h-5 text-blue-500" />,
            bgColor: isOverdue ? 'bg-red-100 border-red-200' : 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-700',
            actions: [
                <button key="complete" onClick={() => onInitiateComplete(job)} className="text-sm font-medium text-green-600 hover:text-green-900">เสร็จสิ้น</button>
            ]
        },
        [JobStatus.Completed]: {
            icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
            bgColor: 'bg-green-50 border-green-200',
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
    const supportHandlerName = supportHandler ? `${supportHandler.firstName} ${supportHandler.lastName}` : 'ไม่ระบุ';
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
                 {supportHandler && (
                    <div className="flex items-center space-x-2" title={`รับผิดชอบโดย ${supportHandlerName}`}>
                       <WrenchScrewdriverIcon className="w-5 h-5 text-gray-500" />
                       {supportHandler.avatarUrl ?
                           <img className="w-6 h-6 rounded-full" src={supportHandler.avatarUrl} alt={supportHandlerName}/>
                           : <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{supportHandler.firstName.charAt(0)}</div>
                       }
                       <span className="text-gray-600 hidden sm:block">{supportHandlerName}</span>
                   </div>
                 )}
                 {salesperson ? (
                    <div className="flex items-center space-x-2" title={`งานของ ${salespersonName}`}>
                        <UserIcon className="w-5 h-5 text-gray-500"/>
                        {salesperson.avatarUrl ?
                            <img className="w-6 h-6 rounded-full" src={salesperson.avatarUrl} alt={salespersonName}/>
                            : <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{salesperson.firstName.charAt(0)}</div>
                        }
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
                    {currentUser.role === Role.Support && (
                         <button
                            onClick={() => onInitiateDelete(job)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="ลบงาน"
                            aria-label="ลบงาน"
                         >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default JobCard;
