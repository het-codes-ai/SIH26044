import { request } from './client';
import {
  StudentLearningProfile,
  LearningPathway,
  SyllabusProgressItem,
  DailySyllabusUpdate,
  InstituteScheduleItem,
  PersonalScheduleItem,
  PracticeTestQuestion,
  PracticeTestRecord,
  InstituteQueryItem,
  InstituteGuidanceItem,
  ResearchPaper,
  EducationalOpportunity
} from '../types';

export const studentApi = {
  // 1. Profile & Onboarding
  async getProfile(): Promise<{ profile: StudentLearningProfile }> {
    return request('/api/student/profile');
  },

  async updateProfile(data: Record<string, any>): Promise<{ message: string; updated: any }> {
    return request('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding(data: Record<string, any>): Promise<{ message: string; onboarding: any }> {
    return request('/api/student/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSubjectCatalog(): Promise<{ subjects: any[]; categories: string[] }> {
    return request('/api/student/subjects/catalog');
  },

  // 2. Diagnostic Assessment
  async getDiagnosticQuestions(subjectName: string): Promise<{
    subject: string;
    total_questions: number;
    difficulty_mix: string;
    questions: any[];
  }> {
    return request(`/api/student/diagnostic/${encodeURIComponent(subjectName)}/questions`);
  },

  async submitDiagnosticTest(subjectName: string, answers: Record<string, string>): Promise<{
    message: string;
    score: number;
    knowledge_level: string;
    topics_mastered: string[];
    topics_partially_understood: string[];
    topics_needs_improvement: string[];
    pathway_created: boolean;
  }> {
    return request(`/api/student/diagnostic/${encodeURIComponent(subjectName)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // 3. Adaptive Learning Pathways
  async getPathways(): Promise<{ pathways: LearningPathway[] }> {
    return request('/api/student/pathways');
  },

  async updateTopicStatus(subjectName: string, topicId: string, status: string): Promise<any> {
    return request(`/api/student/pathways/${encodeURIComponent(subjectName)}/topics/${encodeURIComponent(topicId)}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  // 4. Syllabus Progress & Fit Score
  async getSyllabus(): Promise<{
    syllabus_progress: SyllabusProgressItem[];
    daily_updates: DailySyllabusUpdate[];
    potential_score: number;
    syllabus_progress_rate: number;
  }> {
    return request('/api/student/syllabus');
  },

  async addDailyUpdate(data: {
    subject_name: string;
    completed_topics?: string;
    revision_topics?: string;
    practice_count?: number;
    study_minutes?: number;
    notes?: string;
    log_date?: string;
  }): Promise<any> {
    return request('/api/student/syllabus/daily-update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 5. Schedules (Personal + Institute + AI Timetable)
  async getSchedules(): Promise<{
    institute_schedules: InstituteScheduleItem[];
    personal_schedules: PersonalScheduleItem[];
    extra_learning_logs: any[];
  }> {
    return request('/api/student/schedules');
  },

  async addPersonalScheduleItem(data: Partial<PersonalScheduleItem>): Promise<any> {
    return request('/api/student/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePersonalScheduleItem(id: number, data: Partial<PersonalScheduleItem>): Promise<any> {
    return request(`/api/student/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePersonalScheduleItem(id: number): Promise<any> {
    return request(`/api/student/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  async aiGenerateTimetable(data?: { free_time_preference?: string; daily_available_hours?: number }): Promise<{
    message: string;
    generated_items: number;
    schedule: any[];
  }> {
    return request('/api/student/schedules/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  async trackExtraTime(data: { skill_or_subject: string; duration_minutes: number; notes?: string }): Promise<any> {
    return request('/api/student/schedules/track-extra-time', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 6. Weak Subject Detection & Daily Practice Tests
  async getWeakSubjects(): Promise<{
    weak_subjects: any[];
    has_weak_subjects: boolean;
    recommendation: string;
  }> {
    return request('/api/student/weak-subjects');
  },

  async getTodayPracticeTest(subject?: string): Promise<{
    subject: string;
    test_title: string;
    total_questions: number;
    questions: PracticeTestQuestion[];
  }> {
    const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return request(`/api/student/practice-test/today${q}`);
  },

  async submitPracticeTest(data: {
    subject_name: string;
    topic_name?: string;
    answers: Record<string, string>;
  }): Promise<{
    message: string;
    score: number;
    accuracy: string;
    new_practice_average: string;
    mistakes: string[];
  }> {
    return request('/api/student/practice-test/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPracticeVsExam(): Promise<{
    practice_history: PracticeTestRecord[];
    exam_history: any[];
    comparison_summary: any[];
  }> {
    return request('/api/student/practice-vs-exam');
  },

  // 7. Learning Resources (Multilingual, Visual, Practical)
  async getLearningResources(): Promise<{ resources: any[] }> {
    return request('/api/student/learning-resources');
  },

  // 8. Institute Mentoring & Queries
  async getQueries(): Promise<{ queries: InstituteQueryItem[] }> {
    return request('/api/student/queries');
  },

  async raiseQuery(data: {
    subject_name?: string;
    query_type?: string;
    title: string;
    question_text: string;
  }): Promise<{ message: string; query_id: number }> {
    return request('/api/student/queries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getGuidance(): Promise<{ guidance: InstituteGuidanceItem[] }> {
    return request('/api/student/guidance');
  },

  // 9. Academician Research Interaction
  async getResearchPapers(): Promise<{ papers: ResearchPaper[] }> {
    return request('/api/student/research/papers');
  },

  async askResearchQuestion(paperId: number | string, question: string): Promise<{ message: string; discussion_id: number }> {
    return request(`/api/student/research/papers/${paperId}/discussions`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  // 10. Educational & Developmental Opportunities
  async getOpportunities(): Promise<{ opportunities: EducationalOpportunity[] }> {
    return request('/api/student/opportunities');
  },

  // 11. Knowledge-Gap Reporting
  async reportKnowledgeGap(data: {
    subject_name: string;
    topic_name: string;
    feedback_type: string;
    description: string;
  }): Promise<{ message: string; feedback_id: number }> {
    return request('/api/student/feedback/knowledge-gap', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 12. Document upload
  async uploadDocument(documentType: string, fileUrl: string): Promise<any> {
    return request('/api/student/documents', {
      method: 'POST',
      body: JSON.stringify({ document_type: documentType, file_url: fileUrl }),
    });
  },

  // Backwards-compatibility
  async getPostings(): Promise<{ postings: any[] }> {
    return request('/api/academician/postings');
  },
  async getMyApplications(): Promise<{ my_applications: any[] }> {
    return { my_applications: [] };
  },
  async applyToPosting(id: number | string): Promise<any> {
    return request('/api/student/opportunities');
  },
};
