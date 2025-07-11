/**
 * 파일명: supabase.ts
 * 목적: Supabase 클라이언트 설정 및 데이터베이스 타입 정의
 * 역할: 데이터베이스 연결 및 조 관리 관련 타입 정의
 * 작성일: 2024-12-30
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Please check your .env.local file:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Group {
  id: number;
  group_number: number;
  name: string;
  teacher: string;
  leader: string;
  score: number;
  created_at: string;
}

export interface GroupMember {
  id: number;
  name: string;
  role: 'student' | 'teacher';
  contact: string;
  group_id: number;
  class?: string;
  created_at: string;
}

export interface Student {
  id: number;
  name: string;
  class: string;
  group_id: number;
  group_name: string;
  contact: string;
  role: 'student' | 'teacher';
  is_leader: boolean;
  created_at: string;
}

// 공지사항 타입 추가
export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

// Class options
export const CLASSES = [
  '1부 1-1',
  '1부 1-2',
  '1부 1-3',
  '1부 1-4',
  '1부 1-5',
  '1부 2-1',
  '1부 2-2',
  '1부 2-3',
  '1부 2-4',
  '1부 2-5',
  '1부 3-1',
  '1부 3-2',
  '1부 3-3',
  '1부 3-4',
  '1부 3-5',
  '2부 1-1',
  '2부 1-2',
  '2부 1-3',
  '2부 1-4',
  '2부 2-1',
  '2부 2-2',
  '2부 2-3',
  '2부 3-1',
  '2부 3-2',
  '2부 3-3',
  '오이코스',
  '교사',
  '목사',
] as const;

export type ClassType = (typeof CLASSES)[number];
