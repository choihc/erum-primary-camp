'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  Users,
} from 'lucide-react';

export default function TeacherAuthPage() {
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 페이지 로드 시 기존 세션 확인
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    const sessionData = localStorage.getItem('teacherSession');
    if (sessionData) {
      try {
        const { expiry } = JSON.parse(sessionData);
        const now = new Date().getTime();

        if (now < expiry) {
          // 유효한 세션이 있으면 메인 페이지로 리다이렉트
          router.push('/t/main');
          return;
        } else {
          // 만료된 세션 제거
          localStorage.removeItem('teacherSession');
        }
      } catch {
        localStorage.removeItem('teacherSession');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authCode.trim()) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 서버 API를 통한 인증 코드 검증
      const response = await fetch('/api/auth/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authCode: authCode,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || '인증에 실패했습니다.');
        return;
      }

      // 서버에서 받은 세션 데이터를 로컬스토리지에 저장
      localStorage.setItem(
        'teacherSession',
        JSON.stringify(result.sessionData)
      );

      // 메인 페이지로 리다이렉트
      router.push('/t/main');
    } catch (error) {
      console.error('Authentication error:', error);
      setError('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 뒤로가기 버튼 */}
        <div className="flex justify-start">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>

        {/* 로고 및 제목 */}
        <div className="text-center space-y-4">
          <div className="mx-auto p-4 bg-sky-100 rounded-full w-fit">
            <Shield className="h-12 w-12 text-sky-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-sky-800">교사용</h1>
            <p className="text-sky-600">인증 코드를 입력하여 접근하세요</p>
          </div>
        </div>

        {/* 인증 폼 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              인증 코드 입력
            </CardTitle>
            <CardDescription className="text-sky-600">
              4자리 숫자 + 알파벳 두글자 형태의 인증 코드를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 에러 메시지 */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* 인증 코드 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-sky-700">
                  인증 코드
                </label>
                <Input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="예: 2025ab"
                  className="border-sky-200 focus:border-sky-400 text-center font-mono text-lg"
                  maxLength={10}
                  autoComplete="off"
                />
                <div className="text-xs text-sky-500 text-center">
                  인증 코드는 담당 교사에게 문의하세요
                </div>
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                disabled={loading}
              >
                {loading ? '인증 중...' : '인증하기'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 세션 정보 */}
        <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-emerald-700">
                <p className="font-semibold mb-1">세션 정보</p>
                <ul className="space-y-1 text-xs">
                  <li>• 인증 후 7일 동안 로그인 상태가 유지됩니다</li>
                  <li>• 세션 만료 시 다시 인증해야 합니다</li>
                  <li>• 브라우저를 닫으면 세션이 종료됩니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 기능 미리보기 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center text-lg">
              <Users className="h-5 w-5 mr-2" />
              이용 가능한 기능
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium text-sky-700">📊 조별 정보확인</p>
                <p className="text-xs text-sky-600">각 조별 구성원 정보</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sky-700">📈 조 현황</p>
                <p className="text-xs text-sky-600">조별 점수 현황</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sky-700">✏️ 점수 입력</p>
                <p className="text-xs text-sky-600">조별 점수 관리</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sky-700">🔍 학생 정보열람</p>
                <p className="text-xs text-sky-600">학생 검색 및 정보</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
