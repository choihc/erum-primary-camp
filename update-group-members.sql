/**
 * 파일명: update-group-members.sql
 * 목적: 조별 구성원 데이터를 데이터베이스에 업데이트
 * 역할: 기존 구성원 데이터를 삭제하고 새로운 조별 구성원 데이터 삽입
 * 작성일: 2025-01-03
 */

-- 1. 기존 구성원 데이터 삭제
DELETE FROM group_members;

-- 2. 새로운 조별 구성원 데이터 삽입
-- 1조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('김시완', 1),
('임지안', 1),
('박유안', 1),
('유소유', 1),
('박예희', 1),
('김시은', 1),
('박보영', 1);

-- 2조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('김강민', 2),
('김휘연', 2),
('김예율', 2),
('허하은', 2),
('김은율', 2),
('변진솔', 2),
('양서진', 2);

-- 3조 (6명)
INSERT INTO group_members (name, group_id) VALUES
('손하준', 3),
('김지훈', 3),
('정시우', 3),
('최서연', 3),
('한가은', 3),
('이유민', 3);

-- 4조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('박주언', 4),
('신동혁', 4),
('권유하', 4),
('고은우', 4),
('조은성', 4),
('유하린', 4),
('이하엘', 4);

-- 5조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('우지온', 5),
('박이레', 5),
('이준', 5),
('장민하', 5),
('이사랑', 5),
('신윤서', 5),
('이서현', 5);

-- 6조 (6명)
INSERT INTO group_members (name, group_id) VALUES
('오크리스', 6),
('조아인', 6),
('윤준영', 6),
('하민지', 6),
('남지우', 6),
('강수아', 6);

-- 7조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('지승민', 7),
('최도윤', 7),
('양서훈', 7),
('김도언', 7),
('유하은', 7),
('김라희', 7),
('김하진', 7);

-- 8조 (6명)
INSERT INTO group_members (name, group_id) VALUES
('박준후', 8),
('박승우', 8),
('유이룸', 8),
('이시후', 8),
('신하은', 8),
('나연재', 8);

-- 9조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('차은우', 9),
('신이안', 9),
('백하담', 9),
('강예준', 9),
('박승원', 9),
('이서진', 9),
('최래인', 9);

-- 10조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('엄유하', 10),
('한준희', 10),
('이루신', 10),
('이유진', 10),
('김주아', 10),
('이지아', 10),
('강다인', 10);

-- 11조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('박시우', 11),
('노서우', 11),
('주예랑', 11),
('임지섭', 11),
('이수영', 11),
('박서은', 11),
('명라언', 11),
('이은후', 11),
('편주원', 11);

-- 12조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('김정연', 12),
('곽명호', 12),
('장연후', 12),
('이로희', 12),
('김민유', 12),
('김지안', 12),
('박가영', 12),
('안지현', 12),
('조서하', 12);

-- 13조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('임해성', 13),
('홍서휘', 13),
('이선율', 13),
('서재후', 13),
('김건우', 13),
('이진하', 13),
('박사랑', 13),
('이반희', 13),
('민채아', 13);

-- 14조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('원찬영', 14),
('김도헌', 14),
('김루아', 14),
('현유빈', 14),
('문서하', 14),
('주수빈', 14),
('김한별', 14),
('황지인', 14),
('이수빈', 14);

-- 15조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('홍이안', 15),
('이온유', 15),
('최정우', 15),
('신재형', 15),
('변하영', 15),
('조아영', 15),
('김하임', 15),
('박서빈', 15),
('이하율', 15);

-- 16조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('박준후', 16),
('권일우', 16),
('조우빈', 16),
('이소희', 16),
('이온유', 16),
('곽다은', 16),
('김하온', 16),
('이예빈', 16),
('최이룸', 16);

-- 17조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('라하준', 17),
('이윤재', 17),
('정지온', 17),
('안휘준', 17),
('신지유', 17),
('서예은', 17),
('김소윤', 17),
('조이레', 17),
('조이루', 17);

-- 18조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('이하준', 18),
('이하진', 18),
('정하은', 18),
('최서현', 18),
('이채원', 18),
('송리아', 18),
('김조이', 18),
('유은선', 18),
('정한나', 18);

-- 19조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('박건률', 19),
('서민찬', 19),
('김지안', 19),
('김선민', 19),
('한예은', 19),
('신윤서', 19),
('이라율', 19),
('박세미', 19),
('성라희', 19);

-- 20조 (10명)
INSERT INTO group_members (name, group_id) VALUES
('이시우', 20),
('김민찬', 20),
('김진우', 20),
('강시은', 20),
('김하음', 20),
('최아인', 20),
('유진서', 20),
('김유경', 20),
('최효진', 20),
('최예승', 20);

-- 3. 업데이트 완료 확인
SELECT 
    g.group_number,
    g.name as group_name,
    COUNT(gm.id) as student_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.group_number, g.name
ORDER BY g.group_number;

-- 전체 학생 수 확인
SELECT 
    '총 학생 수' as description,
    COUNT(*) as total_students
FROM group_members;

SELECT '조별 구성원 데이터 업데이트가 완료되었습니다!' as message; 