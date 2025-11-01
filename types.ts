// FIX: Removed self-import of `JobStatus` which was causing a circular dependency.
export enum JobStatus {
  Queued = 'queued',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export enum Role {
  Sales = 'Sales',
  Support = 'Support',
}

export interface User {
  id: string;
  email: string;
  password?: string; // Password is optional as we won't pass it around after login
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
}

export interface Job {
  id:string;
  title: string;
  description: string;
  status: JobStatus;
  dueDate: Date;
  createdAt: Date;
  salespersonId: string;
  supportHandlerId?: string; // ID of the support user handling the job
  completedAt?: Date;
  workDurationDays?: number;
  overdueDays?: number;
}
