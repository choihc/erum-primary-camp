/**
 * 파일명: backup-corner-progress.sql
 * 목적: 코너 진행상황 백업
 * 역할: 초기화 전 현재 상태를 백업 테이블에 저장
 * 작성일: 2024-01-24
 */

-- 코너 진행상황 백업 스크립트
-- 초기화 실행 전에 먼저 이 스크립트를 실행하여 백업하세요
-- Supabase SQL Editor에서 실행하세요

-- ===================================================================
-- 백업 테이블 생성
-- ===================================================================

-- 1. 현재 시간을 포함한 백업 테이블명 생성을 위한 함수
DO $$
DECLARE
    backup_timestamp TEXT := TO_CHAR(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
BEGIN
    -- groups 테이블 백업
    EXECUTE FORMAT('CREATE TABLE groups_backup_%s AS SELECT * FROM groups', backup_timestamp);
    
    -- group_progress 테이블 백업
    EXECUTE FORMAT('CREATE TABLE group_progress_backup_%s AS SELECT * FROM group_progress', backup_timestamp);
    
    -- corner_scores 테이블 백업
    EXECUTE FORMAT('CREATE TABLE corner_scores_backup_%s AS SELECT * FROM corner_scores', backup_timestamp);
    
    RAISE NOTICE '백업이 완료되었습니다. 백업 테이블: groups_backup_%, group_progress_backup_%, corner_scores_backup_%', 
                 backup_timestamp, backup_timestamp, backup_timestamp;
END $$;

-- ===================================================================
-- 현재 상태 리포트 생성
-- ===================================================================

-- 백업 시점의 전체 현황
SELECT 
    '=== 백업 시점 현황 (생성일: ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS') || ') ===' as report_header;

-- 조별 현황
SELECT 
    g.group_number as "조 번호",
    g.name as "조 이름",
    g.score as "총점",
    gp.current_corner_index as "현재 코너 인덱스",
    array_length(gp.completed_corners, 1) as "완료된 코너 수",
    gp.completed_corners as "완료된 코너 목록",
    gp.total_score as "진행상황 점수",
    gp.updated_at as "마지막 업데이트"
FROM groups g
LEFT JOIN group_progress gp ON g.id = gp.group_id
ORDER BY g.group_number;

-- 코너별 점수 현황
SELECT 
    g.group_number as "조 번호",
    cs.corner_id as "코너 ID",
    cs.score as "총 점수",
    cs.base_score as "기본 점수",
    cs.bonus_score as "보너스 점수",
    cs.score_type as "결과 타입",
    cs.recorded_at as "기록 시간"
FROM corner_scores cs
JOIN groups g ON cs.group_id = g.id
ORDER BY g.group_number, cs.corner_id;

-- 전체 통계
SELECT 
    COUNT(*) as "전체 조 수",
    SUM(score) as "전체 점수 합계",
    AVG(score) as "평균 점수",
    MAX(score) as "최고 점수",
    MIN(score) as "최저 점수"
FROM groups;

SELECT 
    COUNT(*) as "총 코너 점수 기록 수",
    COUNT(DISTINCT group_id) as "점수를 받은 조 수",
    COUNT(DISTINCT corner_id) as "진행된 코너 수"
FROM corner_scores;

-- 백업 완료 메시지
SELECT '✅ 백업이 완료되었습니다! 이제 안전하게 초기화를 진행할 수 있습니다.' as backup_complete;

-- ===================================================================
-- 백업 확인 쿼리
-- ===================================================================

-- 생성된 백업 테이블 목록 확인
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'groups_backup_%' THEN 'Groups 백업'
        WHEN table_name LIKE 'group_progress_backup_%' THEN 'Progress 백업'
        WHEN table_name LIKE 'corner_scores_backup_%' THEN 'Scores 백업'
    END as backup_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%_backup_%')
ORDER BY table_name DESC
LIMIT 10; 