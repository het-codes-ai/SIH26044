import { request } from './client';
import {
  InstituteScheduleItem,
  InstituteQueryItem,
  StudentAcademicMark
} from '../types';

export const instituteApi = {
  // 1. Dashboard Overview
  async getDashboard(): Promise<{
    institute_stats: {
      enrolled_students: number;
      verified_students: number;
      average_academic_score: number;
      average_syllabus_progress: number;
      average_exam_readiness_fit_score: number;
      students_needing_attention: number;
      pending_student_queries: number;
      upcoming_examinations: any[];
    };
  }> {
    return request('/api/institute/dashboard');
  },

  // 2. Student Monitoring with Filters
  async getStudentsMonitoring(params?: {
    search?: string;
    class_year?: string;
    subject?: string;
    weak_only?: boolean;
    min_marks?: number;
    min_progress?: number;
    min_fit?: number;
  }): Promise<{ total_count: number; students: any[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.class_year) q.append('class_year', params.class_year);
    if (params?.subject) q.append('subject', params.subject);
    if (params?.weak_only) q.append('weak_only', 'true');
    if (params?.min_marks !== undefined) q.append('min_marks', String(params.min_marks));
    if (params?.min_progress !== undefined) q.append('min_progress', String(params.min_progress));
    if (params?.min_fit !== undefined) q.append('min_fit', String(params.min_fit));

    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/api/institute/students${qs}`);
  },

  async getStudentDetail(studentId: number): Promise<{ student: any }> {
    return request(`/api/institute/students/${studentId}`);
  },

  // 3. Academic Marks Management
  async getMarks(): Promise<{ marks: StudentAcademicMark[] }> {
    return request('/api/institute/marks');
  },

  async addMarks(data: {
    student_id: number;
    subject_name: string;
    exam_title: string;
    exam_type?: string;
    marks_obtained: number;
    max_marks?: number;
    remarks?: string;
  }): Promise<{ message: string; mark_id: number; percentage: number; is_weak_subject: boolean }> {
    return request('/api/institute/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Academic Schedule Management
  async getSchedules(): Promise<{ schedules: InstituteScheduleItem[] }> {
    return request('/api/institute/schedules');
  },

  async createSchedule(data: {
    schedule_type: string;
    title: string;
    subject_name: string;
    date: string;
    start_time: string;
    end_time: string;
    venue_or_link?: string;
    target_class?: string;
    notes?: string;
  }): Promise<{ message: string; schedule_id: number }> {
    return request('/api/institute/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteSchedule(scheduleId: number): Promise<{ message: string }> {
    return request(`/api/institute/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  },

  // 5. Mentoring & Student Query Resolution
  async getQueries(): Promise<{ queries: InstituteQueryItem[] }> {
    return request('/api/institute/queries');
  },

  async respondToQuery(queryId: number, responseText: string, status: 'answered' | 'resolved' = 'resolved'): Promise<{ message: string }> {
    return request(`/api/institute/queries/${queryId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response_text: responseText, status }),
    });
  },

  async sendMentoring(data: {
    student_id: number;
    guidance_type: string;
    subject_name?: string;
    message: string;
  }): Promise<{ message: string }> {
    return request('/api/institute/mentoring', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 6. Analytics
  async getAcademicTrends(): Promise<{
    subject_averages: any[];
    correlation_data: any[];
  }> {
    return request('/api/institute/analytics/academic-trends');
  },

  async getKnowledgeGapAnalytics(): Promise<{
    feedbacks: any[];
    frequent_subjects: Record<string, number>;
    gap_types: Record<string, number>;
  }> {
    return request('/api/institute/analytics/knowledge-gaps');
  },

  // 7. Student Verifications
  async getPendingVerifications(): Promise<{ pending_count: number; students: any[] }> {
    return request('/api/institute/verifications/pending');
  },

  async verifyStudent(studentId: number, status: 'verified' | 'rejected'): Promise<any> {
    return request(`/api/institute/verifications/${studentId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getInstitutesList(): Promise<{ institutes: { id: number; name: string; admin_tpo_contact: string; city?: string }[] }> {
    return request('/api/institute/list');
  },
};
