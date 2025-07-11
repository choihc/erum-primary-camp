/**
 * 파일명: database-setup.sql
 * 목적: 이룸교회 초등부 여름성경학교 데이터베이스 설정
 * 역할: 20개 조를 구성하는 데이터베이스 구조 및 초기 데이터 생성
 * 작성일: 2024-12-30
 */

-- 이룸교회 초등부 여름성경학교 웹앱 데이터베이스 초기 설정
-- Supabase SQL Editor에서 실행하세요

-- 1. 조 정보 테이블
CREATE TABLE IF NOT EXISTS groups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_number INTEGER NOT NULL UNIQUE CHECK (group_number >= 1 AND group_number <= 20),
  name VARCHAR(20) NOT NULL UNIQUE,
  teacher VARCHAR(50) NOT NULL,
  leader VARCHAR(50),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 조원 정보 테이블
CREATE TABLE IF NOT EXISTS group_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'teacher')),
  contact VARCHAR(20),
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  class VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 학생 정보 테이블
CREATE TABLE IF NOT EXISTS students (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL,
  class VARCHAR(10) NOT NULL,
  group_id BIGINT REFERENCES groups(id),
  contact VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name, class)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_groups_group_number ON groups(group_number);
CREATE INDEX IF NOT EXISTS idx_groups_score ON groups(score DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_name ON group_members(name);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);

-- RLS (Row Level Security) 설정
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기 가능, 쓰기 가능)
-- 실제 운영 환경에서는 더 세밀한 권한 설정 필요

-- groups 정책
CREATE POLICY "Enable read access for all users" ON groups
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON groups
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON groups
FOR UPDATE USING (true);

-- group_members 정책
CREATE POLICY "Enable read access for all users" ON group_members
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON group_members
FOR INSERT WITH CHECK (true);

-- students 정책
CREATE POLICY "Enable read access for all users" ON students
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON students
FOR INSERT WITH CHECK (true);

-- 20개 조 초기 데이터 생성
INSERT INTO groups (group_number, name, teacher, leader, score) VALUES 
(1, '1조', '담당교사1', '조장1', 0),
(2, '2조', '담당교사2', '조장2', 0),
(3, '3조', '담당교사3', '조장3', 0),
(4, '4조', '담당교사4', '조장4', 0),
(5, '5조', '담당교사5', '조장5', 0),
(6, '6조', '담당교사6', '조장6', 0),
(7, '7조', '담당교사7', '조장7', 0),
(8, '8조', '담당교사8', '조장8', 0),
(9, '9조', '담당교사9', '조장9', 0),
(10, '10조', '담당교사10', '조장10', 0),
(11, '11조', '담당교사11', '조장11', 0),
(12, '12조', '담당교사12', '조장12', 0),
(13, '13조', '담당교사13', '조장13', 0),
(14, '14조', '담당교사14', '조장14', 0),
(15, '15조', '담당교사15', '조장15', 0),
(16, '16조', '담당교사16', '조장16', 0),
(17, '17조', '담당교사17', '조장17', 0),
(18, '18조', '담당교사18', '조장18', 0),
(19, '19조', '담당교사19', '조장19', 0),
(20, '20조', '담당교사20', '조장20', 0);

-- 조별 점수 순위 뷰
CREATE OR REPLACE VIEW group_ranking_view AS
SELECT 
    g.group_number,
    g.name,
    g.teacher,
    g.leader,
    g.score,
    ROW_NUMBER() OVER (ORDER BY g.score DESC, g.group_number) as rank
FROM groups g
ORDER BY g.score DESC, g.group_number;

-- 조별 구성원 수 뷰
CREATE OR REPLACE VIEW group_members_count_view AS
SELECT 
    g.group_number,
    g.name,
    g.teacher,
    g.leader,
    g.score,
    COUNT(CASE WHEN gm.role = 'student' THEN 1 END) as student_count,
    COUNT(CASE WHEN gm.role = 'teacher' THEN 1 END) as teacher_count,
    COUNT(gm.id) as total_members
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.group_number, g.name, g.teacher, g.leader, g.score
ORDER BY g.group_number;

-- 설정 완료 메시지
SELECT '20개 조 데이터베이스 설정이 성공적으로 완료되었습니다!' as message; 