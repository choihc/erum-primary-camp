/**
 * 파일명: database-migration.sql
 * 목적: 기존 데이터베이스를 새로운 구조로 마이그레이션
 * 역할: teacher, leader, role 컬럼 제거 및 구조 단순화
 * 작성일: 2025-01-03
 */

-- 1. 먼저 기존 뷰들 삭제 (컬럼 의존성 때문에)
DROP VIEW IF EXISTS group_ranking_view;
DROP VIEW IF EXISTS group_members_count_view;

-- 2. groups 테이블에서 teacher, leader 컬럼 제거
ALTER TABLE groups DROP COLUMN IF EXISTS teacher;
ALTER TABLE groups DROP COLUMN IF EXISTS leader;

-- 3. group_members 테이블에서 role 컬럼 제거
ALTER TABLE group_members DROP COLUMN IF EXISTS role;

-- 4. 새로운 구조로 뷰들 재생성
CREATE OR REPLACE VIEW group_ranking_view AS
SELECT 
    g.group_number,
    g.name,
    g.score,
    ROW_NUMBER() OVER (ORDER BY g.score DESC, g.group_number) as rank
FROM groups g
ORDER BY g.score DESC, g.group_number;

CREATE OR REPLACE VIEW group_members_count_view AS
SELECT 
    g.group_number,
    g.name,
    g.score,
    COUNT(gm.id) as student_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.group_number, g.name, g.score
ORDER BY g.group_number;

-- 5. 완료 메시지
SELECT '데이터베이스 마이그레이션이 완료되었습니다!' as message; 