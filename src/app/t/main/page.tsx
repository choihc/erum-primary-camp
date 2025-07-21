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
import { Badge } from '@/components/ui/badge';
import {
  LogOut,
  Users,
  BarChart3,
  Edit,
  Clock,
  Shield,
  Bell,
  AlertCircle,
  Target,
  Route,
} from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export default function TeacherMainPage() {
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [hasNewNotice, setHasNewNotice] = useState(false);
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    checkNewNotices();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('teacherSession');
    if (!sessionData) {
      router.push('/t');
      return;
    }

    try {
      const { expiry } = JSON.parse(sessionData);
      const now = new Date().getTime();

      if (now >= expiry) {
        localStorage.removeItem('teacherSession');
        router.push('/t');
        return;
      }

      // 초기 잔여 시간 설정
      updateRemainingTime();
    } catch {
      localStorage.removeItem('teacherSession');
      router.push('/t');
    }
  };

  const updateRemainingTime = () => {
    const sessionData = localStorage.getItem('teacherSession');
    if (!sessionData) {
      router.push('/t');
      return;
    }

    try {
      const { expiry } = JSON.parse(sessionData);
      const now = new Date().getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        localStorage.removeItem('teacherSession');
        router.push('/t');
        return;
      }

      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } catch {
      localStorage.removeItem('teacherSession');
      router.push('/t');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherSession');
    router.push('/t');
  };

  /**
   * checkNewNotices: 최근 30분 내 새 공지사항 확인
   */
  const checkNewNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (!response.ok) {
        return;
      }

      const notices = await response.json();
      if (notices.length === 0) {
        return;
      }

      // 가장 최신 공지사항 확인
      const latest = notices[0];
      const noticeDate = new Date(latest.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - noticeDate.getTime()) / (1000 * 60);

      // 24시간 이내에 등록된 공지사항이 있는지 확인
      if (diffMinutes <= 1440) {
        setHasNewNotice(true);
        setLatestNotice(latest);
      }
    } catch (error) {
      console.error('공지사항 확인 오류:', error);
    }
  };

  const menuItems = [
    {
      title: '공지사항',
      description: '중요한 공지사항을 확인하세요',
      icon: Bell,
      href: '/t/notices',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      title: '코너 활동 소개',
      description: '각 코너별 활동 정보 및 담당교사 확인',
      icon: Target,
      href: '/t/corners',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: '코너 네비게이션',
      description: '조별 코너 진행 상황 및 점수 입력',
      icon: Route,
      href: '/t/corner-navigation',
      color: 'bg-teal-500 hover:bg-teal-600',
    },
    {
      title: '조별 정보확인',
      description: '각 조별 구성원 및 담당교사 정보',
      icon: Users,
      href: '/t/groups',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: '점수 현황',
      description: '조별 점수 현황을 그래프로 확인',
      icon: BarChart3,
      href: '/t/status',
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      title: '점수 입력',
      description: '각 조에 점수를 추가하고 관리',
      icon: Edit,
      href: '/t/scores',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-sky-600" />
            <h1 className="text-xl font-bold text-sky-800">교사용</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* 세션 시간 */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-sky-600" />
              <Badge variant="outline" className="border-sky-300 text-sky-700">
                {remainingTime || '확인 중...'}
              </Badge>
            </div>

            {/* 로그아웃 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-sky-600 hover:text-sky-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 새 공지사항 알림 배너 */}
      {hasNewNotice && latestNotice && (
        <div className="bg-orange-500 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-white flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">새로운 공지사항이 있습니다!</p>
                  <p className="text-sm text-orange-100 truncate">
                    {latestNotice.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/t/notices">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-orange-50"
                  >
                    확인하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Menu Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow border-sky-200 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 p-3 bg-sky-100 rounded-full w-fit">
                  <item.icon className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-lg text-sky-800">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sky-600 text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link href={item.href}>
                  <Button className={`w-full text-white ${item.color}`}>
                    바로가기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Session Info */}
        <Card className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-amber-800 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                세션 정보
              </h4>
              <p className="text-sm text-amber-700">
                현재 세션 잔여 시간: <strong>{remainingTime}</strong>
              </p>
              <p className="text-xs text-amber-600">
                세션이 만료되면 자동으로 로그아웃됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
