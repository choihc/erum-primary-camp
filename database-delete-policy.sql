/**
 * 파일명: database-delete-policy.sql
 * 목적: 이룸체전 관련 테이블 및 뷰 삭제
 * 역할: 기존 스포츠 관련 데이터베이스 구조 제거
 * 작성일: 2024-12-30
 */

-- 이룸체전 관련 테이블 및 뷰 삭제 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 뷰 삭제 (테이블보다 먼저 삭제)
DROP VIEW IF EXISTS sport_status_view;

-- 2. 정책 삭제 (테이블 삭제 전 정책 제거)
DROP POLICY IF EXISTS "Enable read access for all users" ON sport_applications;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sport_applications;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sport_applications;

-- 3. 인덱스 삭제
DROP INDEX IF EXISTS idx_sport_applications_sport;
DROP INDEX IF EXISTS idx_sport_applications_sport_gender;
DROP INDEX IF EXISTS idx_sport_applications_name_class;

-- 4. 테이블 삭제
DROP TABLE IF EXISTS sport_applications;

-- 삭제 완료 메시지
SELECT '이룸체전 관련 테이블 및 뷰가 성공적으로 삭제되었습니다!' as message; 