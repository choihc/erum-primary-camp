/**
 * 파일명: cornerData.ts
 * 목적: 코너 활동 정보 및 조별 순서 데이터 관리
 * 역할: 코너 활동 관련 데이터를 중앙에서 관리하는 데이터 소스
 * 작성일: 2024-01-24
 */

export interface CornerInfo {
  id: number;
  name: string;
  location: string;
  teachers: string[];
  mainTeacher: string;
  objective?: string;
  method?: string;
}

export interface GroupCornerSequence {
  groupId: number;
  sequence: number[];
}

/**
 * 코너 정보 데이터
 */
export const cornerData: CornerInfo[] = [
  {
    id: 1,
    name: '오직 하나님만',
    location: '브릿지2층 세미나실',
    teachers: ['황유나', '박선영'],
    mainTeacher: '황유나',
    objective: '하나님만을 예배하는 마음을 기르는 활동',
    method: '게임과 활동을 통해 하나님께만 집중하는 시간',
  },
  {
    id: 2,
    name: '말씀을 쌓아요',
    location: '브릿지2층 봉사자휴게실',
    teachers: ['강희구', '박현수'],
    mainTeacher: '강희구',
    objective: '말씀을 마음에 쌓아가는 활동',
    method: '말씀 암송과 쌓기 게임을 통한 학습',
  },
  {
    id: 3,
    name: '예배를 방해하는것을 향해~발사!',
    location: '하늘1층 로비',
    teachers: ['이주은', '정지혜'],
    mainTeacher: '이주은',
    objective: '예배를 방해하는 요소들을 극복하는 활동',
    method: '과녁 맞히기 게임을 통한 집중력 향상',
  },
  {
    id: 4,
    name: '예배를 방해하는것, 날려 날려!',
    location: '하늘1층 드림홀',
    teachers: ['박해영', '이지훈'],
    mainTeacher: '박해영',
    objective: '예배를 방해하는 요소들을 날려보내는 활동',
    method: '풍선 게임과 활동을 통한 집중력 향상',
  },
  {
    id: 5,
    name: '말씀을 잡아요',
    location: '하늘 2층 세미나실',
    teachers: ['박재훈', '장성희'],
    mainTeacher: '박재훈',
    objective: '말씀을 정확히 잡아내는 활동',
    method: '말씀 퀴즈와 게임을 통한 학습',
  },
  {
    id: 6,
    name: '영 더하기 진리는 참된 예배',
    location: '이룸2층 패밀리홀',
    teachers: ['황선희', '김순영'],
    mainTeacher: '황선희',
    objective: '영과 진리로 드리는 참된 예배 학습',
    method: '워크시트와 활동을 통한 예배 학습',
  },
  {
    id: 7,
    name: '떠 올라라, 영과 진리로(외부)',
    location: '브릿지3층 주차장1',
    teachers: ['이경우', '강민준', '김휘연'],
    mainTeacher: '이경우',
    objective: '영과 진리로 마음을 높이는 활동',
    method: '야외 활동과 게임을 통한 체험 학습',
  },
  {
    id: 8,
    name: '말씀, 기도, 찬양, 전도를 내 마음의 중심으로!',
    location: '이룸1층 초등부실',
    teachers: ['박찬희', '이혜원'],
    mainTeacher: '박찬희',
    objective: '예배의 핵심 요소들을 마음에 새기는 활동',
    method: '통합 활동을 통한 종합 학습',
  },
  {
    id: 9,
    name: '하나님만 바라보며 달려갑니다(외부)',
    location: '브릿지3층 주차장2',
    teachers: ['이상혁', '강유준', '이정우'],
    mainTeacher: '이상혁',
    objective: '하나님만을 바라보며 달려가는 신앙 활동',
    method: '야외 달리기와 게임을 통한 체험 학습',
  },
  {
    id: 10,
    name: '예배하러 GoGo(보드게임)',
    location: '이룸2층 새가족교육실',
    teachers: ['김윤희', '최형진'],
    mainTeacher: '김윤희',
    objective: '예배에 대한 이해를 보드게임으로 재미있게 학습',
    method: '보드게임을 통한 예배 학습',
  },
];

/**
 * 각 조별 코너 순서 데이터
 */
export const groupCornerSequences: GroupCornerSequence[] = [
  { groupId: 1, sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { groupId: 2, sequence: [1, 5, 4, 3, 2, 7, 8, 9, 10, 6] },
  { groupId: 3, sequence: [2, 3, 4, 5, 1, 6, 10, 9, 8, 7] },
  { groupId: 4, sequence: [2, 1, 5, 4, 3, 7, 6, 10, 9, 8] },
  { groupId: 5, sequence: [3, 4, 5, 1, 2, 8, 7, 6, 10, 9] },
  { groupId: 6, sequence: [3, 2, 1, 5, 4, 8, 9, 10, 6, 7] },
  { groupId: 7, sequence: [4, 5, 1, 2, 3, 9, 10, 6, 7, 8] },
  { groupId: 8, sequence: [4, 3, 2, 1, 5, 9, 8, 7, 6, 10] },
  { groupId: 9, sequence: [5, 1, 2, 3, 4, 10, 9, 8, 7, 6] },
  { groupId: 10, sequence: [5, 4, 3, 2, 1, 10, 6, 7, 8, 9] },
  { groupId: 11, sequence: [6, 7, 8, 9, 10, 1, 2, 3, 4, 5] },
  { groupId: 12, sequence: [6, 10, 9, 8, 7, 2, 3, 4, 5, 1] },
  { groupId: 13, sequence: [7, 8, 9, 10, 6, 1, 5, 4, 3, 2] },
  { groupId: 14, sequence: [7, 6, 10, 9, 8, 2, 1, 5, 4, 3] },
  { groupId: 15, sequence: [8, 9, 10, 6, 7, 3, 2, 1, 5, 4] },
  { groupId: 16, sequence: [8, 7, 6, 10, 9, 3, 4, 5, 1, 2] },
  { groupId: 17, sequence: [9, 10, 6, 7, 8, 4, 5, 1, 2, 3] },
  { groupId: 18, sequence: [9, 8, 7, 6, 10, 4, 3, 2, 1, 5] },
  { groupId: 19, sequence: [10, 6, 7, 8, 9, 5, 4, 3, 2, 1] },
  { groupId: 20, sequence: [10, 9, 8, 7, 6, 5, 1, 2, 3, 4] },
];

/**
 * getCornerById: 코너 ID로 코너 정보 조회
 * @param {number} id - 코너 ID
 * @returns {CornerInfo | undefined} 코너 정보
 */
export const getCornerById = (id: number): CornerInfo | undefined => {
  return cornerData.find((corner) => corner.id === id);
};

/**
 * getGroupSequence: 조 ID로 코너 순서 조회
 * @param {number} groupId - 조 ID
 * @returns {number[]} 코너 순서 배열
 */
export const getGroupSequence = (groupId: number): number[] => {
  const group = groupCornerSequences.find((g) => g.groupId === groupId);
  return group ? group.sequence : [];
};

/**
 * getCurrentCornerIndex: 현재 진행 중인 코너 인덱스 조회 (임시 구현)
 * @param {number} groupId - 조 ID
 * @returns {number} 현재 코너 인덱스
 */
export const getCurrentCornerIndex = (groupId: number): number => {
  // 실제로는 데이터베이스에서 조회해야 함
  // TODO: 데이터베이스 연동 시 groupId를 사용하여 실제 진행 상황 조회
  console.log(`Getting corner index for group ${groupId}`);
  return 0; // 임시로 첫 번째 코너로 설정
};

/**
 * getNextCornerInfo: 다음 코너 정보 조회
 * @param {number} groupId - 조 ID
 * @param {number} currentIndex - 현재 코너 인덱스
 * @returns {CornerInfo | null} 다음 코너 정보
 */
export const getNextCornerInfo = (
  groupId: number,
  currentIndex: number
): CornerInfo | null => {
  const sequence = getGroupSequence(groupId);
  if (currentIndex + 1 < sequence.length) {
    const nextCornerId = sequence[currentIndex + 1];
    return getCornerById(nextCornerId) || null;
  }
  return null;
};

/**
 * 점수 타입 정의
 */
export interface ScoreType {
  win: number;
  lose: number;
  draw: number;
  bonusMax: number;
}

/**
 * 점수 설정
 */
export const scoreSettings: ScoreType = {
  win: 40,
  lose: 10,
  draw: 30,
  bonusMax: 5,
};
