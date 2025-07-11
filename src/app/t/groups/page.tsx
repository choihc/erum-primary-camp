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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Crown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { supabase, Group, GroupMember } from '@/lib/supabase';
import { PhoneLink } from '@/components/ui/phone-link';

interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(
    null
  );
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = () => {
    // 교사 인증 확인
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

      loadGroups();
    } catch {
      localStorage.removeItem('teacherSession');
      router.push('/t');
    }
  };

  const loadGroups = async () => {
    setLoading(true);
    setError('');

    try {
      // 조 정보와 조원 정보를 함께 조회
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .gte('group_number', 1)
        .lte('group_number', 20);

      if (groupsError) {
        throw groupsError;
      }

      // 자연 정렬로 조 이름 순서 정렬
      const sortedGroupsData = (groupsData || []).sort((a, b) =>
        a.name.localeCompare(b.name, 'ko', {
          numeric: true,
          sensitivity: 'base',
        })
      );

      // 각 조의 조원 정보 조회
      const groupsWithMembers: GroupWithMembers[] = [];

      for (const group of sortedGroupsData) {
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.group_number)
          .order('role', { ascending: false }) // 교사 먼저 (teacher > student)
          .order('name', { ascending: true }); // 그 다음 이름순

        if (membersError) {
          console.error(
            'Error loading members for group:',
            group.name,
            membersError
          );
          continue;
        }

        groupsWithMembers.push({
          ...group,
          members: membersData || [],
        });
      }

      setGroups(groupsWithMembers);
    } catch (error) {
      console.error('Error loading groups:', error);
      setError('조 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: 'student' | 'teacher') => {
    if (role === 'teacher') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-2">
          <GraduationCap className="h-3 w-3 mr-1" />
          교사
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-sky-300 text-sky-700 ml-2">
        학생
      </Badge>
    );
  };

  const getLeaderBadge = (memberName: string, leaderName: string) => {
    if (memberName === leaderName) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 ml-2">
          <Crown className="h-3 w-3 mr-1" />
          조장
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
            <p className="text-sky-700">조 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/t/main">
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-sky-800">조별 정보확인</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadGroups}
            disabled={loading}
            className="text-sky-600 hover:text-sky-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 전체 현황 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              전체 조 현황
            </CardTitle>
            <CardDescription className="text-sky-600">
              총 {groups.length}개 조,{' '}
              {groups.reduce((sum, group) => sum + group.members.length, 0)}명
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 조 목록 */}
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="cursor-pointer transition-all border-sky-200 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105"
              onClick={() => {
                setSelectedGroup(group);
                setIsModalOpen(true);
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sky-800">{group.name}</CardTitle>{' '}
                  <Badge
                    variant="outline"
                    className="border-sky-300 text-sky-700"
                  >
                    {group.members.length}명
                  </Badge>
                </div>
                <CardDescription className="text-sky-600">
                  담당교사: {group.teacher} | 조장: {group.leader}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sky-600">현재 점수</span>
                  <span className="font-semibold text-sky-800">
                    {group.score}점
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 조 상세 정보 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedGroup && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-sky-800 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {selectedGroup.name} 상세 정보
                  </DialogTitle>
                  <DialogDescription className="text-sky-600">
                    담당교사: {selectedGroup.teacher} | 조장:{' '}
                    {selectedGroup.leader} | 현재 점수: {selectedGroup.score}점
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-sky-800">
                      조원 목록
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-sky-300 text-sky-700"
                    >
                      총 {selectedGroup.members.length}명
                    </Badge>
                  </div>

                  {selectedGroup.members.length === 0 ? (
                    <div className="text-center py-8 text-sky-600">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>조원 정보가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedGroup.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-sky-50/50 rounded-lg border border-sky-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-sky-800">
                                  {member.name}
                                </span>
                                {getRoleBadge(member.role)}
                                {getLeaderBadge(
                                  member.name,
                                  selectedGroup.leader
                                )}
                              </div>
                              {member.class && (
                                <span className="text-sm text-sky-600">
                                  {member.class}
                                </span>
                              )}
                            </div>
                          </div>

                          {member.contact && (
                            <div className="flex items-center text-sm text-sky-600">
                              <PhoneLink
                                phoneNumber={member.contact}
                                showIcon
                                className="text-sky-600 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* 안내사항 */}
        <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-sm text-emerald-700 space-y-2">
              <p className="font-semibold">💡 사용 안내</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • 조 카드를 클릭하면 모달창에서 상세 구성원 정보를 확인할 수
                  있습니다
                </li>
                <li>• 교사와 조장은 별도 배지로 표시됩니다</li>
                <li>• 연락처가 등록된 구성원의 경우 전화번호가 표시됩니다</li>
                <li>• 새로고침 버튼으로 최신 정보를 불러올 수 있습니다</li>
                <li>• 모달창은 ESC 키나 바깥 영역 클릭으로 닫을 수 있습니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
