/**
 * 파일명: reset-corner-progress.sql
 * 목적: 코너 진행상황 초기화
 * 역할: 모든 조의 코너 진행상황을 처음 상태로 되돌리기
 * 작성일: 2024-01-24
 * 
 * 주의사항: 이 스크립트는 모든 진행상황과 점수를 삭제합니다!
 * 백업을 먼저 수행한 후 실행하세요.
 */

-- 코너 진행상황 초기화 스크립트
-- Supabase SQL Editor에서 실행하세요

-- ===================================================================
-- 선택 1: 완전 초기화 (진행상황 + 모든 점수 삭제)
-- ===================================================================

-- 1-1. 모든 코너별 점수 기록 삭제
DELETE FROM corner_scores;

-- 1-2. 모든 조의 총점을 0으로 초기화
UPDATE groups 
SET score = 0;

-- 1-3. 진행상황을 초기 상태로 재설정
UPDATE group_progress 
SET current_corner_index = 0,
    completed_corners = '{}',
    total_score = 0,
    updated_at = TIMEZONE('utc'::text, NOW());

-- 1-4. group_progress에 없는 그룹이 있다면 추가 (초기 상태로)
INSERT INTO group_progress (group_id, current_corner_index, completed_corners, total_score)
SELECT 
    g.id,
    0,
    '{}',
    0
FROM groups g
WHERE g.id NOT IN (SELECT group_id FROM group_progress WHERE group_id IS NOT NULL);

SELECT '🔄 완전 초기화가 완료되었습니다! 모든 진행상황과 점수가 삭제되었습니다.' as message;

-- ===================================================================
-- 선택 2: 진행상황만 초기화 (점수는 유지)
-- ===================================================================

/*
-- 진행상황만 초기화하고 점수는 유지하려면 아래 코드를 사용하세요
-- (위의 완전 초기화 코드는 주석 처리하고 아래 코드의 주석을 해제)

-- 2-1. 모든 코너별 점수 기록 삭제 (점수 합계는 groups 테이블에 남아있음)
DELETE FROM corner_scores;

-- 2-2. 진행상황만 초기 상태로 재설정 (total_score는 groups.score와 동기화)
UPDATE group_progress 
SET current_corner_index = 0,
    completed_corners = '{}',
    total_score = (SELECT score FROM groups WHERE id = group_progress.group_id),
    updated_at = TIMEZONE('utc'::text, NOW());

-- 2-3. group_progress에 없는 그룹이 있다면 추가
INSERT INTO group_progress (group_id, current_corner_index, completed_corners, total_score)
SELECT 
    g.id,
    0,
    '{}',
    g.score
FROM groups g
WHERE g.id NOT IN (SELECT group_id FROM group_progress WHERE group_id IS NOT NULL);

SELECT '🔄 진행상황 초기화가 완료되었습니다! 총점은 유지되고 진행상황만 초기화되었습니다.' as message;
*/

-- ===================================================================
-- 선택 3: 특정 조만 초기화
-- ===================================================================

/*
-- 특정 조만 초기화하려면 아래 코드를 사용하세요
-- GROUP_NUMBERS_TO_RESET에 초기화할 조 번호들을 입력하세요 (예: 1,2,3)

-- 특정 조의 코너별 점수 기록 삭제
DELETE FROM corner_scores 
WHERE group_id IN (
    SELECT id FROM groups 
    WHERE group_number IN (1,2,3) -- 여기에 초기화할 조 번호 입력
);

-- 특정 조의 총점을 0으로 초기화
UPDATE groups 
SET score = 0
WHERE group_number IN (1,2,3); -- 여기에 초기화할 조 번호 입력

-- 특정 조의 진행상황을 초기 상태로 재설정
UPDATE group_progress 
SET current_corner_index = 0,
    completed_corners = '{}',
    total_score = 0,
    updated_at = TIMEZONE('utc'::text, NOW())
WHERE group_id IN (
    SELECT id FROM groups 
    WHERE group_number IN (1,2,3) -- 여기에 초기화할 조 번호 입력
);

SELECT '🔄 선택된 조의 초기화가 완료되었습니다!' as message;
*/

-- ===================================================================
-- 초기화 결과 확인
-- ===================================================================

-- 초기화 후 상태 확인
SELECT 
    g.group_number as "조 번호",
    g.name as "조 이름",
    g.score as "총점",
    gp.current_corner_index as "현재 코너",
    array_length(gp.completed_corners, 1) as "완료 코너 수",
    gp.total_score as "진행상황 점수",
    CASE 
        WHEN g.score = gp.total_score THEN '✅'
        ELSE '❌ 불일치'
    END as "점수 동기화"
FROM groups g
LEFT JOIN group_progress gp ON g.id = gp.group_id
ORDER BY g.group_number;

-- 전체 통계
SELECT 
    COUNT(*) as "전체 조 수",
    SUM(g.score) as "전체 점수 합계",
    AVG(g.score) as "평균 점수"
FROM groups g;

-- 완료 메시지
SELECT '📊 초기화 결과를 확인해주세요!' as final_message; 