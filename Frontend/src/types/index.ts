export type UserRole = 'student' | 'academician' | 'institute';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  college?: string;
  university_roll_no?: string;
  class_year?: string;
  academic_class?: string;
  curriculum?: string;
  board_curriculum?: string;
  academic_subjects?: string;
  interested_subjects?: string;
  academic_interests?: string;
  extra_subjects?: string;
  additional_skills?: string;
  preferred_language?: string;
  knowledge_level?: string;
  potential_score?: number;
  syllabus_progress_rate?: number;
  expertise_domain?: string;
  city?: string;
  admin_tpo_contact?: string;
  department?: string;
}

export interface StudentLearningProfile {
  id: number;
  name: string;
  email: string;
  college?: string;
  university_roll_no?: string;
  class_year?: string;
  academic_class?: string;
  curriculum?: string;
  board_curriculum?: string;
  academic_subjects?: string;
  interested_subjects?: string;
  academic_interests?: string;
  extra_subjects?: string;
  additional_skills?: string;
  preferred_language?: string;
  knowledge_level?: string;
  potential_score?: number;
  syllabus_progress_rate?: number;
  verification_status?: string;
  is_verified?: boolean;
  academic_subjects_list?: string[];
  interested_subjects_list?: string[];
  additional_skills_list?: string[];
  documents?: { id: number; document_type: string; file_url: string; uploaded_at: string }[];
}

export interface DiagnosticQuestion {
  id: number;
  question_text: string;
  options: { [key: string]: string };
  level: string;
  topic: string;
}

export interface PathwayTopic {
  id: string;
  title: string;
  status: 'mastered' | 'in_progress' | 'needs_revision' | 'next' | 'pending';
  difficulty: string;
  est_hours: number;
  type?: string;
  key_concept?: string;
  real_world_app?: string;
  summary?: string;
}

export interface LearningPathway {
  id: number;
  subject_name: string;
  pathway_type: 'academic' | 'additional';
  current_level: string;
  estimated_hours: number;
  difficulty: string;
  topics: PathwayTopic[];
  recommended_sequence: string;
  last_updated: string;
}

export interface SyllabusProgressItem {
  id: number;
  subject_name: string;
  total_topics: number;
  completed_topics: number;
  revision_topics: number;
  completed_percentage: number;
  exam_readiness_score: number; // Fit score (0-100%)
  practice_avg_score: number;
  exam_avg_score: number;
  topics_understood_pct: number;
  revision_status_pct: number;
  is_weak_subject: number | boolean;
  last_updated: string;
}

export interface DailySyllabusUpdate {
  id: number;
  subject_name: string;
  completed_topics: string;
  revision_topics: string;
  practice_count: number;
  study_minutes: number;
  notes: string;
  log_date: string;
}

export interface InstituteScheduleItem {
  id: number;
  schedule_type: 'class' | 'examination' | 'test' | 'practical' | 'assignment' | 'event' | string;
  title: string;
  subject_name: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_or_link: string;
  notes?: string;
  target_class?: string;
}

export interface PersonalScheduleItem {
  id: number;
  title: string;
  activity_type: 'institute_class' | 'institute_exam' | 'extra_learning' | 'personal' | 'free_time' | 'revision' | 'practice' | string;
  subject_name?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_completed?: number | boolean;
  notes?: string;
}

export interface PracticeTestQuestion {
  id: number;
  question_text: string;
  options: { [key: string]: string };
  topic: string;
  level: string;
}

export interface PracticeTestRecord {
  id: number;
  subject_name: string;
  topic_name: string;
  score: number;
  total_questions?: number;
  accuracy: number;
  difficulty: string;
  is_weak_subject_test: number | boolean;
  mistakes_summary?: string;
  taken_at: string;
}

export interface StudentAcademicMark {
  id: number;
  student_id: number;
  student_name?: string;
  university_roll_no?: string;
  exam_id?: number;
  subject_name: string;
  exam_title: string;
  exam_type: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  remarks?: string;
  recorded_at: string;
}

export interface InstituteQueryItem {
  id: number;
  student_id: number;
  student_name?: string;
  university_roll_no?: string;
  subject_name: string;
  query_type: 'academic_doubt' | 'schedule' | 'examination' | 'guidance' | 'mentoring' | 'other' | string;
  title: string;
  question_text: string;
  response_text?: string;
  status: 'pending' | 'answered' | 'resolved' | string;
  created_at: string;
  answered_at?: string;
}

export interface InstituteGuidanceItem {
  id: number;
  guidance_type: 'study_priority' | 'weak_subject_practice' | 'resource_suggestion' | 'academic_feedback' | string;
  subject_name: string;
  message: string;
  created_at: string;
}

export interface PaperDiscussion {
  id?: number | string;
  student: string;
  q: string;
  response?: string;
  status?: string;
}

export interface ResearchPaper {
  id: string | number;
  title: string;
  author?: string;
  field: string;
  year?: number | string;
  desc?: string;
  abstract?: string;
  pdf_url?: string;
  discussions: PaperDiscussion[];
  academician_name?: string;
  expertise_domain?: string;
  created_at?: string;
}

export interface Academician {
  id: string | number;
  name: string;
  field: string;
  papers: ResearchPaper[];
}

export interface EducationalOpportunity {
  id: number | string;
  title: string;
  opportunity_type: 'competition' | 'workshop' | 'research' | 'course' | 'scholarship' | 'academic_program' | 'project' | 'internship' | string;
  subject_field?: string;
  required_level?: string;
  description: string;
  provider?: string;
  provider_or_institute?: string;
  deadline?: string;
  action_link?: string;
  eligibility?: string;
  match_percentage?: number;
  matched_subjects?: string;
}

export interface KnowledgeGapFeedbackItem {
  id: number;
  subject_name: string;
  topic_name: string;
  feedback_type: 'missing_topic' | 'concept_not_understood' | 'missing_prerequisite' | 'needs_practical_example' | 'real_world_gap' | 'curriculum_disconnection' | string;
  description: string;
  status: string;
  created_at: string;
  student_name?: string;
  class_year?: string;
}

export interface NotificationItem {
  id: string;
  text: string;
  tag?: string;
  time?: string;
  type?: 'success' | 'info' | 'warning' | 'alert';
}

export interface BackendPosting {
  id: number;
  title: string;
  description: string;
  required_skills: string;
  posting_type: string;
  professor?: string;
  company?: string;
  created_at: string;
  total_applicants?: number;
}

export interface BackendAssessmentQuestion {
  id: number;
  skill_name: string;
  question_text: string;
  options: { [key: string]: string };
}

// -------------------------------------------------------------------------
// Legacy Backwards-Compatibility Types (to prevent mockData / legacy compile errors)
// -------------------------------------------------------------------------

export interface SkillItem {
  name: string;
  score: number;
  min?: number;
  isVerified?: boolean;
}

export interface ProjectItem {
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  tech?: string[];
  skills?: string[];
  tags?: string[];
  link?: string;
  github?: string;
  review?: string;
  verified?: boolean;
}

export interface RoadmapItem {
  skill: string;
  from: number;
  to: number;
  weeks: number;
  free?: string;
  paid?: string;
}

export interface Opportunity {
  id: string | number;
  title: string;
  company?: string;
  field?: string;
  skills?: string[];
  match?: number;
  posting_type?: string;
  description?: string;
  deadline?: string;
  location?: string;
}

export interface Student {
  id: string | number;
  name: string;
  university: string;
  field?: string;
  role?: string;
  desiredRole?: string;
  qualification?: string;
  universityRollNo?: string;
  resumeUrl?: string;
  priorExperience?: string;
  githubUrl?: string;
  leetcodeUrl?: string;
  resumeScore?: number;
  potential?: number;
  discipline?: number;
  punctuality?: number;
  consistency?: number;
  weeklyImprovement?: number;
  verified?: boolean;
  resumeHistory?: number[];
  dailyLog?: any[];
  projects?: any[];
  skills: SkillItem[];
  resumeText?: string;
  resumeReview?: any;
}

export interface University {
  id: string | number;
  name: string;
  students: number;
  avgSkill: number;
  improvement: number;
  city?: string;
}

export interface Company {
  id: string | number;
  name: string;
  field: string;
  postings?: any[];
  openings?: number;
  roles?: any[];
  city?: string;
}

export interface AITool {
  id: string;
  title?: string;
  name?: string;
  desc?: string;
  description?: string;
  icon?: string;
  tag?: string;
  badge?: string;
  category?: string;
  use?: string;
}

export interface FieldUpdate {
  id: string;
  field?: string;
  discipline?: string;
  headline?: string;
  title?: string;
  summary?: string;
  actionItem?: string;
  skillsAdded?: string[];
}
