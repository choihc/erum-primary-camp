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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  RefreshCw,
  AlertCircle,
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

interface NewMember {
  name: string;
  contact: string;
  class: string;
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(
    null
  );
  const [newMember, setNewMember] = useState<NewMember>({
    name: '',
    contact: '',
    class: '',
  });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
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

      loadGroupsAndMembers();
    } catch {
      localStorage.removeItem('adminSession');
      router.push('/admin');
    }
  };

  const loadGroupsAndMembers = async () => {
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
      console.error('Error loading groups and members:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !newMember.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setAddMemberLoading(true);

    try {
      const { data, error } = await supabase
        .from('group_members')
        .insert([
          {
            name: newMember.name.trim(),
            contact: newMember.contact.trim() || null,
            class: newMember.class.trim() || null,
            group_id: selectedGroup.group_number,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 상태 업데이트
      setGroupMembers([...groupMembers, data]);
      setNewMember({ name: '', contact: '', class: '' });
      setIsAddMemberOpen(false);

      alert('구성원이 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('구성원 추가 중 오류가 발생했습니다.');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleDeleteMember = async (member: GroupMember) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', member.id);

      if (error) {
        throw error;
      }

      // 상태 업데이트
      setGroupMembers(groupMembers.filter((m) => m.id !== member.id));
      setIsDeleteMemberOpen(false);
      setMemberToDelete(null);

      alert('구성원이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('구성원 삭제 중 오류가 발생했습니다.');
    }
  };

  const getGroupMembers = (groupNumber: number) => {
    return groupMembers.filter((member) => member.group_id === groupNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-purple-700">조 정보를 불러오는 중...</p>
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
          <Link href="/admin/main">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-purple-800">조 관리</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadGroupsAndMembers}
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
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800 flex items-center justify-center">
            <Users className="h-8 w-8 mr-3" />조 관리
          </h2>
          <p className="text-purple-600">
            각 조의 구성원을 추가하고 관리하세요
          </p>
        </div>

        {/* 전체 통계 */}
        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              전체 현황
            </CardTitle>
            <CardDescription className="text-purple-600">
              총 {groups.length}개 조, {groupMembers.length}명
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 조 목록 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const members = getGroupMembers(group.group_number);
            return (
              <Card
                key={group.id}
                className="cursor-pointer transition-all border-purple-200 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-105"
                onClick={() => setSelectedGroup(group)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-800">
                      {group.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-purple-300 text-purple-700"
                    >
                      {members.length}명
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-600">현재 점수</span>
                    <span className="font-semibold text-purple-800">
                      {group.score}점
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 조 상세 관리 모달 */}
        {selectedGroup && (
          <Dialog
            open={!!selectedGroup}
            onOpenChange={(open) => !open && setSelectedGroup(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-purple-800 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {selectedGroup.name} 관리
                </DialogTitle>
                <DialogDescription className="text-purple-600">
                  구성원을 추가하거나 삭제할 수 있습니다
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* 구성원 추가 버튼 */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-purple-800">
                    구성원 목록
                  </h3>
                  <Dialog
                    open={isAddMemberOpen}
                    onOpenChange={setIsAddMemberOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <UserPlus className="h-4 w-4 mr-2" />
                        구성원 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-purple-800">
                          새 구성원 추가
                        </DialogTitle>
                        <DialogDescription className="text-purple-600">
                          {selectedGroup.name}에 추가할 구성원 정보를 입력하세요
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-purple-700">
                            이름 *
                          </label>
                          <Input
                            value={newMember.name}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                name: e.target.value,
                              })
                            }
                            placeholder="이름을 입력하세요"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-purple-700">
                            연락처
                          </label>
                          <Input
                            value={newMember.contact}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                contact: e.target.value,
                              })
                            }
                            placeholder="연락처를 입력하세요"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-purple-700">
                            반
                          </label>
                          <Input
                            value={newMember.class}
                            onChange={(e) =>
                              setNewMember({
                                ...newMember,
                                class: e.target.value,
                              })
                            }
                            placeholder="반을 입력하세요"
                            className="border-purple-200 focus:border-purple-400"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddMemberOpen(false);
                              setNewMember({
                                name: '',
                                contact: '',
                                class: '',
                              });
                            }}
                            className="border-purple-300 text-purple-600"
                          >
                            취소
                          </Button>
                          <Button
                            onClick={handleAddMember}
                            disabled={
                              addMemberLoading || !newMember.name.trim()
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {addMemberLoading ? '추가 중...' : '추가'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* 구성원 목록 */}
                <div className="space-y-3">
                  {getGroupMembers(selectedGroup.group_number).length === 0 ? (
                    <div className="text-center py-8 text-purple-600">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>구성원이 없습니다.</p>
                      <p className="text-sm mt-1">
                        위의 버튼을 클릭해서 구성원을 추가하세요.
                      </p>
                    </div>
                  ) : (
                    getGroupMembers(selectedGroup.group_number).map(
                      (member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-purple-50/50 rounded-lg border border-purple-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-purple-800">
                                  {member.name}
                                </span>
                              </div>
                              <div className="text-sm text-purple-600 space-y-1">
                                {member.class && <div>반: {member.class}</div>}
                                {member.contact && (
                                  <div>연락처: {member.contact}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMemberToDelete(member);
                              setIsDeleteMemberOpen(true);
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 구성원 삭제 확인 다이얼로그 */}
        <DeleteConfirmDialog
          isOpen={isDeleteMemberOpen}
          onClose={() => {
            setIsDeleteMemberOpen(false);
            setMemberToDelete(null);
          }}
          onConfirm={() => memberToDelete && handleDeleteMember(memberToDelete)}
          title="구성원 삭제"
          description={`${memberToDelete?.name}을(를) 정말 삭제하시겠습니까?`}
        />

        {/* 안내사항 */}
        <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-sm text-emerald-700 space-y-2">
              <p className="font-semibold">💡 사용 안내</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • 조 카드를 클릭하면 해당 조의 구성원을 관리할 수 있습니다
                </li>
                <li>
                  • 구성원 추가 시 이름은 필수이며, 연락처와 반은 선택사항입니다
                </li>
                <li>• 구성원 삭제는 되돌릴 수 없으므로 신중하게 진행하세요</li>
                <li>• 새로고침 버튼으로 최신 정보를 불러올 수 있습니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
