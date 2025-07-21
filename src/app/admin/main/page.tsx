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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Users,
  RefreshCw,
  AlertCircle,
  Edit,
  Bell,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Group {
  id: number;
  group_number: number;
  name: string;
  score: number;
  created_at: string;
}

interface GroupMember {
  id: number;
  name: string;
  contact: string;
  group_id: number;
  class?: string;
  created_at: string;
}

export default function AdminMainPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = () => {
    // 관리자 인증 확인
    const sessionData = localStorage.getItem('adminSession');
    if (!sessionData) {
      router.push('/admin');
      return;
    }

    try {
      const { expiry } = JSON.parse(sessionData);
      const now = new Date().getTime();

      if (now >= expiry) {
        localStorage.removeItem('adminSession');
        router.push('/admin');
        return;
      }

      loadDashboardData();
    } catch {
      localStorage.removeItem('adminSession');
      router.push('/admin');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // 조 정보 로드
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('group_number');

      if (groupsError) {
        throw groupsError;
      }

      // 조원 정보 로드
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .order('name');

      if (membersError) {
        throw membersError;
      }

      setGroups(groupsData || []);
      setGroupMembers(membersData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStudentCount = (groupId: number) => {
    return groupMembers.filter((member) => member.group_id === groupId).length;
  };

  const menuItems = [
    {
      title: '조 관리',
      description: '조 생성, 수정, 삭제 및 멤버 관리',
      icon: Users,
      href: '/admin/groups',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: '공지사항 관리',
      description: '공지사항 작성, 수정, 삭제',
      icon: Bell,
      href: '/admin/notices',
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-purple-700">관리자 대시보드를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-purple-800">관리자 대시보드</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
            className="text-purple-600 hover:text-purple-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 페이지 제목 */}
        <div className="text-center space-y-2 py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800">
            관리자 대시보드
          </h2>
          <p className="text-purple-600">
            여름성경학교 전체 현황을 관리하고 모니터링하세요
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-800">전체 조</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-700">
                {groups.length}
              </div>
              <p className="text-sm text-purple-600">개</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-800">전체 학생</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-700">
                {groupMembers.length}
              </div>
              <p className="text-sm text-purple-600">명</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-800">평균 조원 수</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-700">
                {groups.length > 0
                  ? (groupMembers.length / groups.length).toFixed(1)
                  : '0'}
              </div>
              <p className="text-sm text-purple-600">명</p>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              관리 기능
            </CardTitle>
            <CardDescription className="text-purple-600">
              아래 메뉴를 선택하여 각 기능을 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-purple-100">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${item.color}`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-purple-800">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="text-purple-600 text-sm">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 조별 현황 요약 */}
        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              조별 현황 요약
            </CardTitle>
            <CardDescription className="text-purple-600">
              각 조의 기본 정보를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border border-purple-200 rounded-lg bg-purple-50/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-800">
                      {group.name}
                    </h4>
                    <Badge variant="outline" className="border-purple-300">
                      {getStudentCount(group.group_number)}명
                    </Badge>
                  </div>
                  <div className="text-sm text-purple-600 space-y-1">
                    <div>점수: {group.score}점</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 시스템 정보 */}
        <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-sm text-emerald-700 space-y-2">
              <p className="font-semibold">💡 관리자 기능 안내</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • 조 관리에서 새로운 조를 생성하고 멤버를 추가/삭제할 수
                  있습니다
                </li>
                <li>
                  • 공지사항 관리에서 모든 사용자에게 표시될 공지를 작성할 수
                  있습니다
                </li>
                <li>• 새로고침 버튼으로 최신 데이터를 불러올 수 있습니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
