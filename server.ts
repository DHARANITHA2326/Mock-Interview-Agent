import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { readDB, writeDB, hashPassword, initDB } from './server/db';
import { signToken, verifyToken } from './server/auth';
import { 
  generateInterviewQuestions, 
  evaluateAnswer, 
  generateFinalReport, 
  analyzeResumeText 
} from './server/gemini';
import { extractTextFromBase64 } from './server/resumeParser';
import { Role, InterviewType, Difficulty, Interview, Answer, ResumeAnalysis, LeaderboardEntry } from './src/types';

const PORT = 3000;

// Extend Request interface to support JWT user payloads
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' })); // support large resume payloads

  // Auth Middleware
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token missing' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(403).json({ error: 'Token is invalid or expired' });
      return;
    }

    req.user = payload;
    next();
  };

  // Admin Middleware
  const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    authenticateToken(req, res, () => {
      if (req.user?.role !== Role.ADMIN) {
        res.status(403).json({ error: 'Access denied: Admin privileges required' });
        return;
      }
      next();
    });
  };

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  app.post('/api/auth/register', (req: Request, res: Response): void => {
    try {
      const { email, password, name, college, department, skills, experienceLevel } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
      }

      const db = readDB();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      const userId = `user-${Date.now()}`;
      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        name,
        role: Role.USER,
        college: college || '',
        department: department || '',
        skills: skills || [],
        targetCompanies: [],
        experienceLevel: experienceLevel || 'entry',
        xp: 100, // starting XP
        streak: 1,
        badges: ['Consistent Learner'],
        createdAt: new Date().toISOString()
      };

      db.users.push({
        ...newUser,
        passwordHash: hashPassword(password)
      });

      // Default settings
      db.settings.push({
        userId,
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        language: 'English',
        voiceName: 'Zephyr',
        aiSpeed: 1.0,
        privacyProfile: 'public'
      });

      // Welcome Notification
      db.notifications.push({
        id: `not-welcome-${Date.now()}`,
        userId,
        title: 'Welcome to MockAI!',
        message: 'Get started by configuring your profile or setting up your first AI Mock Interview.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });

      // First Achievement
      db.achievements.push({
        id: `ach-learner-${Date.now()}`,
        userId,
        badge: 'Consistent Learner',
        title: 'Fresh Mind',
        description: 'Signed up and registered on MockAI!',
        unlockedAt: new Date().toISOString()
      });

      writeDB(db);

      const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
      res.status(201).json({ user: newUser, token });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response): void => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const db = readDB();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      if (user.passwordHash !== hashPassword(password)) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      
      // Remove passwordHash before returning user object
      const { passwordHash, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const user = db.users.find(u => u.id === req.user?.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user state' });
    }
  });

  // ==========================================
  // PROFILE APIs
  // ==========================================

  app.put('/api/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { name, college, department, skills, targetCompanies, experienceLevel } = req.body;
      const db = readDB();
      const userIdx = db.users.findIndex(u => u.id === req.user?.id);

      if (userIdx === -1) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      db.users[userIdx] = {
        ...db.users[userIdx],
        name: name || db.users[userIdx].name,
        college: college !== undefined ? college : db.users[userIdx].college,
        department: department !== undefined ? department : db.users[userIdx].department,
        skills: skills || db.users[userIdx].skills,
        targetCompanies: targetCompanies || db.users[userIdx].targetCompanies,
        experienceLevel: experienceLevel || db.users[userIdx].experienceLevel
      };

      writeDB(db);
      const { passwordHash, ...safeUser } = db.users[userIdx];
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.post('/api/profile/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new passwords are required' });
        return;
      }

      const db = readDB();
      const userIdx = db.users.findIndex(u => u.id === req.user?.id);
      if (userIdx === -1) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (db.users[userIdx].passwordHash !== hashPassword(currentPassword)) {
        res.status(400).json({ error: 'Incorrect current password' });
        return;
      }

      db.users[userIdx].passwordHash = hashPassword(newPassword);
      writeDB(db);

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  app.delete('/api/profile/delete-account', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const userId = req.user?.id;

      db.users = db.users.filter(u => u.id !== userId);
      db.interviews = db.interviews.filter(i => i.userId !== userId);
      db.answers = db.answers.filter(a => a.userId !== userId);
      db.resumeAnalyses = db.resumeAnalyses.filter(r => r.userId !== userId);
      db.achievements = db.achievements.filter(a => a.userId !== userId);
      db.notifications = db.notifications.filter(n => n.userId !== userId);
      db.settings = db.settings.filter(s => s.userId !== userId);

      writeDB(db);
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // ==========================================
  // INTERVIEW SETUP & AI QUESTION GENERATION
  // ==========================================

  app.post('/api/interviews/setup', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { company, jobRole, department, experience, difficulty, interviewType, questionCount, skills, candidateDetails } = req.body;
      
      if (!interviewType || !questionCount) {
        res.status(400).json({ error: 'Interview type and question count are required' });
        return;
      }

      // 1. Generate interview questions via Gemini on Server
      const generated = await generateInterviewQuestions({
        company: company || 'Generic',
        jobRole: jobRole || 'Software Engineer',
        department: department || 'Engineering',
        experience: experience || 'entry',
        difficulty: difficulty || Difficulty.MEDIUM,
        interviewType: interviewType || InterviewType.TECHNICAL,
        questionCount: questionCount || 3,
        skills: skills || ['Algorithms', 'System Design']
      });

      // 2. Save Interview metadata and register/update student profile
      const db = readDB();
      let activeUserId = req.user!.id;
      let freshUserObj = db.users.find(u => u.id === activeUserId);

      if (candidateDetails) {
        // Find existing user by Register Number or Email to prevent duplication
        let existingUser = db.users.find(u => 
          (candidateDetails.registerNumber && u.registerNumber === candidateDetails.registerNumber) ||
          (candidateDetails.email && u.email.toLowerCase() === candidateDetails.email.toLowerCase())
        );

        if (existingUser) {
          // Update existing candidate profile details
          existingUser.name = candidateDetails.fullName || existingUser.name;
          existingUser.registerNumber = candidateDetails.registerNumber || existingUser.registerNumber;
          existingUser.college = candidateDetails.collegeName || existingUser.college;
          existingUser.department = candidateDetails.department || existingUser.department;
          existingUser.year = candidateDetails.year || existingUser.year;
          existingUser.email = candidateDetails.email || existingUser.email;
          existingUser.experienceLevel = candidateDetails.experienceLevel || existingUser.experienceLevel;
          
          activeUserId = existingUser.id;
          freshUserObj = existingUser;
        } else {
          // Create a brand new student profile
          const newUserId = `user-${Date.now()}`;
          const newProfile = {
            id: newUserId,
            email: candidateDetails.email,
            name: candidateDetails.fullName,
            role: 'user' as any,
            college: candidateDetails.collegeName,
            department: candidateDetails.department,
            registerNumber: candidateDetails.registerNumber,
            year: candidateDetails.year,
            skills: skills || [],
            targetCompanies: [company || 'Generic'],
            experienceLevel: candidateDetails.experienceLevel || 'entry',
            xp: 0,
            streak: 0,
            badges: [],
            passwordHash: '',
            createdAt: new Date().toISOString()
          };
          db.users.push(newProfile);
          activeUserId = newUserId;
          freshUserObj = newProfile;
        }
      }

      const interviewId = `interview-${Date.now()}`;
      
      const newInterview: Interview = {
        id: interviewId,
        userId: activeUserId,
        company: company || 'Generic',
        jobRole: jobRole || 'Software Engineer',
        department: department || 'Engineering',
        experience: experience || 'entry',
        difficulty: difficulty || Difficulty.MEDIUM,
        interviewType: interviewType || InterviewType.TECHNICAL,
        questionCount: generated.length,
        skills: skills || [],
        duration: questionCount * 8, // rough estimation
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      db.interviews.push(newInterview);

      // 3. Save Questions references linked to this interview
      const savedQuestions = generated.map((q, idx) => {
        const fullQ = {
          id: q.id,
          interviewId,
          text: q.text,
          type: q.type,
          order: idx + 1,
          expectedComplexity: q.expectedComplexity,
          initialCode: q.initialCode
        };
        db.questions.push(fullQ);
        return fullQ;
      });

      writeDB(db);
      res.status(201).json({ interview: newInterview, questions: savedQuestions, user: freshUserObj });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error?.message || 'Failed to setup interview' });
    }
  });

  // ==========================================
  // SUBMIT INDIVIDUAL ANSWERS & EVALUATION
  // ==========================================

  app.post('/api/interviews/:id/submit-answer', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const interviewId = req.params.id;
      const { questionId, answerText, codeSolution } = req.body;

      if (!questionId || !answerText) {
        res.status(400).json({ error: 'Question ID and answer text are required' });
        return;
      }

      const db = readDB();
      const question = db.questions.find(q => q.id === questionId);
      if (!question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      // Evaluate the single response using Gemini
      const evaluation = await evaluateAnswer({
        question: question.text,
        answerText,
        questionType: question.type,
        expectedComplexity: question.expectedComplexity,
        codeSolution
      });

      // Average correctness and technicalDepth serves as answer score
      const answerScore = Math.round((evaluation.correctness + evaluation.technicalDepth) / 2);

      const newAnswer: Answer = {
        id: `ans-${Date.now()}`,
        interviewId,
        questionId,
        userId: req.user!.id,
        text: answerText,
        score: answerScore,
        feedback: evaluation.justification,
        analysis: evaluation,
        codeSolution,
        createdAt: new Date().toISOString()
      };

      // Filter out any previous answer to this same question in this interview to allow retries
      db.answers = db.answers.filter(a => !(a.interviewId === interviewId && a.questionId === questionId));
      db.answers.push(newAnswer);
      writeDB(db);

      res.status(200).json(newAnswer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process answer evaluation' });
    }
  });

  // ==========================================
  // FINALIZE INTERVIEW REPORT & REWARDS
  // ==========================================

  app.post('/api/interviews/:id/finish', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const interviewId = req.params.id;
      const { behavioralMetrics } = req.body;
      const db = readDB();

      const interviewIdx = db.interviews.findIndex(i => i.id === interviewId && i.userId === req.user?.id);
      if (interviewIdx === -1) {
        res.status(404).json({ error: 'Interview session not found' });
        return;
      }

      const questions = db.questions.filter(q => q.interviewId === interviewId);
      const answers = db.answers.filter(a => a.interviewId === interviewId);

      // 1. Generate full summary report via Gemini AI
      const finalReport = await generateFinalReport({
        interview: db.interviews[interviewIdx],
        questions,
        answers,
        behavioralMetrics
      });

      // 2. Update Interview with scores & report
      db.interviews[interviewIdx].status = 'completed';
      db.interviews[interviewIdx].score = finalReport.overallScore;
      db.interviews[interviewIdx].feedbackReport = finalReport;
      db.interviews[interviewIdx].behavioralMetrics = behavioralMetrics || finalReport.videoBehaviorReport;

      // 3. Award XP & adjust User profile streaks
      const userIdx = db.users.findIndex(u => u.id === req.user?.id);
      if (userIdx !== -1) {
        const oldXp = db.users[userIdx].xp;
        const xpEarned = finalReport.overallScore * 2; // e.g. 85 score -> 170 XP
        db.users[userIdx].xp += xpEarned;
        
        // Boost streaks on completes
        db.users[userIdx].streak += 1;

        // Unlock badges dynamically
        const currentBadges = db.users[userIdx].badges;
        const newBadges: string[] = [];

        if (db.users[userIdx].streak >= 5 && !currentBadges.includes('Consistent Learner')) {
          newBadges.push('Consistent Learner');
        }
        if (finalReport.overallScore >= 90 && !currentBadges.includes('Top Performer')) {
          newBadges.push('Top Performer');
        }
        if (db.interviews[interviewIdx].interviewType === InterviewType.CODING && finalReport.overallScore >= 85 && !currentBadges.includes('Coding Expert')) {
          newBadges.push('Coding Expert');
        }
        if (db.users[userIdx].xp >= 2000 && !currentBadges.includes('AI Master')) {
          newBadges.push('AI Master');
        }

        newBadges.forEach(b => {
          db.users[userIdx].badges.push(b);
          db.achievements.push({
            id: `ach-${Date.now()}-${b.replace(' ', '')}`,
            userId: req.user!.id,
            badge: b,
            title: b,
            description: `Unlocked by completing a high quality interview on MockAI with score ${finalReport.overallScore}`,
            unlockedAt: new Date().toISOString()
          });

          db.notifications.push({
            id: `not-badge-${Date.now()}`,
            userId: req.user!.id,
            title: 'Badge Unlocked!',
            message: `Congratulations! You unlocked the "${b}" badge for excellent interview performance.`,
            type: 'achievement',
            read: false,
            createdAt: new Date().toISOString()
          });
        });

        // Routine completion notification
        db.notifications.push({
          id: `not-complete-${Date.now()}`,
          userId: req.user!.id,
          title: 'Interview Complete!',
          message: `Your mock interview for ${db.interviews[interviewIdx].company} is evaluated. Score: ${finalReport.overallScore}%`,
          type: 'system',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      writeDB(db);
      res.json(db.interviews[interviewIdx]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to assemble feedback report' });
    }
  });

  // ==========================================
  // INTERVIEW HISTORY (Query, filter, sort, paginate)
  // ==========================================

  app.get('/api/interviews/history', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      let list = db.interviews.filter(i => i.userId === req.user?.id);

      // Filter
      const { search, company, role, difficulty, sort } = req.query;

      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(i => i.company.toLowerCase().includes(q) || i.jobRole.toLowerCase().includes(q));
      }
      if (company) {
        list = list.filter(i => i.company === String(company));
      }
      if (role) {
        list = list.filter(i => i.jobRole.toLowerCase().includes(String(role).toLowerCase()));
      }
      if (difficulty) {
        list = list.filter(i => i.difficulty === String(difficulty));
      }

      // Sorting
      if (sort === 'score') {
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
      } else if (sort === 'company') {
        list.sort((a, b) => a.company.localeCompare(b.company));
      } else if (sort === 'role') {
        list.sort((a, b) => a.jobRole.localeCompare(b.jobRole));
      } else {
        // Default: Date desc
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      res.json(list);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch interview log' });
    }
  });

  app.delete('/api/interviews/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const id = req.params.id;
      const db = readDB();

      db.interviews = db.interviews.filter(i => !(i.id === id && i.userId === req.user?.id));
      db.questions = db.questions.filter(q => q.interviewId !== id);
      db.answers = db.answers.filter(a => a.interviewId !== id);

      writeDB(db);
      res.json({ message: 'Interview deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete interview' });
    }
  });

  // ==========================================
  // RESUME ANALYZER (AI Resume upload & evaluation)
  // ==========================================

  app.post('/api/resume/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { text, fileName } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Resume content is required' });
        return;
      }

      let extractedText = text;
      // If it looks like base64 / data URI, or is a PDF/DOCX file uploaded as base64
      const isBase64 = text.startsWith('data:') || text.length > 500 && /^[a-zA-Z0-9+/=\s]+$/.test(text.slice(0, 500).replace(/^data:[^;]+;base64,/, ''));
      if (isBase64 || fileName?.endsWith('.pdf') || fileName?.endsWith('.docx')) {
        try {
          extractedText = await extractTextFromBase64(text, fileName || 'resume.pdf');
        } catch (parseError) {
          console.error('Failed to extract text from resume:', parseError);
          res.status(400).json({ error: 'Unable to read this resume. Please upload a valid PDF or DOCX file.' });
          return;
        }
      }

      if (!extractedText || !extractedText.trim()) {
        res.status(400).json({ error: 'Unable to read this resume. Please upload a valid PDF or DOCX file.' });
        return;
      }

      // Call Gemini for high quality resume ATS review
      const analysis = await analyzeResumeText(extractedText, fileName || 'resume.pdf');

      const db = readDB();
      const analysisId = `res-analysis-${Date.now()}`;
      const newAnalysis: ResumeAnalysis = {
        id: analysisId,
        userId: req.user!.id,
        fileName: fileName || 'resume.pdf',
        extractedText: extractedText.substring(0, 5000), // preserve sample
        ...analysis,
        createdAt: new Date().toISOString()
      };

      db.resumeAnalyses.push(newAnalysis);

      // Award XP for updating resume
      const userIdx = db.users.findIndex(u => u.id === req.user?.id);
      if (userIdx !== -1) {
        db.users[userIdx].xp += 150; // Resume review reward
        db.users[userIdx].badges = Array.from(new Set([...db.users[userIdx].badges, 'Resume Expert']));
        
        db.achievements.push({
          id: `ach-resume-${Date.now()}`,
          userId: req.user!.id,
          badge: 'Resume Expert',
          title: 'ATS Proofed',
          description: 'Uploaded a resume and generated an ATS analysis report.',
          unlockedAt: new Date().toISOString()
        });
      }

      writeDB(db);
      res.json(newAnalysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'ATS resume analysis failed' });
    }
  });

  app.get('/api/resume/history', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const analyses = db.resumeAnalyses.filter(r => r.userId === req.user?.id)
                         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load resume analysis logs' });
    }
  });

  // ==========================================
  // LEADERBOARD APIs
  // ==========================================

  app.get('/api/leaderboard', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      
      // Map active users to Leaderboard entries
      const entries: LeaderboardEntry[] = db.users.map(u => {
        const uInterviews = db.interviews.filter(i => i.userId === u.id && i.status === 'completed');
        const total = uInterviews.length;
        
        const avgScore = total > 0 
          ? Math.round(uInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / total)
          : 0;

        const highest = total > 0
          ? Math.max(...uInterviews.map(i => i.score || 0))
          : 0;

        const tech = total > 0
          ? Math.round(uInterviews.reduce((acc, curr) => acc + (curr.feedbackReport?.technicalScore || curr.score || 0), 0) / total)
          : 0;

        const comm = total > 0
          ? Math.round(uInterviews.reduce((acc, curr) => acc + (curr.feedbackReport?.communicationScore || curr.score || 0), 0) / total)
          : 0;

        const conf = total > 0
          ? Math.round(uInterviews.reduce((acc, curr) => acc + (curr.feedbackReport?.confidenceScore || curr.score || 0), 0) / total)
          : 0;

        const eye = total > 0
          ? Math.round(uInterviews.reduce((acc, curr) => {
              const bScore = curr.behavioralMetrics?.eyeContactScore || 
                             curr.feedbackReport?.videoBehaviorReport?.eyeContactScore || 90;
              return acc + bScore;
            }, 0) / total)
          : 0;

        const uResumes = db.resumeAnalyses.filter(r => r.userId === u.id);
        const resumeScore = uResumes.length > 0
          ? Math.max(...uResumes.map(r => r.atsScore))
          : 0;

        const grammar = total > 0
          ? Math.round(uInterviews.reduce((acc, curr) => acc + (curr.feedbackReport?.grammarScore || curr.feedbackReport?.communicationScore || 85), 0) / total)
          : (uResumes.length > 0 ? uResumes[0].grammarScore : 85);

        const overallScore = Math.round((avgScore * 0.7) + (resumeScore * 0.3));

        let improvement = 0;
        if (total >= 2) {
          const sortedInterviews = [...uInterviews].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const latestScore = sortedInterviews[sortedInterviews.length - 1].score || 0;
          const prevScore = sortedInterviews[sortedInterviews.length - 2].score || 0;
          if (prevScore > 0) {
            improvement = Math.round(((latestScore - prevScore) / prevScore) * 100);
          }
        } else if (total === 1) {
          const latestScore = uInterviews[0].score || 0;
          improvement = Math.round(((latestScore - 60) / 60) * 100);
          if (improvement < 0) improvement = 0;
        }

        const sortedByDate = [...uInterviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastDate = sortedByDate.length > 0 ? sortedByDate[0].createdAt : '';

        return {
          userId: u.id,
          userName: u.name,
          college: u.college,
          department: u.department,
          xp: u.xp,
          streak: u.streak,
          badgesCount: u.badges.length,
          averageScore: avgScore,
          totalInterviews: total,
          highestScore: highest,
          technicalScore: tech,
          communicationScore: comm,
          confidenceScore: conf,
          eyeContactScore: eye,
          improvementPercentage: improvement,
          lastInterviewDate: lastDate,
          resumeScore,
          grammarScore: grammar,
          overallScore
        };
      });

      // Sort by overallScore (falling back to averageScore, then highestScore)
      entries.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0) || b.averageScore - a.averageScore || b.highestScore - a.highestScore);

      // Assign ranks
      const ranked = entries.map((entry, idx) => ({
        ...entry,
        rank: idx + 1
      }));

      res.json(ranked);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  app.post('/api/leaderboard/add', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const {
        userName,
        college,
        department,
        averageScore,
        highestScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        eyeContactScore,
        improvementPercentage,
        totalInterviews
      } = req.body;

      if (!userName) {
        res.status(400).json({ error: 'Student name is required' });
        return;
      }

      const db = readDB();
      const mockUserId = `user-mock-${Date.now()}`;
      const mockEmail = `mock_${Date.now()}@mockai.edu`;
      
      const newUser = {
        id: mockUserId,
        email: mockEmail,
        name: userName,
        role: Role.USER,
        college: college || '',
        department: department || '',
        skills: ['Software Engineering'],
        targetCompanies: [],
        experienceLevel: 'entry',
        xp: 100,
        streak: 1,
        badges: ['Consistent Learner'],
        createdAt: new Date().toISOString()
      };

      db.users.push({
        ...newUser,
        passwordHash: hashPassword('mockpassword')
      });

      const totalInterviewsCount = Number(totalInterviews) || 1;
      const avg = Number(averageScore) || 75;
      const high = Number(highestScore) || Math.max(avg, 80);
      const techVal = Number(technicalScore) || avg;
      const commVal = Number(communicationScore) || avg;
      const confVal = Number(confidenceScore) || avg;
      const eyeVal = Number(eyeContactScore) || 90;
      const impVal = Number(improvementPercentage) || 0;

      // Create mock interviews
      for (let k = 0; k < totalInterviewsCount; k++) {
        const isLatest = k === totalInterviewsCount - 1;
        // if multiple interviews, let the baseline be a bit lower to simulate realistic improvement percentage
        const currentScore = isLatest ? avg : Math.max(50, Math.round(avg - impVal));
        
        db.interviews.push({
          id: `interview-mock-${mockUserId}-${k}`,
          userId: mockUserId,
          company: 'Practice Simulation',
          jobRole: 'Systems Engineer',
          department: department || 'Engineering',
          experience: 'entry',
          difficulty: Difficulty.MEDIUM,
          interviewType: InterviewType.TECHNICAL,
          questionCount: 3,
          skills: ['Algorithms'],
          duration: 24,
          status: 'completed',
          score: currentScore,
          createdAt: new Date(Date.now() - (totalInterviewsCount - 1 - k) * 24 * 3600 * 1000).toISOString(),
          feedbackReport: {
            overallScore: currentScore,
            technicalScore: isLatest ? techVal : Math.max(50, techVal - 5),
            communicationScore: isLatest ? commVal : Math.max(50, commVal - 5),
            confidenceScore: isLatest ? confVal : Math.max(50, confVal - 5),
            grammarScore: currentScore,
            problemSolvingScore: currentScore,
            leadershipScore: currentScore,
            behaviorScore: currentScore,
            strengths: [],
            weaknesses: [],
            improvementSuggestions: [],
            recommendedCourses: [],
            recommendedYouTubeVideos: [],
            recommendedPracticeProblems: [],
            nextInterviewSuggestions: '',
            aiSummary: 'Mock student review',
            hiringProbabilityScore: currentScore,
            behavioralAnalysis: '',
            roadmap: [],
            videoBehaviorReport: {
              eyeContactScore: isLatest ? eyeVal : Math.max(50, eyeVal - 3),
              attentionScore: 95,
              faceVisibilityScore: 100,
              confidenceLevel: isLatest ? confVal : Math.max(50, confVal - 5),
              professionalismScore: 90,
              aiSuggestions: []
            }
          },
          behavioralMetrics: {
            eyeContactScore: isLatest ? eyeVal : Math.max(50, eyeVal - 3),
            attentionScore: 95,
            faceVisibilityScore: 100,
            confidenceLevel: isLatest ? confVal : Math.max(50, confVal - 5),
            professionalismScore: 90,
            aiSuggestions: []
          }
        });
      }

      writeDB(db);
      res.status(201).json({ success: true, user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add mock student to leaderboard' });
    }
  });

  app.post('/api/leaderboard/update', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const {
        userId,
        userName,
        college,
        department,
        averageScore,
        highestScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        eyeContactScore,
        improvementPercentage,
        totalInterviews
      } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const db = readDB();
      const userIdx = db.users.findIndex(u => u.id === userId);
      if (userIdx === -1) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (userName) db.users[userIdx].name = userName;
      if (college !== undefined) db.users[userIdx].college = college;
      if (department !== undefined) db.users[userIdx].department = department;

      const totalInterviewsCount = Number(totalInterviews) || 1;
      const avg = Number(averageScore) || 75;
      const high = Number(highestScore) || avg;
      const techVal = Number(technicalScore) || avg;
      const commVal = Number(communicationScore) || avg;
      const confVal = Number(confidenceScore) || avg;
      const eyeVal = Number(eyeContactScore) || 90;
      const impVal = Number(improvementPercentage) || 0;

      // Remove existing completed interviews for this user to recreate them to match values perfectly
      db.interviews = db.interviews.filter(i => !(i.userId === userId && i.status === 'completed'));

      for (let k = 0; k < totalInterviewsCount; k++) {
        const isLatest = k === totalInterviewsCount - 1;
        // If highestScore is different from averageScore, make the latest score closer to averageScore or highestScore
        const currentScore = isLatest ? avg : Math.max(50, Math.round(avg - impVal));
        
        db.interviews.push({
          id: `interview-mock-${userId}-${k}-${Date.now()}`,
          userId,
          company: 'Practice Simulation',
          jobRole: 'Systems Engineer',
          department: department || db.users[userIdx].department || 'Engineering',
          experience: 'entry',
          difficulty: Difficulty.MEDIUM,
          interviewType: InterviewType.TECHNICAL,
          questionCount: 3,
          skills: ['Algorithms'],
          duration: 24,
          status: 'completed',
          score: currentScore,
          createdAt: new Date(Date.now() - (totalInterviewsCount - 1 - k) * 24 * 3600 * 1000).toISOString(),
          feedbackReport: {
            overallScore: currentScore,
            technicalScore: isLatest ? techVal : Math.max(50, techVal - 5),
            communicationScore: isLatest ? commVal : Math.max(50, commVal - 5),
            confidenceScore: isLatest ? confVal : Math.max(50, confVal - 5),
            grammarScore: currentScore,
            problemSolvingScore: currentScore,
            leadershipScore: currentScore,
            behaviorScore: currentScore,
            strengths: [],
            weaknesses: [],
            improvementSuggestions: [],
            recommendedCourses: [],
            recommendedYouTubeVideos: [],
            recommendedPracticeProblems: [],
            nextInterviewSuggestions: '',
            aiSummary: 'Mock student review',
            hiringProbabilityScore: currentScore,
            behavioralAnalysis: '',
            roadmap: [],
            videoBehaviorReport: {
              eyeContactScore: isLatest ? eyeVal : Math.max(50, eyeVal - 3),
              attentionScore: 95,
              faceVisibilityScore: 100,
              confidenceLevel: isLatest ? confVal : Math.max(50, confVal - 5),
              professionalismScore: 90,
              aiSuggestions: []
            }
          },
          behavioralMetrics: {
            eyeContactScore: isLatest ? eyeVal : Math.max(50, eyeVal - 3),
            attentionScore: 95,
            faceVisibilityScore: 100,
            confidenceLevel: isLatest ? confVal : Math.max(50, confVal - 5),
            professionalismScore: 90,
            aiSuggestions: []
          }
        });
      }

      writeDB(db);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update leaderboard entry' });
    }
  });

  app.delete('/api/leaderboard/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const userId = req.params.id;
      if (userId === 'admin-id') {
        res.status(400).json({ error: 'Cannot delete default primary admin account' });
        return;
      }

      const db = readDB();
      db.users = db.users.filter(u => u.id !== userId);
      db.interviews = db.interviews.filter(i => i.userId !== userId);
      db.answers = db.answers.filter(a => a.userId !== userId);
      db.resumeAnalyses = db.resumeAnalyses.filter(r => r.userId !== userId);
      db.achievements = db.achievements.filter(a => a.userId !== userId);
      db.notifications = db.notifications.filter(n => n.userId !== userId);
      db.settings = db.settings.filter(s => s.userId !== userId);

      writeDB(db);
      res.json({ success: true, message: 'Student removed from leaderboard' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete student from leaderboard' });
    }
  });

  // ==========================================
  // ACHIEVEMENTS & NOTIFICATIONS APIs
  // ==========================================

  app.get('/api/achievements', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const userAchievements = db.achievements.filter(a => a.userId === req.user?.id);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });

  app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const userNotifications = db.notifications.filter(n => n.userId === req.user?.id)
                                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(userNotifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load notifications' });
    }
  });

  app.post('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const notId = req.params.id;
      const db = readDB();
      const idx = db.notifications.findIndex(n => n.id === notId && n.userId === req.user?.id);

      if (idx !== -1) {
        db.notifications[idx].read = true;
        writeDB(db);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification' });
    }
  });

  // ==========================================
  // SETTINGS APIs
  // ==========================================

  app.get('/api/settings', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      let userSettings = db.settings.find(s => s.userId === req.user?.id);
      if (!userSettings) {
        // fallback
        userSettings = {
          userId: req.user!.id,
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: true,
          language: 'English',
          voiceName: 'Zephyr',
          aiSpeed: 1.0,
          privacyProfile: 'public',
          speechTone: 'professional',
          cameraPreference: '',
          microphonePreference: ''
        };
        db.settings.push(userSettings);
        writeDB(db);
      }
      res.json(userSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load settings' });
    }
  });

  app.put('/api/settings', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const idx = db.settings.findIndex(s => s.userId === req.user?.id);
      
      const newSettings = {
        userId: req.user!.id,
        theme: req.body.theme || 'dark',
        emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : true,
        pushNotifications: req.body.pushNotifications !== undefined ? req.body.pushNotifications : true,
        language: req.body.language || 'English',
        voiceName: req.body.voiceName || 'Zephyr',
        aiSpeed: req.body.aiSpeed || 1.0,
        privacyProfile: req.body.privacyProfile || 'public',
        speechTone: req.body.speechTone || 'professional',
        cameraPreference: req.body.cameraPreference || '',
        microphonePreference: req.body.microphonePreference || ''
      };

      if (idx !== -1) {
        db.settings[idx] = newSettings;
      } else {
        db.settings.push(newSettings);
      }

      writeDB(db);
      res.json(newSettings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // ==========================================
  // DASHBOARD PERFORMANCE ANALYTICS (Recharts proxy)
  // ==========================================

  app.get('/api/analytics', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const userId = req.user?.id;

      const userInterviews = db.interviews.filter(i => i.userId === userId && i.status === 'completed')
                               .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // 1. Performance Trend over time
      const performanceTrend = userInterviews.map((i, idx) => ({
        name: `Mock #${idx + 1}`,
        score: i.score || 0,
        company: i.company,
        date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));

      // 2. Average Scores break down
      let technicalAvg = 0;
      let communicationAvg = 0;
      let grammarAvg = 0;
      let problemSolvingAvg = 0;
      let behaviorAvg = 0;

      if (userInterviews.length > 0) {
        userInterviews.forEach(i => {
          const rep = i.feedbackReport;
          technicalAvg += rep?.technicalScore || i.score || 80;
          communicationAvg += rep?.communicationScore || i.score || 80;
          grammarAvg += rep?.grammarScore || i.score || 80;
          problemSolvingAvg += rep?.problemSolvingScore || i.score || 80;
          behaviorAvg += rep?.behaviorScore || i.score || 80;
        });

        technicalAvg = Math.round(technicalAvg / userInterviews.length);
        communicationAvg = Math.round(communicationAvg / userInterviews.length);
        grammarAvg = Math.round(grammarAvg / userInterviews.length);
        problemSolvingAvg = Math.round(problemSolvingAvg / userInterviews.length);
        behaviorAvg = Math.round(behaviorAvg / userInterviews.length);
      } else {
        // defaults
        technicalAvg = 80;
        communicationAvg = 75;
        grammarAvg = 82;
        problemSolvingAvg = 78;
        behaviorAvg = 80;
      }

      const scoreBreakdown = [
        { subject: 'Technical', A: technicalAvg, fullMark: 100 },
        { subject: 'Communication', A: communicationAvg, fullMark: 100 },
        { subject: 'Grammar', A: grammarAvg, fullMark: 100 },
        { subject: 'Logic', A: problemSolvingAvg, fullMark: 100 },
        { subject: 'Behavioral', A: behaviorAvg, fullMark: 100 }
      ];

      // 3. Interview Count by company
      const companyCountMap: Record<string, number> = {};
      userInterviews.forEach(i => {
        companyCountMap[i.company] = (companyCountMap[i.company] || 0) + 1;
      });
      const companyShares = Object.keys(companyCountMap).map(key => ({
        name: key,
        value: companyCountMap[key]
      }));

      // 4. Resume Score History
      const resumes = db.resumeAnalyses.filter(r => r.userId === userId)
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const resumeScoreTrend = resumes.map((r, idx) => ({
        name: `Upload #${idx + 1}`,
        atsScore: r.atsScore,
        grammar: r.grammarScore,
        format: r.formattingScore
      }));

      res.json({
        performanceTrend,
        scoreBreakdown,
        companyShares: companyShares.length > 0 ? companyShares : [{ name: 'Practice', value: 1 }],
        resumeScoreTrend,
        summaryStats: {
          totalInterviews: userInterviews.length,
          avgScore: userInterviews.length > 0 
            ? Math.round(userInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / userInterviews.length)
            : 0,
          resumeAnalysesCount: resumes.length,
          xpEarned: db.users.find(u => u.id === userId)?.xp || 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to compile profile analytics' });
    }
  });

  // ==========================================
  // ADMIN PANEL APIs
  // ==========================================

  app.get('/api/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      
      const totalUsers = db.users.length;
      const totalInterviews = db.interviews.length;
      const completedInterviews = db.interviews.filter(i => i.status === 'completed').length;
      const totalResumesParsed = db.resumeAnalyses.length;

      // System average score
      const completes = db.interviews.filter(i => i.status === 'completed');
      const systemAverageScore = completes.length > 0 
        ? Math.round(completes.reduce((acc, curr) => acc + (curr.score || 0), 0) / completes.length)
        : 82;

      // Type distributions
      const typeMap: Record<string, number> = {};
      db.interviews.forEach(i => {
        typeMap[i.interviewType] = (typeMap[i.interviewType] || 0) + 1;
      });
      const interviewTypes = Object.keys(typeMap).map(key => ({
        name: key.toUpperCase(),
        value: typeMap[key]
      }));

      // Active registrations trend (recent 5 days)
      const registrationsTrend = [
        { date: 'Mon', count: 12 },
        { date: 'Tue', count: 18 },
        { date: 'Wed', count: 15 },
        { date: 'Thu', count: 22 },
        { date: 'Fri', count: 29 },
        { date: 'Sat', count: totalUsers }
      ];

      res.json({
        totalUsers,
        totalInterviews,
        completedInterviews,
        totalResumesParsed,
        systemAverageScore,
        interviewTypes,
        registrationsTrend
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to compile admin metrics' });
    }
  });

  app.get('/api/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const db = readDB();
      const safeUsers = db.users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch directory' });
    }
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
    try {
      const userId = req.params.id;
      if (userId === 'admin-id') {
        res.status(400).json({ error: 'Cannot delete default primary admin account' });
        return;
      }

      const db = readDB();
      db.users = db.users.filter(u => u.id !== userId);
      db.interviews = db.interviews.filter(i => i.userId !== userId);
      db.answers = db.answers.filter(a => a.userId !== userId);
      db.resumeAnalyses = db.resumeAnalyses.filter(r => r.userId !== userId);
      db.achievements = db.achievements.filter(a => a.userId !== userId);
      db.notifications = db.notifications.filter(n => n.userId !== userId);
      db.settings = db.settings.filter(s => s.userId !== userId);

      writeDB(db);
      res.json({ message: 'User account and historical records deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // ==========================================
  // VITE DEVELOPMENT MIDDLEWARE OR PROD ROUTING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-initialize files on start
  initDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MockAI FullStack] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
