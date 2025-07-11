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
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react';

export default function AdminAuthPage() {
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 페이지 로드 시 기존 세션 확인
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    const sessionData = localStorage.getItem('adminSession');
    if (sessionData) {
      try {
        const { expiry } = JSON.parse(sessionData);
        const now = new Date().getTime();

        if (now < expiry) {
          // 유효한 세션이 있으면 어드민 메인 페이지로 리다이렉트
          router.push('/admin/main');
          return;
        } else {
          // 만료된 세션 제거
          localStorage.removeItem('adminSession');
        }
      } catch {
        localStorage.removeItem('adminSession');
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
      const response = await fetch('/api/auth/admin', {
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
      localStorage.setItem('adminSession', JSON.stringify(result.sessionData));

      // 어드민 메인 페이지로 리다이렉트
      router.push('/admin/main');
    } catch (error) {
      console.error('Admin authentication error:', error);
      setError('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 뒤로가기 버튼 */}
        <div className="flex justify-start">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* 로고 및 제목 */}
        <div className="text-center space-y-4">
          <div className="mx-auto p-4 bg-purple-100 rounded-full w-fit">
            <ShieldCheck className="h-12 w-12 text-purple-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-purple-800">관리자용 앱</h1>
            <p className="text-purple-600">
              관리자 인증 코드를 입력하여 접근하세요
            </p>
          </div>
        </div>

        {/* 인증 폼 */}
        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              관리자 인증 코드 입력
            </CardTitle>
            <CardDescription className="text-purple-600">
              관리자 전용 인증 코드를 입력하세요
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
                <label className="text-sm font-medium text-purple-700">
                  관리자 인증 코드
                </label>
                <Input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="관리자 인증 코드를 입력하세요"
                  className="border-purple-200 focus:border-purple-400 text-center font-mono text-lg"
                  maxLength={20}
                  autoComplete="off"
                />
                <div className="text-xs text-purple-500 text-center">
                  관리자 인증 코드는 담당자에게 문의하세요
                </div>
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
              >
                {loading ? '인증 중...' : '관리자 인증'}
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
                <p className="font-semibold mb-1">관리자 세션 정보</p>
                <ul className="space-y-1 text-xs">
                  <li>• 인증 후 60분 동안 로그인 상태가 유지됩니다</li>
                  <li>• 세션 만료 시 다시 인증해야 합니다</li>
                  <li>• 관리자 권한으로 모든 데이터를 관리할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 관리자 기능 안내 */}
        <Card className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">관리자 기능</p>
                <ul className="space-y-1 text-xs">
                  <li>• 조별 교사 및 학생 추가/삭제</li>
                  <li>• 전체 데이터 관리</li>
                  <li>• 시스템 설정 변경</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
