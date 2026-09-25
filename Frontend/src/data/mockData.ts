import {
  University,
  Company,
  AITool,
  FieldUpdate,
  Student,
  Opportunity,
  RoadmapItem,
  ResearchPaper,
  Academician,
  NotificationItem,
} from '../types';

export const UNIVERSITIES: University[] = [
  { id: 'u1', name: 'Ashgrove Institute of Technology & Sciences', students: 2140, avgSkill: 68, improvement: 12, city: 'Pune' },
  { id: 'u2', name: 'Meridian State University of Liberal Arts & Sciences', students: 3380, avgSkill: 61, improvement: 8, city: 'Coimbatore' },
  { id: 'u3', name: 'North Ridge Interdisciplinary Institute', students: 1520, avgSkill: 74, improvement: 15, city: 'Indore' },
  { id: 'u4', name: 'Fairview National University', students: 2670, avgSkill: 58, improvement: 6, city: 'Nagpur' },
];

export const COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Solivant Labs',
    field: 'Product & Software Engineering',
    roles: [
      { id: 'r1', title: 'Frontend Engineering Fellow', skills: [{ name: 'React', min: 70 }, { name: 'JavaScript', min: 75 }] },
      { id: 'r2', title: 'Data Analyst — Associate', skills: [{ name: 'SQL', min: 65 }, { name: 'Python', min: 60 }] },
    ],
  },
  {
    id: 'c2',
    name: 'Brightwell Bio-Analytics',
    field: 'Biotechnology & Data Science',
    roles: [
      { id: 'r3', title: 'Bioinformatics Research Intern', skills: [{ name: 'Python', min: 75 }, { name: 'Genomics', min: 65 }] },
    ],
  },
  {
    id: 'c3',
    name: 'Harbor & Finch Studio',
    field: 'UI/UX & Product Design',
    roles: [
      { id: 'r4', title: 'Product Design Intern', skills: [{ name: 'Figma', min: 70 }, { name: 'Design Systems', min: 65 }] },
    ],
  },
  {
    id: 'c4',
    name: 'Apex Capital Advisory',
    field: 'Corporate Finance & Valuation',
    roles: [
      { id: 'r5', title: 'Financial Analyst Intern', skills: [{ name: 'Financial Modeling', min: 70 }, { name: 'DCF Valuation', min: 65 }] },
    ],
  },
  {
    id: 'c5',
    name: 'Verdant Earth Institute',
    field: 'Environmental Science & ESG',
    roles: [
      { id: 'r6', title: 'Sustainability Analyst Intern', skills: [{ name: 'Carbon Accounting', min: 65 }, { name: 'Life Cycle Assessment', min: 60 }] },
    ],
  },
];

export const AI_TOOLS: AITool[] = [
  { id: 'a1', name: 'Codeium & Cursor', category: 'Coding & Engineering', desc: 'AI pair-programmers that suggest context-aware code and accelerate syntax learning.', use: 'Speed up programming assignments and debug errors in real time.' },
  { id: 'a2', name: 'Notion AI', category: 'Writing & Research', desc: 'Drafts, summarizes, and structures multi-disciplinary notes and research literature.', use: 'Turn dense lecture notes and papers into structured study materials.' },
  { id: 'a3', name: 'Perplexity AI', category: 'Academic Research', desc: 'An academic answer engine that cites verified peer-reviewed sources for claims.', use: 'Synthesize literature reviews and verify citations across journals.' },
  { id: 'a4', name: 'Figma AI', category: 'Design & Prototyping', desc: 'Generates UI layouts, accessibility color checks, and wireframe variants.', use: 'Prototype human-centered interfaces without starting from a blank canvas.' },
  { id: 'a5', name: 'Otter.ai', category: 'Productivity & Lectures', desc: 'Transcribes and summarizes multi-speaker academic lectures in real time.', use: 'Revisit complex seminars and extract core concepts automatically.' },
  { id: 'a6', name: 'Hugging Face Spaces', category: 'Machine Learning', desc: 'Hosts open-source AI models and interactive demos directly in the browser.', use: 'Test pre-trained models for vision, NLP, and biology coursework.' },
];

export const FIELD_UPDATES: FieldUpdate[] = [
  { id: 'f1', field: 'Artificial Intelligence', title: 'Multimodal Foundation Models Transforming Academic Research', summary: 'AI models that read research diagrams, chemical structures, and code simultaneously are drastically speeding up scientific discovery across universities.' },
  { id: 'f2', field: 'Biotechnology & Health', title: 'Generative AI Accelerates Protein Folding and Drug Discovery', summary: 'Deep learning models like AlphaFold are enabling students and researchers to simulate molecular docking and binding affinities in minutes instead of months.' },
  { id: 'f3', field: 'Product & Design', title: 'AI-Assisted Design Systems Integrate Real-Time Accessibility Checks', summary: 'Design software now automatically audits contrast ratios, touch targets, and assistive technology readability as designers lay out UI components.' },
  { id: 'f4', field: 'Finance & Economics', title: 'Automated Quantitative Modeling & ESG Telemetry Go Mainstream', summary: 'Investment analysts are utilizing natural language processing to extract environmental, social, and governance signals directly from regulatory 10-K filings.' },
  { id: 'f5', field: 'Environmental Science', title: 'Remote Sensing & AI Forecast Climate Resilience and Deforestation', summary: 'Satellite imagery pipelines powered by computer vision are tracking carbon sequestration and groundwater depletion in high spatial resolution.' },
  { id: 'f6', field: 'Law & Governance', title: 'Regulatory Frameworks for Frontier AI and Data Privacy Take Shape', summary: 'Global governance bodies are establishing legal standards for algorithmic transparency, synthetic media provenance, and intellectual property rights.' },
  { id: 'f7', field: 'Software Architecture', title: 'Serverless Edge Functions and Micro-Frontends Shift Modern Web', summary: 'Engineering teams are adopting edge computing to deliver sub-millisecond personalized UI rendering with minimal cold-start latencies.' },
];

export function mkStudent(p: Partial<Student> & { id: string; name: string; university: string; field: string; role: string }): Student {
  return {
    verified: true,
    resumeHistory: [4.5, 5, 6, 6.5, 7.5, 8],
    discipline: 75,
    punctuality: 78,
    consistency: 72,
    potential: 79,
    weeklyImprovement: 9,
    resumeScore: 0,
    dailyLog: [
      { date: 'Sep 24', topic: 'Core Concept Review & Methodology', hours: 2 },
      { date: 'Sep 22', topic: 'Hands-on Project & Analysis', hours: 2.5 },
      { date: 'Sep 20', topic: 'Literature & Problem Formulation', hours: 1.5 },
      { date: 'Sep 18', topic: 'Peer Review & Discussion', hours: 1 },
    ],
    projects: [
      {
        id: 'p1',
        name: 'Interdisciplinary Capstone Study',
        tech: ['Methodological Framework', 'Data Analysis', 'Documentation'],
        review: 'Strong analytical foundation and clear problem framing. Focus on integrating practical case studies and publishing project artifacts.',
      },
    ],
    skills: [],
    ...p,
  };
}

export const STUDENTS: Student[] = [
  mkStudent({
    id: 's1',
    name: 'Aditi Rao',
    university: 'North Ridge Interdisciplinary Institute',
    field: 'UI/UX & Product Design',
    role: 'Product Designer',
    potential: 85,
    discipline: 82,
    consistency: 80,
    weeklyImprovement: 12,
    skills: [
      { name: 'Figma', score: 84, min: 75 },
      { name: 'Design Systems', score: 78, min: 70 },
      { name: 'User Research', score: 72, min: 65 },
      { name: 'Wireframing', score: 80, min: 70 },
    ],
    projects: [
      {
        id: 'p1',
        name: 'Adaptive Accessible Learning Dashboard',
        tech: ['Figma', 'WCAG 2.1', 'Design Tokens'],
        review: 'Exemplary focus on accessible typography and color contrast. Component states are systematically documented.',
      },
    ],
  }),
  mkStudent({
    id: 's2',
    name: 'Ananya Deshmukh',
    university: 'Ashgrove Institute of Technology & Sciences',
    field: 'Biotechnology & Genomics',
    role: 'Biotechnology Specialist',
    potential: 88,
    discipline: 85,
    consistency: 82,
    weeklyImprovement: 14,
    skills: [
      { name: 'Molecular Biology', score: 82, min: 75 },
      { name: 'Bioinformatics (Python)', score: 74, min: 65 },
      { name: 'PCR & Gel Electrophoresis', score: 86, min: 70 },
      { name: 'CRISPR Gene Editing Protocols', score: 68, min: 60 },
    ],
    projects: [
      {
        id: 'p2',
        name: 'In Silico Protein Stability Modeling',
        tech: ['Biopython', 'PyMOL', 'BLAST'],
        review: 'Solid computational alignment and structural visualization. Consider testing mutations with thermodynamic stability tools.',
      },
    ],
  }),
  mkStudent({
    id: 's3',
    name: 'Vikram Singhania',
    university: 'Meridian State University of Liberal Arts & Sciences',
    field: 'Corporate Finance & Valuation',
    role: 'Financial Analyst',
    potential: 81,
    discipline: 79,
    consistency: 76,
    weeklyImprovement: 10,
    skills: [
      { name: 'Financial Modeling', score: 80, min: 70 },
      { name: 'DCF Valuation', score: 76, min: 65 },
      { name: 'Financial Statement Analysis', score: 82, min: 75 },
      { name: 'Excel / VBA', score: 78, min: 70 },
    ],
    projects: [
      {
        id: 'p3',
        name: 'Renewable Energy Firm 3-Statement LBO Model',
        tech: ['Excel', 'Capital IQ', 'Sensitivity Tables'],
        review: 'Comprehensive debt schedule with clean working capital waterfall. Assumptions are grounded in verifiable market comparables.',
      },
    ],
  }),
  mkStudent({
    id: 's4',
    name: 'Tanya Nambiar',
    university: 'Fairview National University',
    field: 'Clinical Psychology & Behavioral Health',
    role: 'Behavioral Researcher',
    potential: 84,
    discipline: 81,
    consistency: 78,
    weeklyImprovement: 11,
    skills: [
      { name: 'Cognitive Behavioral Protocols', score: 80, min: 70 },
      { name: 'Psychological Assessment & DSM-5', score: 77, min: 65 },
      { name: 'Statistical Data Analysis (SPSS)', score: 73, min: 60 },
      { name: 'Research Ethics & Consent', score: 85, min: 75 },
    ],
    projects: [
      {
        id: 'p4',
        name: 'Digital Mindfulness Interventions in Higher Ed',
        tech: ['SPSS', 'Survey Design', 'Psychometrics'],
        review: 'Well-controlled pre/post intervention study. Reliability coefficients (Cronbach alpha > 0.85) demonstrate rigorous measurement.',
      },
    ],
  }),
  mkStudent({
    id: 's5',
    name: 'Arjun Sundaram',
    university: 'North Ridge Interdisciplinary Institute',
    field: 'Law & Corporate Governance',
    role: 'Legal Scholar',
    potential: 86,
    discipline: 84,
    consistency: 81,
    weeklyImprovement: 13,
    skills: [
      { name: 'Contract Drafting & Negotiation', score: 81, min: 75 },
      { name: 'Intellectual Property Law', score: 78, min: 70 },
      { name: 'Constitutional Jurisprudence', score: 84, min: 75 },
      { name: 'Legal Research (SCC / Manupatra)', score: 86, min: 75 },
    ],
    projects: [
      {
        id: 'p5',
        name: 'Cross-Border SaaS Data Compliance Policy',
        tech: ['GDPR', 'Indian DPDP Act', 'Standard Contractual Clauses'],
        review: 'Thorough risk mitigation clauses for international cloud storage. Demonstrates deep understanding of global data sovereignty.',
      },
    ],
  }),
  mkStudent({
    id: 's6',
    name: 'Maya Bhatt',
    university: 'Ashgrove Institute of Technology & Sciences',
    field: 'Environmental Science & ESG',
    role: 'ESG & Sustainability Analyst',
    potential: 83,
    discipline: 80,
    consistency: 77,
    weeklyImprovement: 10,
    skills: [
      { name: 'Life Cycle Assessment (LCA)', score: 79, min: 70 },
      { name: 'Carbon Accounting (GHG Protocol)', score: 82, min: 75 },
      { name: 'Environmental Impact Assessment', score: 76, min: 65 },
      { name: 'GIS Spatial Mapping', score: 71, min: 60 },
    ],
    projects: [
      {
        id: 'p6',
        name: 'Campus Scope 1, 2 & 3 Carbon Footprint Audit',
        tech: ['GHG Protocol', 'QGIS', 'OpenLCA'],
        review: 'Clear emission boundary definitions. Actionable decarbonization roadmaps proposed for university heating and commuter transit.',
      },
    ],
  }),
  mkStudent({
    id: 's7',
    name: 'Kabir Mehta',
    university: 'Ashgrove Institute of Technology & Sciences',
    field: 'Full Stack Software Engineering',
    role: 'Software Engineer',
    potential: 82,
    discipline: 78,
    consistency: 79,
    weeklyImprovement: 11,
    skills: [
      { name: 'TypeScript', score: 78, min: 70 },
      { name: 'React', score: 82, min: 75 },
      { name: 'Node.js', score: 74, min: 65 },
      { name: 'PostgreSQL', score: 70, min: 60 },
    ],
    projects: [
      {
        id: 'p7',
        name: 'Real-Time Collaborative Research Workspace',
        tech: ['TypeScript', 'WebSocket', 'PostgreSQL', 'Docker'],
        review: 'Excellent operational transformation implementation for concurrent document editing. Clean automated test suite.',
      },
    ],
  }),
  mkStudent({
    id: 's8',
    name: 'Meera Iyer',
    university: 'North Ridge Interdisciplinary Institute',
    field: 'Data Science & Artificial Intelligence',
    role: 'AI Researcher',
    potential: 89,
    discipline: 86,
    consistency: 85,
    weeklyImprovement: 15,
    skills: [
      { name: 'Python', score: 88, min: 75 },
      { name: 'PyTorch / Deep Learning', score: 80, min: 70 },
      { name: 'Mathematical Statistics', score: 84, min: 75 },
      { name: 'Vector Embeddings & RAG', score: 76, min: 65 },
    ],
    projects: [
      {
        id: 'p8',
        name: 'Sparse Attention Transformer for Long-Context Documents',
        tech: ['PyTorch', 'Hugging Face', 'CUDA'],
        review: 'Demonstrated 42% reduction in memory complexity with minimal loss in BLEU score across standard benchmarks.',
      },
    ],
  }),
];

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: 'Product Design & Design Systems Fellow', company: 'Harbor & Finch Studio', field: 'UI/UX & Product Design', skills: ['Figma', 'Design Systems', 'User Research'], match: 91 },
  { id: 'o2', title: 'Bioinformatics Research Project', company: 'Brightwell Bio-Analytics', field: 'Biotechnology & Genomics', skills: ['Python', 'Genomics', 'Bioinformatics'], match: 86 },
  { id: 'o3', title: 'Financial Modeling & Valuation Intern', company: 'Apex Capital Advisory', field: 'Corporate Finance', skills: ['Financial Modeling', 'DCF Valuation', 'Excel'], match: 88 },
  { id: 'o4', title: 'ESG Carbon Accounting Research Associate', company: 'Verdant Earth Institute', field: 'Environmental Science', skills: ['Carbon Accounting', 'LCA', 'Sustainability'], match: 84 },
  { id: 'o5', title: 'Technology Law & IP Policy Researcher', company: 'North Ridge Interdisciplinary Institute', field: 'Law & Governance', skills: ['IP Law', 'Contract Drafting', 'Legal Research'], match: 85 },
  { id: 'o6', title: 'Full Stack Web Platform Fellow', company: 'Solivant Labs', field: 'Software Engineering', skills: ['React', 'TypeScript', 'Node.js'], match: 89 },
];

export const ROADMAP: RoadmapItem[] = [
  { skill: 'Figma & Design Systems', from: 45, to: 75, weeks: 4, free: 'Figma Official Community Tutorials & UI Guidelines', paid: 'Interaction Design Foundation — Design System Masterclass' },
  { skill: 'Bioinformatics & Python', from: 30, to: 65, weeks: 6, free: 'Rosalind.info Bioinformatics Programming Challenges', paid: 'Coursera — Genomic Data Science Specialization (Johns Hopkins)' },
  { skill: 'Financial Valuation Modeling', from: 25, to: 60, weeks: 5, free: 'Aswath Damodaran Corporate Finance & Valuation Lectures (NYU Stern)', paid: 'Wall Street Prep — Premium Financial Modeling' },
];

export const PAPERS: ResearchPaper[] = [
  {
    id: 'pp1',
    title: 'Sparse Attention Mechanisms for Multi-Disciplinary Text Extraction',
    field: 'Data Science & AI',
    desc: 'Explores sparse linear attention architectures to reduce quadratic memory bottlenecks in long academic papers.',
    discussions: [{ student: 'Meera Iyer', q: 'Did you benchmark sliding-window attention against local-global block attention?' }],
  },
  {
    id: 'pp2',
    title: 'Inclusive Design Tokens and Screen Reader Semantic Parsing',
    field: 'UI/UX Design',
    desc: 'Empirical analysis of automated accessibility testing in cross-platform component design systems.',
    discussions: [{ student: 'Aditi Rao', q: 'How do these design tokens translate to native mobile screen readers like VoiceOver?' }],
  },
  {
    id: 'pp3',
    title: 'Quantifying Carbon Sequestration via High-Resolution Satellite Remote Sensing',
    field: 'Environmental Science',
    desc: 'Methodology for continuous biomass accounting and forest degradation monitoring using synthetic aperture radar.',
    discussions: [{ student: 'Maya Bhatt', q: 'What is the error margin when calibrating against ground-truth core samples in tropical canopies?' }],
  },
];

export const ACADEMICIANS: Academician[] = [
  { id: 'ac1', name: 'Dr. Naveen Bhatt', field: 'Data Science & AI', papers: [PAPERS[0]] },
  { id: 'ac2', name: 'Dr. Leela Krishnan', field: 'UI/UX Design & HCI', papers: [PAPERS[1]] },
  { id: 'ac3', name: 'Dr. Maya Sengupta', field: 'Environmental Science & Sustainability', papers: [PAPERS[2]] },
  { id: 'ac4', name: 'Dr. Farhan Ali', field: 'Biotechnology & Computational Biology', papers: [] },
  { id: 'ac5', name: 'Prof. Rohini Iyer', field: 'Corporate Law & Governance', papers: [] },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', text: 'North Ridge faculty recommended an interdisciplinary study roadmap for you.' },
  { id: 'n2', text: 'Your demonstrated competency score in your primary discipline increased.' },
  { id: 'n3', text: 'New collaborative research posting available in your academic interest area.' },
];
