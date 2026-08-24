export type UserRole = 'admin' | 'member';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Reading {
  day: number;
  title: string;
  book: string;
  chapters: string;
  description?: string;
}

export interface ReadingPlan {
  _id: string;
  title: string;
  description: string;
  type: 'yearly' | 'topical' | 'book' | 'custom';
  duration: number;
  readings: Reading[];
  coverImage: string;
  createdBy?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  dayIndex: number;
  completed: boolean;
  completedAt?: string;
}

export interface UserPlan {
  _id: string;
  userId: string;
  planId: ReadingPlan;
  progress: UserProgress[];
  startDate: string;
  currentDay: number;
  streakCount: number;
  lastStudyDate?: string;
  isCompleted: boolean;
  status: 'active' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

export interface PlanStats {
  totalDays: number;
  completedDays: number;
  percentage: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  book?: string;
  chapter?: number;
  verse?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  user: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

// ── Study Plan System (Admin-driven) ──

export interface StudyQuestion {
  _id: string;
  text: string;
  expectedAnswer?: string;
  type?: string;
  isActive?: boolean;
}

export interface ChapterGroup {
  _id: string;
  title: string;
  startChapter: number;
  endChapter: number;
  customChapters?: string;
  questions: StudyQuestion[];
}

export interface StudyBook {
  _id: string;
  bookName: string;
  chapterGroups: ChapterGroup[];
}

export interface StudyPlan {
  _id: string;
  title: string;
  description: string;
  year: number;
  startDate?: string;
  books: StudyBook[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Which book in the study plan is being studied right now
export interface CurrentStudy {
  studyPlanId: string;
  studyPlanTitle: string;
  book: StudyBook;
  bookIndex: number;
}

// Member answers to questions
export interface QuestionAnswer {
  questionId: string;
  answer: string;
}

export interface StudyResponse {
  _id: string;
  userId: string;
  studyPlanId: string;
  bookName: string;
  chapterGroupId: string;
  answers: QuestionAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStudyPlan {
  _id: string;
  userId: string;
  studyPlanId: StudyPlan;
  status: 'active' | 'canceled' | 'completed';
  completedGroups: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityUserStat {
  user: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
  };
  longestStreak: number;
  completedPlans: number;
  completedDays?: number;
  totalDays?: number;
  percentage?: number;
}

export interface CommunityStats {
  topStreaks: CommunityUserStat[];
  topCompleted: CommunityUserStat[];
  allUserStats?: CommunityUserStat[];
}
export interface AppNotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}
