/**
 * 파일명: database-notice-setup.sql
 * 목적: 공지사항 기능을 위한 데이터베이스 테이블 및 설정
 * 역할: 공지사항 테이블 생성 및 RLS 정책 설정
 * 작성일: 2024-12-30
 */

-- 공지사항 테이블 생성
CREATE TABLE notices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 공지사항 테이블 인덱스 생성
CREATE INDEX idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX idx_notices_author ON notices(author);

-- RLS (Row Level Security) 설정
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기 가능, 쓰기 가능)
-- 공지사항 읽기 정책
CREATE POLICY "Enable read access for all users" ON notices
FOR SELECT USING (true);

-- 공지사항 작성 정책
CREATE POLICY "Enable insert access for all users" ON notices
FOR INSERT WITH CHECK (true);

-- 공지사항 수정 정책
CREATE POLICY "Enable update access for all users" ON notices
FOR UPDATE USING (true);

-- 공지사항 삭제 정책
CREATE POLICY "Enable delete access for all users" ON notices
FOR DELETE USING (true);

-- 최신 공지사항 조회 뷰 생성
CREATE VIEW latest_notices_view AS
SELECT 
    id,
    title,
    content,
    author,
    created_at,
    updated_at,
    CASE 
        WHEN created_at > NOW() - INTERVAL '7 days' THEN true
        ELSE false
    END as is_new
FROM notices
ORDER BY created_at DESC;

-- 샘플 공지사항 데이터 삽입 (테스트용)
INSERT INTO notices (title, content, author) VALUES 
  ('여름성경학교 공지사항', '여름성경학교에 오신 것을 환영합니다! 즐거운 시간 되세요.', 'admin');

-- 설정 완료 메시지
SELECT 'Notice database setup completed successfully!' as message; 