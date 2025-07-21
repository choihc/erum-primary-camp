/**
 * 파일명: database-corner-scores-migration.sql
 * 목적: 코너별 상세 점수 기록 관리를 위한 데이터베이스 마이그레이션
 * 역할: corner_scores 테이블 및 관련 설정 추가
 * 작성일: 2024-01-24
 */

-- 코너별 상세 점수 기록 관리를 위한 데이터베이스 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- 1. 코너별 점수 기록 테이블 생성
CREATE TABLE IF NOT EXISTS corner_scores (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  corner_id INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  base_score INTEGER NOT NULL DEFAULT 0,
  bonus_score INTEGER NOT NULL DEFAULT 0,
  score_type VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'win', 'lose', 'draw', 'manual'
  result_detail TEXT, -- 추가 결과 상세 정보
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(group_id, corner_id)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_corner_scores_group_id ON corner_scores(group_id);
CREATE INDEX IF NOT EXISTS idx_corner_scores_corner_id ON corner_scores(corner_id);
CREATE INDEX IF NOT EXISTS idx_corner_scores_score_type ON corner_scores(score_type);

-- 3. RLS (Row Level Security) 설정
ALTER TABLE corner_scores ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
CREATE POLICY "Enable read access for all users" ON corner_scores
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON corner_scores
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON corner_scores
FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON corner_scores
FOR DELETE USING (true);

-- 5. 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_corner_scores_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 생성
DROP TRIGGER IF EXISTS update_corner_scores_timestamp ON corner_scores;
CREATE TRIGGER update_corner_scores_timestamp
    BEFORE UPDATE ON corner_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_corner_scores_timestamp();

-- 7. 코너별 점수 집계 뷰 생성
CREATE OR REPLACE VIEW corner_scores_summary AS
SELECT 
    g.group_number,
    g.name as group_name,
    cs.corner_id,
    cs.score,
    cs.base_score,
    cs.bonus_score,
    cs.score_type,
    CASE 
        WHEN cs.score_type = 'win' THEN '승리'
        WHEN cs.score_type = 'lose' THEN '패배'
        WHEN cs.score_type = 'draw' THEN '무승부'
        ELSE '기타'
    END as result_text,
    cs.recorded_at,
    cs.updated_at
FROM groups g
LEFT JOIN corner_scores cs ON g.id = cs.group_id
ORDER BY g.group_number, cs.corner_id;

-- 완료 메시지
SELECT '코너별 점수 기록 마이그레이션이 성공적으로 완료되었습니다!' as message;
SELECT '영향을 받은 테이블: corner_scores' as table_info; 