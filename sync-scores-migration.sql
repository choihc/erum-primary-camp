/**
 * 파일명: sync-scores-migration.sql
 * 목적: groups 테이블과 group_progress 테이블의 점수 동기화
 * 역할: 기존 데이터의 total_score를 groups 테이블의 score와 동기화
 * 작성일: 2024-01-24
 */

-- groups 테이블과 group_progress 테이블의 점수 동기화
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 group_progress 테이블의 total_score를 groups 테이블의 score와 동기화
UPDATE group_progress 
SET total_score = g.score,
    updated_at = TIMEZONE('utc'::text, NOW())
FROM groups g 
WHERE group_progress.group_id = g.id
AND group_progress.total_score != g.score;

-- 2. group_progress에 없는 그룹이 있다면 추가 (groups 테이블의 score로 초기화)
INSERT INTO group_progress (group_id, current_corner_index, completed_corners, total_score)
SELECT 
    g.id,
    0,
    '{}',
    g.score
FROM groups g
WHERE g.id NOT IN (SELECT group_id FROM group_progress WHERE group_id IS NOT NULL);

-- 3. 동기화 결과 확인
SELECT 
    g.group_number,
    g.name,
    g.score as groups_score,
    gp.total_score as progress_score,
    CASE 
        WHEN g.score = gp.total_score THEN '✅ 동기화됨'
        ELSE '❌ 불일치'
    END as sync_status
FROM groups g
LEFT JOIN group_progress gp ON g.id = gp.group_id
ORDER BY g.group_number;

-- 완료 메시지
SELECT '점수 동기화가 완료되었습니다!' as message;
SELECT COUNT(*) || '개 조의 점수가 동기화되었습니다.' as sync_info 
FROM group_progress gp 
JOIN groups g ON gp.group_id = g.id 
WHERE gp.total_score = g.score; 