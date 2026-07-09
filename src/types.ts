/**
 * Shared Type Definitions for the AI Mock Interview Platform
 */

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

export enum InterviewType {
  TECHNICAL = 'technical',
  HR = 'hr',
  BEHAVIORAL = 'behavioral',
  MANAGERIAL = 'managerial',
  CODING = 'coding',
  MIXED = 'mixed'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  college?: string;
  department?: string;
  registerNumber?: string;
  year?: string;
  skills: string[];
  resumeUrl?: string;
  targetCompanies: string[];
  experienceLevel: string; // e.g., 'intern', 'entry', 'mid', 'senior'
  xp: number;
  streak: number;
  badges: string[];
  createdAt: string;
}

export interface Interview {
  id: string;
  userId: string;
  company: string;
  jobRole: string;
  department: string;
  experience: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
  questionCount: number;
  skills: string[];
  duration: number; // in minutes
  score?: number;
  status: 'pending' | 'completed';
  createdAt: string;
  // Final report details (if status is completed)
  feedbackReport?: FinalFeedbackReport;
  behavioralMetrics?: any;
}

export interface Question {
  id: string;
  interviewId: string;
  text: string;
  type: string; // 'technical' | 'hr' | 'behavioral' | 'coding' | etc.
  order: number;
  correctAnswer?: string; // or expected response outline
  expectedComplexity?: string; // for coding questions
  initialCode?: string; // for coding questions
}

export interface Answer {
  id: string;
  interviewId: string;
  questionId: string;
  userId: string;
  text: string;
  audioUrl?: string;
  score?: number; // 0 to 100
  feedback?: string;
  analysis?: LiveAnswerEvaluation;
  codeSolution?: string; // for coding
  createdAt: string;
}

export interface LiveAnswerEvaluation {
  correctness: number;
  communication: number;
  grammar: number;
  confidence: number;
  fluency: number;
  technicalDepth: number;
  problemSolving: number;
  softSkills: number;
  justification: string;
}

export interface FinalFeedbackReport {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  grammarScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  leadershipScore: number;
  behaviorScore: number;
  codingScore?: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  recommendedCourses: string[];
  recommendedYouTubeVideos: string[];
  recommendedPracticeProblems: string[];
  nextInterviewSuggestions: string;
  aiSummary: string;
  hiringProbabilityScore: number; // 0 to 100
  behavioralAnalysis: string;
  roadmap: string[]; // AI Career Roadmap
  videoBehaviorReport?: {
    eyeContactScore: number;
    attentionScore: number;
    faceVisibilityScore: number;
    confidenceLevel: number;
    professionalismScore: number;
    aiSuggestions: string[];
  };
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  extractedText: string;
  atsScore: number;
  grammarScore: number;
  formattingScore: number;
  skillsFound: string[];
  missingSkills: string[];
  projectsAnalysis: string;
  experienceAnalysis: string;
  keywordAnalysis: string[];
  weakSections: string[];
  strongSections: string[];
  improvementSuggestions: string[];
  recommendedKeywords: string[];
  recommendedCertifications: string[];
  recommendedProjects: string[];
  createdAt: string;

  // New detailed scores
  keywordMatchScore?: number;
  professionalismScore?: number;
  technicalSkillsScore?: number;
  projectsScore?: number;
  workExperienceScore?: number;
  educationScore?: number;
  achievementsScore?: number;
  communicationScore?: number;
  recruiterReadinessScore?: number;

  // Detailed metrics arrays
  strengths?: string[];
  detailedWeaknesses?: {
    problem: string;
    whyProblem: string;
    suggestion: string;
    exampleBefore: string;
    exampleAfter: string;
  }[];
  evaluatedSections?: {
    sectionName: string;
    score: number;
    feedback: string;
    suggestions: string;
  }[];
  recommendedSkills?: string[];
  missingKeywords?: string[];
  repeatedKeywords?: string[];
  lowImpactWords?: string[];
  actionVerbs?: string[];
  grammarErrors?: string[];
  spellingMistakes?: string[];
  sentenceImprovements?: string[];
  passiveVoiceCount?: number;
  longSentencesCount?: number;
  evaluatedProjects?: {
    name: string;
    innovation: string;
    complexity: string;
    impact: string;
    technologies: string[];
    recruiterImpression: string;
    suggestions: string;
  }[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  college?: string;
  department?: string;
  xp: number;
  streak: number;
  badgesCount: number;
  averageScore: number;
  rank?: number;

  // New Interview Performance Leaderboard Fields
  totalInterviews: number;
  highestScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  eyeContactScore: number;
  improvementPercentage: number;
  lastInterviewDate: string;
  
  resumeScore?: number;
  grammarScore?: number;
  overallScore?: number;
}

export interface Achievement {
  id: string;
  userId: string;
  badge: string; // 'beginner' | 'learner' | 'master' | 'expert' | etc.
  title: string;
  description: string;
  unlockedAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'leaderboard' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Settings {
  userId: string;
  theme: 'dark' | 'light';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  voiceName: string; // 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir'
  aiSpeed: number; // 0.5 to 2.0
  privacyProfile: 'public' | 'private';
  speechTone?: string;
  cameraPreference?: string;
  microphonePreference?: string;
}
