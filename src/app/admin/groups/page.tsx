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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { CLASSES } from '@/lib/supabase';
import { PhoneLink } from '@/components/ui/phone-link';

interface Group {
  id: number;
  name: string;
  teacher: string;
  leader: string;
  score: number;
}

interface GroupMember {
  id: number;
  name: string;
  role: 'teacher' | 'student';
  contact?: string;
  group_id: number;
  class?: string;
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  // 새 멤버 추가 폼
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'student' as 'teacher' | 'student',
    contact: '',
    class: '',
  });

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

      const [groupsResponse, membersResponse] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/group-members'),
      ]);

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

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  const handleAddMember = async () => {
    if (
      !newMember.name ||
      !selectedGroup ||
      !newMember.contact ||
      !newMember.class
    ) {
      showMessage('이름, 연락처, 반은 필수 입력사항입니다.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/group-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newMember.name,
          role: newMember.role,
          contact: newMember.contact || undefined,
          group_id: selectedGroup,
          class: newMember.class || undefined,
        }),
      });

      if (response.ok) {
        showMessage('멤버가 성공적으로 추가되었습니다.', 'success');
        setNewMember({ name: '', role: 'student', contact: '', class: '' });
        loadData();
      } else {
        const result = await response.json();
        showMessage(result.error || '멤버 추가에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('멤버 추가 오류:', error);
      showMessage('멤버 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm('정말로 이 멤버를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/group-members?id=${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('멤버가 성공적으로 삭제되었습니다.', 'success');
        loadData();
      } else {
        const result = await response.json();
        showMessage(result.error || '멤버 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('멤버 삭제 오류:', error);
      showMessage('멤버 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const getGroupMembers = (groupId: number) => {
    return groupMembers.filter((member) => member.group_id === groupId);
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
            <Link href="/admin/main">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                관리자 메인
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-purple-800">조 관리</h1>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* 조 선택 */}
        <Card className="mb-8 border-purple-200 bg-white/80">
          <CardHeader>
            <CardTitle className="text-purple-800">조 선택</CardTitle>
            <CardDescription>관리할 조를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedGroup?.toString() || ''}
              onValueChange={(value) => setSelectedGroup(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="조를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name} - {group.teacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 새 멤버 추가 */}
        {selectedGroup && (
          <Card className="mb-8 border-green-200 bg-green-50/80">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />새 멤버 추가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="이름"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
                <Select
                  value={newMember.role}
                  onValueChange={(value: 'teacher' | 'student') =>
                    setNewMember({ ...newMember, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">교사</SelectItem>
                    <SelectItem value="student">학생</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="연락처"
                  value={newMember.contact}
                  onChange={(e) =>
                    setNewMember({ ...newMember, contact: e.target.value })
                  }
                  required
                />
                <Select
                  value={newMember.class}
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, class: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="반 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddMember}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                멤버 추가
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 선택된 조의 멤버 목록 */}
        {selectedGroup && (
          <Card className="border-gray-200 bg-white/80">
            <CardHeader>
              <CardTitle className="text-gray-800">
                {groups.find((g) => g.id === selectedGroup)?.name} 멤버 목록
              </CardTitle>
              <CardDescription>
                현재 조의 교사와 학생 목록입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getGroupMembers(selectedGroup).map((member) => (
                  <Card key={member.id} className="border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-800">
                                {member.name}
                              </h3>
                              <Badge
                                variant={
                                  member.role === 'teacher'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={
                                  member.role === 'teacher'
                                    ? 'bg-green-100 text-green-800'
                                    : ''
                                }
                              >
                                {member.role === 'teacher' ? '교사' : '학생'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {member.contact && (
                                <p>
                                  연락처:{' '}
                                  <PhoneLink
                                    phoneNumber={member.contact}
                                    showIcon
                                  />
                                </p>
                              )}
                              {member.class && <p>반: {member.class}</p>}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getGroupMembers(selectedGroup).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    이 조에는 아직 멤버가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
