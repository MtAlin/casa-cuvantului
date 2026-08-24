import axios from 'axios';
import { StudyPlan, StudyBook, ChapterGroup, UserPlan, PlanStats, StudyResponse, QuestionAnswer, ReadingPlan, Bookmark, Note, UserStudyPlan, AppNotification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock service removed

// ── Study Plan API Service (Real DB calls) ──

export const studyPlanService = {
  getAll: async (): Promise<StudyPlan[]> => {
    const res = await api.get('/study-plans');
    return res.data;
  },
  getActive: async (): Promise<StudyPlan | null> => {
    const res = await api.get('/study-plans/active');
    return res.data;
  },
  getById: async (id: string): Promise<StudyPlan> => {
    const res = await api.get(`/study-plans/${id}`);
    return res.data;
  },
  create: async (plan: Omit<StudyPlan, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<StudyPlan> => {
    const res = await api.post('/study-plans', plan);
    return res.data;
  },
  update: async (id: string, updates: Partial<StudyPlan>): Promise<StudyPlan> => {
    const res = await api.put(`/study-plans/${id}`, updates);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/study-plans/${id}`);
  },
};

export const userStudyPlanService = {
  getAll: async (): Promise<UserStudyPlan[]> => {
    const res = await api.get('/user-study-plans');
    return res.data;
  },
  enroll: async (studyPlanId: string): Promise<UserStudyPlan> => {
    const res = await api.post('/user-study-plans/enroll', { studyPlanId });
    return res.data;
  },
  updateStatus: async (id: string, status: 'active' | 'canceled'): Promise<UserStudyPlan> => {
    const res = await api.patch(`/user-study-plans/${id}/status`, { status });
    return res.data;
  },
  updateProgress: async (id: string, completedGroups: string[]): Promise<UserStudyPlan> => {
    const res = await api.patch(`/user-study-plans/${id}/progress`, { completedGroups });
    return res.data;
  },
  resetProgress: async (studyPlanId: string): Promise<UserStudyPlan> => {
    const res = await api.post(`/user-study-plans/reset/${studyPlanId}`);
    return res.data;
  }
};

export const userPlanService = {
  getCommunityStats: async (): Promise<any> => {
    const res = await api.get('/user-plans/community-stats');
    return res.data;
  }
};

// ── Bible API Service ──
export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export const bibleService = {
  getChapter: async (bookName: string, chapter: number, translation: string = 'rccv'): Promise<BibleVerse[]> => {
    // Map Romanian book names to English book names for bible-api.com
    const bookMap: Record<string, string> = {
      'Geneza': 'Genesis',
      'Exodul': 'Exodus',
      'Leviticul': 'Leviticus',
      'Numeri': 'Numbers',
      'Deuteronom': 'Deuteronomy',
      'Iosua': 'Joshua',
      'Judecători': 'Judges',
      'Rut': 'Ruth',
      '1 Samuel': '1 Samuel',
      '2 Samuel': '2 Samuel',
      '1 Împărați': '1 Kings',
      '2 Împărați': '2 Kings',
      '1 Cronici': '1 Chronicles',
      '2 Cronici': '2 Chronicles',
      'Ezra': 'Ezra',
      'Neemia': 'Nehemiah',
      'Estera': 'Esther',
      'Iov': 'Job',
      'Psalmi': 'Psalms',
      'Proverbe': 'Proverbs',
      'Eclesiastul': 'Ecclesiastes',
      'Cântarea Cântărilor': 'Song of Solomon',
      'Isaia': 'Isaiah',
      'Ieremia': 'Jeremiah',
      'Plângerile lui Ieremia': 'Lamentations',
      'Ezechiel': 'Ezekiel',
      'Daniel': 'Daniel',
      'Osea': 'Hosea',
      'Ioel': 'Joel',
      'Amos': 'Amos',
      'Obadia': 'Obadiah',
      'Iona': 'Jonah',
      'Mica': 'Micah',
      'Naum': 'Nahum',
      'Habacuc': 'Habakkuk',
      'Țefania': 'Zephaniah',
      'Hagai': 'Haggai',
      'Zaharia': 'Zechariah',
      'Maleahi': 'Malachi',
      'Matei': 'Matthew',
      'Marcu': 'Mark',
      'Luca': 'Luke',
      'Ioan': 'John',
      'Evanghelia după Ioan': 'John',
      'Faptele Apostolilor': 'Acts',
      'Romani': 'Romans',
      '1 Corinteni': '1 Corinthians',
      '2 Corinteni': '2 Corinthians',
      'Galateni': 'Galatians',
      'Efeseni': 'Ephesians',
      'Filipeni': 'Philippians',
      'Coloseni': 'Colossians',
      '1 Tesaloniceni': '1 Thessalonians',
      '2 Tesaloniceni': '2 Thessalonians',
      '1 Timotei': '1 Timothy',
      '2 Timotei': '2 Timothy',
      'Tit': 'Titus',
      'Filimon': 'Philemon',
      'Evrei': 'Hebrews',
      'Iacov': 'James',
      '1 Petru': '1 Peter',
      '2 Petru': '2 Peter',
      '1 Ioan': '1 John',
      '2 Ioan': '2 John',
      '3 Ioan': '3 John',
      'Iuda': 'Jude',
      'Apocalipsa': 'Revelation'
    };

    const englishBookName = bookMap[bookName] || bookName;
    const queryBook = translation === 'rccv' ? bookName : englishBookName;
    const query = `${queryBook}+${chapter}`;
    
    try {
      const response = await fetch(`https://bible-api.com/${query}?translation=${translation}`);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      if (data.verses) {
        return data.verses.map((v: any) => ({
          book_id: v.book_id,
          book_name: bookName, // Keep Romanian name for display
          chapter: v.chapter,
          verse: v.verse,
          text: v.text
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch from bible-api.com:', err);
      // Fallback or empty
      return [];
    }
  }
};

export const notificationService = {
  getAll: async (): Promise<AppNotification[]> => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAsRead: async (id: string): Promise<AppNotification> => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  }
};

export default api;
