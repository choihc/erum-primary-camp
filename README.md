# 이룸교회 초등부 여름성경학교 웹앱

이룸교회 초등부 여름성경학교를 위한 웹 애플리케이션입니다. 학생용과 교사용 앱으로 구분되어 각각의 필요에 맞는 기능을 제공합니다.

## 🌟 주요 기능

### 학생용 앱 (`/s`)

- **여름성경학교 신청하기**: 여름성경학교 참가 신청 (구글 폼)
- **여름성경학교 정보**: 여름성경학교 관련 중요 정보 안내
- **여름성경학교 준비물**: 여름성경학교를 즐겁게 보내는 팁 공유
- **여름성경학교 사진보기**: 여름성경학교 사진 확인

### 교사용 앱 (`/t`)

- **인증 시스템**: 4자리 숫자+알파벳 코드로 30분 세션 관리
- **조별 정보확인**: 각 조별 구성원 및 담당교사 정보 (20개 조)
- **조 현황**: 조별 점수 현황 그래프
- **점수 입력**: 조별 점수 추가 및 관리
- **학생 정보열람**: 학생 검색 및 상세 정보

## 🚀 기술 스택

- **프론트엔드**: Next.js 15, React 18, TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui
- **데이터베이스**: Supabase
- **아이콘**: Lucide React
- **차트**: Chart.js (예정)
- **PWA**: next-pwa (모바일 앱 설치 지원)

## 📦 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone [repository-url]
cd erum-summer
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Teacher Auth Code (4자리 숫자 + 알파벳)
TEACHER_AUTH_CODE=2024A
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 앱을 확인하세요.

### 5. 필요한 이미지 파일 추가

PWA와 OG 태그를 위해 다음 이미지 파일들을 `public/` 폴더에 추가해야 합니다:

#### PWA 아이콘 (필수)

- `icon-192x192.png` - 192x192 PWA 아이콘
- `icon-512x512.png` - 512x512 PWA 아이콘

#### Favicon (필수)

- `favicon.ico` - 기본 파비콘
- `favicon-16x16.png` - 16x16 파비콘
- `favicon-32x32.png` - 32x32 파비콘

#### OG 태그 이미지 (필수)

- `og-image.jpg` - 1200x630 여름성경학교 이미지 (소셜 미디어 공유용)

#### 기타 (선택사항)

- `mstile-150x150.png` - Windows 타일 아이콘
- `safari-pinned-tab.svg` - Safari 고정 탭 아이콘

> **중요**: 위 이미지들은 여름성경학교 테마에 맞게 제작해야 합니다. 특히 `og-image.jpg`는 소셜 미디어에서 링크 공유 시 표시되는 이미지입니다.

## 🗄️ 데이터베이스 스키마

Supabase에서 다음 테이블들을 생성해야 합니다:

### 1. groups (조 정보)

```sql
CREATE TABLE groups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_number INTEGER NOT NULL UNIQUE CHECK (group_number >= 1 AND group_number <= 20),
  name VARCHAR(20) NOT NULL UNIQUE,
  teacher VARCHAR(50) NOT NULL,
  leader VARCHAR(50),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 2. group_members (조원 정보)

```sql
CREATE TABLE group_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'teacher')),
  contact VARCHAR(20),
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  class VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_name ON group_members(name);
```

### 3. students (학생 정보 - 조원 정보와 별도로 관리)

```sql
CREATE TABLE students (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(50) NOT NULL,
  class VARCHAR(10) NOT NULL,
  group_id BIGINT REFERENCES groups(id),
  contact VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name, class)
);

-- 인덱스 생성
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_group_id ON students(group_id);
```

### 4. notices (공지사항)

```sql
CREATE TABLE notices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## 🏆 조 구성

- **총 20개 조**: 1조부터 20조까지 구성
- **각 조 구성**: 담당 선생님, 조장(리더), 조원 학생들
- **점수 시스템**: 각 조별 점수 관리 및 순위 확인

## 🔐 교사 인증

기본 인증 코드: `2024A`

교사용 앱 접근 시 인증 코드를 입력하면 30분간 세션이 유지됩니다.

## 🎨 디자인

- **컬러 테마**: 밝은 파란색(하늘색) 계열
- **UI 컴포넌트**: shadcn/ui 기반
- **반응형 디자인**: 모바일 우선 설계
- **사용자 경험**: 초등학생 대상으로 직관적이고 간결한 UI

## 📱 사용 방법

### 학생용 앱

1. 메인 페이지에서 "학생, 학부모 시작하기" 클릭
2. 원하는 메뉴 선택
3. 여름성경학교 신청 시: 구글 폼을 통해 신청

### 교사용 앱

1. 메인 페이지에서 "교사 시작하기" 클릭
2. 인증 코드 입력 (기본값: 2024A)
3. 조별 정보 확인, 점수 입력 등의 기능 이용

## 📊 관리 기능

- **조별 관리**: 20개 조의 구성원 및 담당교사 관리
- **점수 시스템**: 조별 점수 입력 및 순위 확인
- **학생 정보**: 학생 검색 및 상세 정보 관리
- **공지사항**: 여름성경학교 관련 공지사항 관리

## 🎯 주요 특징

- **20개 조 시스템**: 체계적인 조 관리
- **실시간 점수 확인**: 조별 점수 현황 실시간 업데이트
- **모바일 최적화**: 스마트폰에서 사용하기 편리한 UI
- **PWA 지원**: 모바일 앱처럼 설치 가능
- **보안 인증**: 교사용 기능 보안 접근 제어

## 📈 버전 정보

- **v1.0**: 초기 여름성경학교 웹앱 구축
- **v2.0**: 이룸체전 시스템 제거, 20개 조 구성으로 변경

## 🤝 기여하기

이 프로젝트는 이룸교회 초등부 여름성경학교를 위한 전용 웹앱입니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
