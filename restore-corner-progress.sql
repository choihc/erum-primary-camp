/**
 * 파일명: restore-corner-progress.sql
 * 목적: 백업에서 코너 진행상황 복원
 * 역할: 백업 테이블에서 데이터를 복원하여 이전 상태로 되돌리기
 * 작성일: 2024-01-24
 * 
 * 사용법: 
 * 1. 아래에서 BACKUP_TIMESTAMP를 백업 시 생성된 타임스탬프로 변경
 * 2. 복원할 백업 테이블명을 확인한 후 실행
 */

-- 백업에서 복원하는 스크립트
-- Supabase SQL Editor에서 실행하세요

-- ===================================================================
-- 설정: 복원할 백업 타임스탬프 지정
-- ===================================================================

-- ⚠️ 아래 BACKUP_TIMESTAMP를 실제 백업 테이블의 타임스탬프로 변경하세요
-- 예: '2024_01_24_14_30_25'
DO $$
DECLARE
    BACKUP_TIMESTAMP TEXT := '2024_01_24_14_30_25'; -- 여기에 실제 백업 타임스탬프 입력
    
    backup_groups_table TEXT;
    backup_progress_table TEXT;
    backup_scores_table TEXT;
    
    table_exists BOOLEAN;
BEGIN
    -- 백업 테이블명 구성
    backup_groups_table := 'groups_backup_' || BACKUP_TIMESTAMP;
    backup_progress_table := 'group_progress_backup_' || BACKUP_TIMESTAMP;
    backup_scores_table := 'corner_scores_backup_' || BACKUP_TIMESTAMP;
    
    -- 백업 테이블 존재 여부 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = backup_groups_table
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION '백업 테이블 %가 존재하지 않습니다. 타임스탬프를 확인해주세요.', backup_groups_table;
    END IF;
    
    RAISE NOTICE '복원을 시작합니다. 백업 테이블: %', BACKUP_TIMESTAMP;
    
    -- ===================================================================
    -- 현재 데이터 삭제
    -- ===================================================================
    
    -- 현재 데이터 삭제 (FK 제약조건 순서대로)
    DELETE FROM corner_scores;
    DELETE FROM group_progress;
    -- groups 테이블은 삭제하지 않고 업데이트만 함 (FK 참조 때문에)
    
    RAISE NOTICE '기존 데이터 삭제 완료';
    
    -- ===================================================================
    -- 백업에서 데이터 복원
    -- ===================================================================
    
    -- 1. groups 테이블 복원 (score 필드만 업데이트)
    EXECUTE FORMAT('
        UPDATE groups 
        SET score = backup.score
        FROM %I backup 
        WHERE groups.id = backup.id
    ', backup_groups_table);
    
    RAISE NOTICE 'Groups 테이블 점수 복원 완료';
    
    -- 2. group_progress 테이블 복원
    EXECUTE FORMAT('
        INSERT INTO group_progress 
        SELECT * FROM %I
    ', backup_progress_table);
    
    RAISE NOTICE 'Group_progress 테이블 복원 완료';
    
    -- 3. corner_scores 테이블 복원
    EXECUTE FORMAT('
        INSERT INTO corner_scores 
        SELECT * FROM %I
    ', backup_scores_table);
    
    RAISE NOTICE 'Corner_scores 테이블 복원 완료';
    
    RAISE NOTICE '✅ 모든 데이터 복원이 완료되었습니다!';
    
END $$;

-- ===================================================================
-- 복원 결과 확인
-- ===================================================================

-- 복원 후 상태 확인
SELECT 
    '=== 복원 후 현황 (확인일: ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS') || ') ===' as report_header;

-- 조별 현황
SELECT 
    g.group_number as "조 번호",
    g.name as "조 이름",
    g.score as "총점",
    gp.current_corner_index as "현재 코너 인덱스",
    array_length(gp.completed_corners, 1) as "완료된 코너 수",
    gp.total_score as "진행상황 점수",
    CASE 
        WHEN g.score = gp.total_score THEN '✅ 동기화됨'
        ELSE '❌ 불일치'
    END as "점수 동기화 상태"
FROM groups g
LEFT JOIN group_progress gp ON g.id = gp.group_id
ORDER BY g.group_number;

-- 전체 통계
SELECT 
    COUNT(*) as "전체 조 수",
    SUM(score) as "전체 점수 합계",
    AVG(score) as "평균 점수"
FROM groups;

SELECT 
    COUNT(*) as "복원된 코너 점수 기록 수",
    COUNT(DISTINCT group_id) as "점수를 받은 조 수",
    COUNT(DISTINCT corner_id) as "진행된 코너 수"
FROM corner_scores;

-- 복원 완료 메시지
SELECT '🎉 데이터 복원이 성공적으로 완료되었습니다!' as restore_complete;

-- ===================================================================
-- 백업 테이블 목록 (참조용)
-- ===================================================================

-- 사용 가능한 백업 테이블 목록
SELECT 
    '=== 사용 가능한 백업 테이블 목록 ===' as backup_list_header;

SELECT 
    SUBSTRING(table_name FROM '.*_backup_(.*)') as "백업 타임스탬프",
    table_name as "테이블명",
    CASE 
        WHEN table_name LIKE 'groups_backup_%' THEN 'Groups 백업'
        WHEN table_name LIKE 'group_progress_backup_%' THEN 'Progress 백업'
        WHEN table_name LIKE 'corner_scores_backup_%' THEN 'Scores 백업'
    END as "백업 종류"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_backup_%'
ORDER BY table_name DESC; 