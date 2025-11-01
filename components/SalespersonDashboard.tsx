import React from 'react';
import { Job, JobStatus, User, Role } from '../types';
import { UserGroupIcon, UserIcon } from './icons';

interface SalespersonDashboardProps {
    salesUsers: User[];
    jobs: Job[];
    currentUser: User;
}

const SalespersonDashboard: React.FC<SalespersonDashboardProps> = ({ salesUsers, jobs, currentUser }) => {
    
    const getJobsForSalesperson = (salespersonId: string) => {
        return jobs.filter(job => job.salespersonId === salespersonId);
    };

    const isSalesRole = currentUser.role === Role.Sales;
    const teamToList = isSalesRole 
        ? salesUsers.filter(s => s.id === currentUser.id) 
        : salesUsers;
    const title = isSalesRole ? 'สถิติของฉัน' : 'ทีมฝ่ายขาย';
    const TitleIcon = isSalesRole ? UserIcon : UserGroupIcon;
    
    const getFullName = (user: User) => `${user.firstName} ${user.lastName}`;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <TitleIcon className="w-6 h-6 mr-2 text-primary-500" />
                {title}
            </h2>
            <ul className="space-y-4">
                {teamToList.map(person => {
                    const personJobs = getJobsForSalesperson(person.id);
                    const now = new Date();
                    const overdueCount = personJobs.filter(j => j.status !== JobStatus.Completed && new Date(j.dueDate) < now).length;
                    const inProgressCount = personJobs.filter(j => j.status === JobStatus.InProgress).length;
                    const queuedCount = personJobs.filter(j => j.status === JobStatus.Queued).length;
                    const completedCount = personJobs.filter(j => j.status === JobStatus.Completed).length;
                    const personName = getFullName(person);

                    return (
                        <li key={person.id} className="flex items-center space-x-4">
                           {person.avatarUrl ? (
                                <img className="w-12 h-12 rounded-full" src={person.avatarUrl} alt={personName} />
                           ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                                    {person.firstName.charAt(0)}
                                </div>
                           )}
                           <div className="flex-1">
                                <p className="font-semibold text-gray-900">{personName}</p>
                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                                    {overdueCount > 0 && (
                                        <span>
                                            <span className="font-medium text-red-600">{overdueCount}</span> เลยกำหนด
                                        </span>
                                    )}
                                    <span>
                                        <span className="font-medium text-gray-600">{queuedCount}</span> อยู่ในคิว
                                    </span>
                                    <span>
                                        <span className="font-medium text-blue-600">{inProgressCount}</span> กำลังทำ
                                    </span>
                                    <span>
                                        <span className="font-medium text-green-600">{completedCount}</span> เสร็จสิ้น
                                    </span>
                                </div>
                           </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SalespersonDashboard;