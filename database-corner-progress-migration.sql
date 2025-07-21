/**
 * 파일명: database-corner-progress-migration.sql
 * 목적: 코너 진행 상황 관리를 위한 데이터베이스 마이그레이션
 * 역할: group_progress 테이블 및 관련 설정 추가
 * 작성일: 2024-01-24
 */

-- 코너 진행 상황 관리를 위한 데이터베이스 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- 1. 코너 진행 상황 테이블 생성
CREATE TABLE IF NOT EXISTS group_progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  current_corner_index INTEGER DEFAULT 0,
  completed_corners INTEGER[] DEFAULT '{}',
  total_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_group_progress_group_id ON group_progress(group_id);

-- 3. RLS (Row Level Security) 설정
ALTER TABLE group_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
CREATE POLICY "Enable read access for all users" ON group_progress
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON group_progress
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON group_progress
FOR UPDATE USING (true);

-- 5. 기존 조들에 대한 진행 상황 초기 데이터 생성
INSERT INTO group_progress (group_id, current_corner_index, completed_corners, total_score)
SELECT id, 0, '{}', 0
FROM groups
WHERE id NOT IN (SELECT group_id FROM group_progress);

-- 6. 진행 상황 업데이트 함수
CREATE OR REPLACE FUNCTION update_group_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 트리거 생성
DROP TRIGGER IF EXISTS update_group_progress_timestamp ON group_progress;
CREATE TRIGGER update_group_progress_timestamp
    BEFORE UPDATE ON group_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_group_progress_timestamp();

-- 8. 진행 상황 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW group_progress_view AS
SELECT 
    g.group_number,
    g.name,
    g.score as total_group_score,
    gp.current_corner_index,
    gp.completed_corners,
    gp.total_score as progress_score,
    array_length(gp.completed_corners, 1) as completed_corner_count,
    gp.updated_at as last_progress_update
FROM groups g
LEFT JOIN group_progress gp ON g.id = gp.group_id
ORDER BY g.group_number;

-- 완료 메시지
SELECT '코너 진행 상황 마이그레이션이 성공적으로 완료되었습니다!' as message;
SELECT '영향을 받은 테이블: group_progress' as table_info;
SELECT count(*) || '개 조의 진행 상황이 초기화되었습니다.' as initialization_info 
FROM group_progress; 