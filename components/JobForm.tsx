import React, { useState } from 'react';
import { Job, Role, User } from '../types';
import { PlusCircleIcon } from './icons';

interface JobFormProps {
  onAddJob: (jobData: Omit<Job, 'id' | 'status' | 'createdAt'>) => void;
  currentUser: User;
  salesUsers: User[];
  supportUsers: User[];
}

const COMPANY_JOB_ID = 'COMPANY_JOB'; // Unique identifier for company jobs

const JobForm: React.FC<JobFormProps> = ({ onAddJob, currentUser, salesUsers, supportUsers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [salespersonId, setSalespersonId] = useState(currentUser.role === Role.Sales ? currentUser.id : '');
  const [supportHandlerId, setSupportHandlerId] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกหัวข้องาน');
      return;
    }
    if (!dueDate) {
        alert('กรุณาระบุวันที่และเวลาที่ต้องการงาน');
        return;
    }
     if (currentUser.role === Role.Support && !salespersonId) {
        alert('กรุณาเลือกเซลเจ้าของงาน หรือเลือกเป็นงานบริษัท');
        return;
    }

    if(new Date(dueDate) < new Date()) {
        alert('วันที่และเวลาที่ต้องการงานต้องไม่เป็นเวลาในอดีต');
        return;
    }

    onAddJob({ title, description, dueDate: new Date(dueDate), salespersonId, supportHandlerId: supportHandlerId || undefined });
    setTitle('');
    setDescription('');
    setDueDate('');
    if (currentUser.role === Role.Support) {
        setSalespersonId('');
        setSupportHandlerId('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <PlusCircleIcon className="w-6 h-6 mr-2 text-primary-500" />
        สร้างงานใหม่
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentUser.role === Role.Support && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="salesperson" className="block text-sm font-medium text-gray-700">
                        มอบหมายให้ (เซลล์)
                    </label>
                    <select
                        id="salesperson"
                        value={salespersonId}
                        onChange={(e) => setSalespersonId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                    >
                        <option value="" disabled>-- เลือกเจ้าของงาน --</option>
                        <option value={COMPANY_JOB_ID}>งานบริษัท (ส่วนกลาง)</option>
                        {salesUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="supportHandler" className="block text-sm font-medium text-gray-700">
                        ผู้รับผิดชอบ (Support)
                    </label>
                    <select
                        id="supportHandler"
                        value={supportHandlerId}
                        onChange={(e) => setSupportHandlerId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="">-- ยังไม่มอบหมาย --</option>
                        {supportUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            หัวข้องาน
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="เช่น ติดตามลูกค้า"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            รายละเอียด
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="เพิ่มรายละเอียดเกี่ยวกับงาน..."
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            วันที่และเวลาที่ต้องการงาน
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          เพิ่มงานเข้าคิว
        </button>
      </form>
    </div>
  );
};

export default JobForm;
