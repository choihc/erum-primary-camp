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
  ArrowLeft,
  Users,
  UserPlus,
  Shield,
  LogOut,
  Database,
  Bell,
} from 'lucide-react';

interface Group {
  id: number;
  name: string;
  teacher: string;
  leader: string;
  score: number;
  group_number: number;
}

interface GroupMember {
  id: number;
  name: string;
  role: 'teacher' | 'student';
  contact?: string;
  group_id: number;
  class?: string;
}

export default function AdminMainPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
    loadData();
  }, []);

  const checkAuthentication = () => {
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
    } catch {
      localStorage.removeItem('adminSession');
      router.push('/admin');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // 그룹 데이터 로드
      const groupsResponse = await fetch('/api/groups');
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();

        // 조 이름의 숫자 기준으로 정렬 (1조, 2조, 3조... 순서)
        const sortedGroups = groupsData.sort((a: Group, b: Group) => {
          const getNumber = (name: string) => {
            const match = name.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          return getNumber(a.name) - getNumber(b.name);
        });

        setGroups(sortedGroups);
      }

      // 그룹 멤버 데이터 로드
      const membersResponse = await fetch('/api/group-members');
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setGroupMembers(membersData);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin');
  };

  const getGroupMembers = (groupId: number) => {
    return groupMembers.filter((member) => member.group_id === groupId);
  };

  const getTeacherCount = (groupId: number) => {
    return getGroupMembers(groupId).filter(
      (member) => member.role === 'teacher'
    ).length;
  };

  const getStudentCount = (groupId: number) => {
    return getGroupMembers(groupId).filter(
      (member) => member.role === 'student'
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-purple-800">
                관리자 대시보드
              </h1>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-purple-600 border-purple-300 hover:bg-purple-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50/80">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-800">
                    {groups.length}
                  </p>
                  <p className="text-blue-600 text-sm">전체 조</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/80">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-800">
                    {groupMembers.filter((m) => m.role === 'teacher').length}
                  </p>
                  <p className="text-green-600 text-sm">전체 교사</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/80">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-800">
                    {groupMembers.filter((m) => m.role === 'student').length}
                  </p>
                  <p className="text-orange-600 text-sm">전체 학생</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/80">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-800">
                    {groupMembers.length}
                  </p>
                  <p className="text-purple-600 text-sm">전체 인원</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/notices">
            <Card className="border-orange-200 bg-white/80 hover:bg-white/90 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  공지사항 등록
                </CardTitle>
                <CardDescription>
                  교사들에게 전달할 공지사항을 작성하고 관리합니다
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/groups">
            <Card className="border-purple-200 bg-white/80 hover:bg-white/90 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center">
                  <Users className="h-5 w-5 mr-2" />조 관리
                </CardTitle>
                <CardDescription>
                  조별 교사와 학생을 추가, 수정, 삭제할 수 있습니다
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card
            className="border-blue-200 bg-white/80 hover:bg-white/90 transition-colors cursor-pointer"
            onClick={async () => {
              try {
                const response = await fetch('/api/test-connection');
                const result = await response.json();
                if (result.success) {
                  alert(
                    '✅ 데이터베이스 연결 성공!\n' +
                      JSON.stringify(result.data, null, 2)
                  );
                } else {
                  alert('❌ 데이터베이스 연결 실패:\n' + result.error);
                }
              } catch (error) {
                alert('❌ 연결 테스트 실패:\n' + error);
              }
            }}
          >
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                연결 테스트
              </CardTitle>
              <CardDescription>
                데이터베이스 연결 상태를 확인합니다
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 조별 현황 */}
        <Card className="border-gray-200 bg-white/80">
          <CardHeader>
            <CardTitle className="text-gray-800">조별 현황</CardTitle>
            <CardDescription>
              각 조의 교사 및 학생 현황을 확인할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups
                .filter((group) => group.group_number <= 20)
                .map((group) => {
                  return (
                    <Card key={group.id} className="border-gray-100">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-gray-800">
                            {group.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-300"
                          >
                            {group.score}점
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">조장:</span>{' '}
                            {group.leader}
                          </p>
                          <div className="flex justify-between">
                            <span className="text-green-600">
                              교사: {getTeacherCount(group.group_number)}명
                            </span>
                            <span className="text-blue-600">
                              학생: {getStudentCount(group.group_number)}명
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
