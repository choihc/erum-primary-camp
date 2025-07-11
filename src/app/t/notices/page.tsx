/**
 * 파일명: page.tsx
 * 목적: 교사용 공지사항 페이지
 * 역할: 공지사항 목록을 카드 형태로 표시
 * 작성일: 2024-12-30
 */

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
import { ArrowLeft, Bell, Calendar, User, AlertCircle } from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkSession();
    loadNotices();
  }, []);

  /**
   * checkSession: 세션 유효성 검사
   */
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
    } catch {
      localStorage.removeItem('teacherSession');
      router.push('/t');
    }
  };

  /**
   * loadNotices: 공지사항 목록 로드
   */
  const loadNotices = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/notices');
      if (!response.ok) {
        throw new Error('공지사항을 불러오는 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * formatDate: 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷된 날짜
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-600">공지사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/t/main">
              <Button
                variant="ghost"
                size="sm"
                className="text-sky-600 hover:text-sky-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-sky-800">공지사항</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notice List */}
        <div className="space-y-4">
          {notices.length === 0 ? (
            <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-sky-400 mx-auto mb-4" />
                <p className="text-sky-600 text-lg">
                  등록된 공지사항이 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            notices.map((notice, index) => {
              const isNew = index === 0; // 가장 최신 공지사항만 '최신' 표시
              return (
                <Card
                  key={notice.id}
                  className={`border-sky-200 backdrop-blur-sm transition-all hover:shadow-lg ${
                    isNew ? 'bg-orange-50/90 border-orange-200' : 'bg-white/80'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg text-sky-800">
                            {notice.title}
                          </CardTitle>
                          {isNew && (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                              최신
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center space-x-4 text-sky-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{notice.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(notice.created_at)}</span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sky-800 whitespace-pre-wrap leading-relaxed">
                      {notice.content}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
