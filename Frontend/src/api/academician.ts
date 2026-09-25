import { request } from './client';
import { BackendPosting, ResearchPaper } from '../types';

export const academicianApi = {
  async getMyPostings(): Promise<{ postings: BackendPosting[] }> {
    return request('/api/academician/postings');
  },

  async createPosting(data: {
    title: string;
    description: string;
    required_skills: string;
    posting_type: string;
  }): Promise<{ message: string; posting: any }> {
    return request('/api/academician/postings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyPapers(): Promise<{ papers: ResearchPaper[] }> {
    return request('/api/academician/papers');
  },

  async publishPaper(data: {
    title: string;
    field: string;
    abstract?: string;
    desc?: string;
    pdf_url?: string;
  }): Promise<{ message: string; paper_id: number }> {
    return request('/api/academician/papers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAllDiscussions(): Promise<{ discussions: any[] }> {
    return request('/api/academician/discussions');
  },

  async respondToDiscussion(discId: number, response: string): Promise<{ message: string }> {
    return request(`/api/academician/discussions/${discId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },

  async giveFeedback(studentId: number, feedbackText: string): Promise<{ message: string; feedback_id: number }> {
    return request(`/api/academician/students/${studentId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback_text: feedbackText }),
    });
  },

  async getMyFeedbacks(): Promise<{ feedbacks: any[] }> {
    return request('/api/academician/feedbacks');
  },
};
