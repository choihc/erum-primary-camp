/**
 * 파일명: update-group-members-2025.sql
 * 목적: 2025년 새로운 조별 구성원 데이터를 데이터베이스에 업데이트
 * 역할: 기존 구성원 데이터를 삭제하고 새로운 조별 구성원 데이터 삽입
 * 작성일: 2025-01-04
 */

-- 1. 기존 구성원 데이터 삭제
DELETE FROM group_members;

-- 2. 새로운 조별 구성원 데이터 삽입
-- 1조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('김시완', 1),
('김시은', 1),
('박보영', 1),
('박예희', 1),
('박유안', 1),
('유소유', 1),
('임지안', 1);

-- 2조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('김강민', 2),
('김예율', 2),
('김은율', 2),
('김휘연', 2),
('변진솔', 2),
('양서진', 2),
('허하은', 2);

-- 3조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('고은우', 3),
('김지훈', 3),
('손하준', 3),
('이준', 3),
('정시우', 3),
('최서연', 3),
('한가은', 3);

-- 4조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('강현우', 4),
('권유하', 4),
('박이레', 4),
('신동혁', 4),
('유하린', 4),
('이하엘', 4),
('조은성', 4);

-- 5조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('김도언', 5),
('박주언', 5),
('신이안', 5),
('우지온', 5),
('이사랑', 5),
('이서현', 5),
('이유민', 5);

-- 6조 (6명)
INSERT INTO group_members (name, group_id) VALUES
('강수아', 6),
('남지우', 6),
('오크리스', 6),
('윤준영', 6),
('조아인', 6),
('하민지', 6);

-- 7조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('김라희', 7),
('김하진', 7),
('양서훈', 7),
('유하은', 7),
('지승민', 7),
('차은우', 7),
('최도윤', 7);

-- 8조 (8명)
INSERT INTO group_members (name, group_id) VALUES
('김하나', 8),
('나연재', 8),
('박승우', 8),
('박준후', 8),
('신하은', 8),
('유이룸', 8),
('이시후', 8),
('최강현', 8);

-- 9조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('강예준', 9),
('박승원', 9),
('백하담', 9),
('신윤서', 9),
('이서진', 9),
('장민하', 9),
('최래인', 9);

-- 10조 (7명)
INSERT INTO group_members (name, group_id) VALUES
('강다인', 10),
('김주아', 10),
('엄유하', 10),
('이루신', 10),
('이유진', 10),
('이지아', 10),
('한준희', 10);

-- 11조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('김서연', 11),
('노서우', 11),
('명라언', 11),
('박서은', 11),
('박시우', 11),
('이수영', 11),
('이은후', 11),
('주예랑', 11),
('편주원', 11);

-- 12조 (10명)
INSERT INTO group_members (name, group_id) VALUES
('곽명호', 12),
('김정연', 12),
('김하온', 12),
('문서하', 12),
('박가영', 12),
('안지현', 12),
('이로희', 12),
('장연후', 12),
('조서하', 12),
('현유빈', 12);

-- 13조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('김건우', 13),
('민채아', 13),
('박사랑', 13),
('서재후', 13),
('이반희', 13),
('이선율', 13),
('이진하', 13),
('임해성', 13),
('홍서휘', 13);

-- 14조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('김도헌', 14),
('김루아', 14),
('김민유', 14),
('김한별', 14),
('문서하', 14),
('현유빈', 14),
('원찬영', 14),
('임지섭', 14),
('주수빈', 14);

-- 15조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('김하임', 15),
('박서빈', 15),
('변하영', 15),
('신재형', 15),
('이온유', 15),
('이하율', 15),
('조아영', 15),
('최정우', 15),
('홍이안', 15);

-- 16조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('곽다은', 16),
('권일우', 16),
('김하온', 16),
('박준후', 16),
('이소희', 16),
('이예빈', 16),
('이온유', 16),
('조우빈', 16),
('최이룸', 16);

-- 17조 (10명)
INSERT INTO group_members (name, group_id) VALUES
('김소윤', 17),
('라하준', 17),
('서예은', 17),
('신지유', 17),
('안휘준', 17),
('이다은', 17),
('이윤재', 17),
('정지온', 17),
('조이레', 17),
('조이루', 17);

-- 18조 (9명)
INSERT INTO group_members (name, group_id) VALUES
('김조이', 18),
('송리아', 18),
('유은선', 18),
('이채원', 18),
('이하준', 18),
('이하진', 18),
('정하은', 18),
('정한나', 18),
('최서현', 18);

-- 19조 (10명)
INSERT INTO group_members (name, group_id) VALUES
('김지안', 19),
('박건률', 19),
('박세미', 19),
('서민찬', 19),
('성라희', 19),
('신윤서', 19),
('이라율', 19),
('황지인', 19),
('이수빈', 19),
('한예은', 19);

-- 20조 (10명)
INSERT INTO group_members (name, group_id) VALUES
('강시은', 20),
('김민찬', 20),
('김유경', 20),
('김진우', 20),
('김하음', 20),
('유진서', 20),
('이시우', 20),
('최아인', 20),
('최예승', 20),
('최효진', 20);

-- 3. 업데이트 완료 메시지
SELECT '조별 구성원 데이터가 성공적으로 업데이트되었습니다!' as message;

-- 4. 업데이트 결과 확인
SELECT 
  g.group_number,
  g.name,
  COUNT(gm.id) as member_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.group_number, g.name
ORDER BY g.group_number; 