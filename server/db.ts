import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Role, Interview, Question, Answer, ResumeAnalysis, LeaderboardEntry, Achievement, SystemNotification, Settings } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Simple SHA-256 helper with a salt for secure local hashing
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'ai_mock_interview_secure_salt').digest('hex');
}

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  interviews: Interview[];
  questions: Question[];
  answers: Answer[];
  resumeAnalyses: ResumeAnalysis[];
  achievements: Achievement[];
  notifications: SystemNotification[];
  settings: Settings[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: 'admin-id',
      email: 'admin@mockai.com',
      name: 'Sarah Jenkins (Admin)',
      role: Role.ADMIN,
      college: 'Stanford University',
      department: 'Computer Science',
      skills: ['React', 'System Design', 'Node.js', 'Kubernetes'],
      targetCompanies: ['Google', 'Netflix'],
      experienceLevel: 'senior',
      xp: 2500,
      streak: 12,
      badges: ['AI Master', 'Consistent Learner', 'Top Performer'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('admin123')
    },
    {
      id: 'admin-edu-id',
      email: 'admin@mockai.edu',
      name: 'Sarah Jenkins (Admin)',
      role: Role.ADMIN,
      college: 'Stanford University',
      department: 'Computer Science',
      skills: ['React', 'System Design', 'Node.js', 'Kubernetes'],
      targetCompanies: ['Google', 'Netflix'],
      experienceLevel: 'senior',
      xp: 2500,
      streak: 12,
      badges: ['AI Master', 'Consistent Learner', 'Top Performer'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('admin_secure_pass_2026')
    },
    {
      id: 'user-id',
      email: 'user@mockai.com',
      name: 'Alex Rivera',
      role: Role.USER,
      college: 'UC Berkeley',
      department: 'Electrical Engineering & CS',
      skills: ['Python', 'Data Structures', 'TypeScript', 'SQL'],
      targetCompanies: ['Google', 'Microsoft', 'Meta'],
      experienceLevel: 'entry',
      xp: 1200,
      streak: 5,
      badges: ['Interview Beginner', 'Consistent Learner', 'Coding Expert'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('user123')
    },
    {
      id: 'user-edu-id',
      email: 'alex.rivera@mockai.edu',
      name: 'Alex Rivera',
      role: Role.USER,
      college: 'UC Berkeley',
      department: 'Electrical Engineering & CS',
      skills: ['Python', 'Data Structures', 'TypeScript', 'SQL'],
      targetCompanies: ['Google', 'Microsoft', 'Meta'],
      experienceLevel: 'entry',
      xp: 1200,
      streak: 5,
      badges: ['Interview Beginner', 'Consistent Learner', 'Coding Expert'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('alex_practice_pass_123')
    },
    // Seed some leaderboard players
    {
      id: 'mock-user-1',
      email: 'priya@mockai.com',
      name: 'Priya Sharma',
      role: Role.USER,
      college: 'IIT Bombay',
      department: 'Computer Science',
      skills: ['C++', 'Algorithms', 'Java', 'Machine Learning'],
      targetCompanies: ['Google', 'Adobe', 'Tower Research'],
      experienceLevel: 'entry',
      xp: 2800,
      streak: 15,
      badges: ['Coding Expert', 'AI Master', 'Top Performer'],
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('user123')
    },
    {
      id: 'mock-user-2',
      email: 'david@mockai.com',
      name: 'David Chen',
      role: Role.USER,
      college: 'MIT',
      department: 'Mathematics & CS',
      skills: ['Python', 'Rust', 'Go', 'Distributed Systems'],
      targetCompanies: ['Netflix', 'Microsoft', 'Amazon'],
      experienceLevel: 'mid',
      xp: 1950,
      streak: 8,
      badges: ['Consistent Learner', 'Coding Expert', 'Resume Expert'],
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('user123')
    },
    {
      id: 'mock-user-3',
      email: 'emily@mockai.com',
      name: 'Emily Watson',
      role: Role.USER,
      college: 'University of Oxford',
      department: 'Software Engineering',
      skills: ['Java', 'Spring Boot', 'System Design', 'PostgreSQL'],
      targetCompanies: ['Apple', 'Oracle', 'Goldman Sachs'],
      experienceLevel: 'mid',
      xp: 1620,
      streak: 6,
      badges: ['Communication Star', 'Resume Expert'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: hashPassword('user123')
    }
  ],
  interviews: [
    {
      id: 'past-interview-1',
      userId: 'user-id',
      company: 'Google',
      jobRole: 'Software Engineer',
      department: 'Cloud Division',
      experience: '0-2 years',
      difficulty: 'medium' as any,
      interviewType: 'technical' as any,
      questionCount: 3,
      skills: ['Algorithms', 'Data Structures', 'TypeScript'],
      duration: 30,
      score: 82,
      status: 'completed',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      feedbackReport: {
        overallScore: 82,
        technicalScore: 85,
        communicationScore: 78,
        grammarScore: 80,
        confidenceScore: 84,
        problemSolvingScore: 86,
        leadershipScore: 70,
        behaviorScore: 80,
        strengths: [
          'Excellent understanding of trees and graph algorithms.',
          'Solid breakdown of computational complexity during implementation.'
        ],
        weaknesses: [
          'Tended to explain the code after writing it, rather than thinking out loud during generation.',
          'Slight stuttering when discussing trade-offs of the chosen data structure.'
        ],
        improvementSuggestions: [
          'Practice "thinking aloud" using timer-based dry runs.',
          'Use clear structuring (e.g., STAR framework) when answering behavioral or general tech questions.'
        ],
        recommendedCourses: [
          'Google Professional Cloud DevOps Engineer Path',
          'Advanced Algorithms and Data Structures on Coursera'
        ],
        recommendedYouTubeVideos: [
          'https://www.youtube.com/watch?v=XKu_SEDAykw (Google Coding Interview)',
          'https://www.youtube.com/watch?v=oo7HGOn8D4E (Cracking the System Design Interview)'
        ],
        recommendedPracticeProblems: [
          'LeetCode #208: Implement Trie (Prefix Tree)',
          'LeetCode #124: Binary Tree Maximum Path Sum'
        ],
        nextInterviewSuggestions: 'Try taking a Google System Design or Architecture mock next to boost high-level thinking.',
        aiSummary: 'Alex exhibited solid technical problem-solving. His algorithm was complete and correct with minimal syntax hiccups, but active vocal explanation could elevate his overall communication score from satisfactory to outstanding.',
        hiringProbabilityScore: 78,
        behavioralAnalysis: 'Demonstrated high coachability and openness to technical hints. Showed calm and analytical composure when encountering edge cases.',
        roadmap: [
          'Phase 1: Deepen knowledge on prefix trees, heaps, and graph traversals (Weeks 1-2).',
          'Phase 2: Engage in 3 behavioral interview mock mocks focused on team collaboration (Week 3).',
          'Phase 3: Tackle system scalability models including load balancers and sharding (Week 4).'
        ]
      }
    },
    {
      id: 'past-interview-2',
      userId: 'user-id',
      company: 'Microsoft',
      jobRole: 'Frontend Developer',
      department: 'Teams Core',
      experience: '0-2 years',
      difficulty: 'easy' as any,
      interviewType: 'technical' as any,
      questionCount: 3,
      skills: ['React', 'CSS', 'JavaScript'],
      duration: 25,
      score: 89,
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      feedbackReport: {
        overallScore: 89,
        technicalScore: 92,
        communicationScore: 85,
        grammarScore: 88,
        confidenceScore: 90,
        problemSolvingScore: 88,
        leadershipScore: 75,
        behaviorScore: 86,
        strengths: [
          'Stellar command of React Hook rendering cycles and state scheduling.',
          'Highly confident articulation of CSS layout models (Flexbox & Grid).'
        ],
        weaknesses: [
          'Could expand on Web Performance optimizations like lazy-loading components.',
          'Minor syntax oversight in standard debounce handler implementation.'
        ],
        improvementSuggestions: [
          'Study debouncing and throttling micro-patterns to handle frequent user inputs.',
          'Incorporate code bundling concepts and Vite configuration in explanations.'
        ],
        recommendedCourses: [
          'Epic React by Kent C. Dodds',
          'High Performance Web Applications'
        ],
        recommendedYouTubeVideos: [
          'https://www.youtube.com/watch?v=Ke90Tje7VS0 (React Performance Optimization Hacks)'
        ],
        recommendedPracticeProblems: [
          'Implement custom debounce hook on Codesandbox',
          'Optimize a virtualized list for 10,000 active rows'
        ],
        nextInterviewSuggestions: 'Progress to a Medium-level Microsoft Mixed technical + behavioral interview to test scaling scenario resilience.',
        aiSummary: 'Alex excelled on the UI questions. His grasp of state management, custom hooks, and virtualized renders is highly advanced. He communicated clearly with crisp explanations and structured logic.',
        hiringProbabilityScore: 91,
        behavioralAnalysis: 'Strong product-mindset. He naturally connects engineering decisions to final end-user experience, showing high levels of empathetic communication.',
        roadmap: [
          'Phase 1: Implement deep-dive performance benchmarking on existing web apps.',
          'Phase 2: Master standard web-security protocols (CORS, XSS, CSRF, JWT tokens).'
        ]
      }
    }
  ],
  questions: [
    {
      id: 'q-past-1-1',
      interviewId: 'past-interview-1',
      text: 'Explain the difference between a process and a thread in modern operating systems.',
      type: 'technical',
      order: 1
    },
    {
      id: 'q-past-1-2',
      interviewId: 'past-interview-1',
      text: 'How do you design a robust cache eviction policy (like LRU) using primitive data structures?',
      type: 'technical',
      order: 2
    },
    {
      id: 'q-past-1-3',
      interviewId: 'past-interview-1',
      text: 'Write a TypeScript function to check if a binary tree is symmetric.',
      type: 'technical',
      order: 3
    }
  ],
  answers: [
    {
      id: 'ans-past-1-1',
      interviewId: 'past-interview-1',
      questionId: 'q-past-1-1',
      userId: 'user-id',
      text: 'A process represents an independent executing program with its own dedicated memory space allocated by the OS. A thread is the smallest unit of execution inside a process, sharing the same address space, heap, and file descriptors. Threads are much faster to create and context-switch, but they risk concurrency issues since they share state.',
      score: 85,
      feedback: 'Excellent response detailing memory-isolation differences. High fluency and clear technical definitions.',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  resumeAnalyses: [
    {
      id: 'res-analysis-1',
      userId: 'user-id',
      fileName: 'Alex_Rivera_Resume_2026.pdf',
      extractedText: 'Alex Rivera\nSoftware Engineer Intern candidate\nSKILLS: Python, JavaScript, React, SQL, HTML/CSS\nPROJECTS: E-commerce web store, Task Scheduler in Go.\nEDUCATION: UC Berkeley, CS student...',
      atsScore: 78,
      grammarScore: 92,
      formattingScore: 85,
      skillsFound: ['Python', 'JavaScript', 'React', 'SQL', 'HTML', 'CSS', 'Go'],
      missingSkills: ['System Design', 'Docker', 'AWS', 'TypeScript', 'CI/CD Pipelines'],
      projectsAnalysis: 'Strong projects (e-commerce shop, Go scheduler). Go scheduler is impressive for an entry-level candidate but needs detailed metrics such as performance throughput or concurrency handles.',
      experienceAnalysis: 'Candidate has decent academic projects but lacks solid industrial internship experience. Recommending seeking open-source contributions or research work.',
      keywordAnalysis: ['Scalability', 'Microservices', 'Concurrency', 'RESTful APIs', 'Database Indexing'],
      weakSections: ['Work Experience (very academic)', 'Cloud & Infrastructure Section (absent)'],
      strongSections: ['Programming Fundamentals', 'Frontend Frameworks', 'Structured Project Descriptions'],
      improvementSuggestions: [
        'Incorporate specific quantitative metrics in project descriptions (e.g., "reduced latency by 35%", "handled 10k requests/min").',
        'Add a dedicated Certifications or Cloud technologies section.',
        'Convert existing JS projects into TypeScript to prove type-safety experience.'
      ],
      recommendedKeywords: ['TypeScript', 'Cloud Computing', 'Docker', 'Kubernetes', 'Jest', 'Git Flow'],
      recommendedCertifications: [
        'AWS Certified Cloud Practitioner',
        'HashiCorp Certified: Terraform Associate'
      ],
      recommendedProjects: [
        'A full-stack Chat Application utilizing real-time WebSockets and Docker container packaging.',
        'An API Gateway proxy with custom rate-limiting middleware written in TypeScript.'
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      userId: 'user-id',
      badge: 'Interview Beginner',
      title: 'First Step',
      description: 'Completed your first AI Mock Interview successfully!',
      unlockedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ach-2',
      userId: 'user-id',
      badge: 'Consistent Learner',
      title: 'Active Streak',
      description: 'Maintained a active mock practice streak of over 5 consecutive days.',
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'not-1',
      userId: 'user-id',
      title: 'Achievement Unlocked!',
      message: 'Congratulations! You unlocked the "Consistent Learner" badge for keeping your 5-day streak alive.',
      type: 'achievement',
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'not-2',
      userId: 'user-id',
      title: 'Interview Recommendation',
      message: 'Based on your recent Microsoft frontend score, we recommend taking a mixed HR/Technical mock next.',
      type: 'reminder',
      read: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  settings: [
    {
      userId: 'user-id',
      theme: 'dark',
      emailNotifications: true,
      pushNotifications: true,
      language: 'English',
      voiceName: 'Zephyr',
      aiSpeed: 1.0,
      privacyProfile: 'public'
    },
    {
      userId: 'admin-id',
      theme: 'dark',
      emailNotifications: true,
      pushNotifications: true,
      language: 'English',
      voiceName: 'Kore',
      aiSpeed: 1.0,
      privacyProfile: 'public'
    }
  ]
};

// Ensure database file and parent directory exist
export function initDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
  } else {
    try {
      const currentData = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(currentData) as DatabaseSchema;
      let modified = false;
      for (const defaultUser of DEFAULT_DB.users) {
        if (!db.users.some(u => u.email.toLowerCase() === defaultUser.email.toLowerCase())) {
          db.users.push(defaultUser);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      }
    } catch (e) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    }
  }
}

// Read database
export function readDB(): DatabaseSchema {
  try {
    initDB();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read local DB file, reverting to defaults:', error);
    return DEFAULT_DB;
  }
}

// Write database
export function writeDB(data: DatabaseSchema): void {
  try {
    initDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write local DB file:', error);
  }
}
