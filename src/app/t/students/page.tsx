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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Search,
  User,
  Phone,
  GraduationCap,
  Users,
  Crown,
} from 'lucide-react';
import { supabase, Student } from '@/lib/supabase';
import { PhoneLink } from '@/components/ui/phone-link';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    loadStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents([]);
    } else {
      const filtered = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

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

  const loadStudents = async () => {
    try {
      // 1. group_members 데이터 가져오기 (교사와 학생 모두 포함)
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .order('name');

      if (membersError) {
        console.error('Error loading members:', membersError);
        return;
      }

      // 2. groups 데이터 가져오기
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*');

      if (groupsError) {
        console.error('Error loading groups:', groupsError);
        return;
      }

      // 3. 데이터 조합하여 Student 인터페이스에 맞게 변환
      const transformedStudents: Student[] = (membersData || []).map(
        (member) => {
          const group = (groupsData || []).find(
            (g) => g.id === member.group_id
          );

          return {
            id: member.id,
            name: member.name,
            class:
              member.class || (member.role === 'teacher' ? '교사' : '미배정'),
            group_id: member.group_id,
            group_name: group?.name || '미배정',
            contact: member.contact || '',
            role: member.role,
            is_leader: group?.leader === member.name,
            created_at: member.created_at || new Date().toISOString(),
          };
        }
      );

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'teacher' ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
        교사
      </Badge>
    ) : role === 'pastor' ? (
      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
        목사
      </Badge>
    ) : (
      <Badge variant="outline" className="border-sky-300 text-sky-700">
        학생
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    return role === 'teacher' ? (
      <GraduationCap className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-600">구성원 정보를 불러오는 중...</p>
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
          <h1 className="text-xl font-bold text-sky-800">구성원 정보 열람</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 페이지 제목 */}
        <div className="text-center space-y-2 py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-800 flex items-center justify-center">
            <Search className="h-8 w-8 mr-3" />
            구성원 정보 열람
          </h2>
          <p className="text-sky-600">
            이름으로 교사 및 학생을 검색하고 상세 정보를 확인하세요
          </p>
        </div>

        {/* 검색창 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-400" />
              <Input
                type="text"
                placeholder="교사 또는 학생 이름을 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
            <p className="text-sm text-sky-600 mt-2">
              {searchQuery
                ? `"${searchQuery}" 검색 결과: ${filteredStudents.length}명`
                : '이름을 입력하면 해당하는 교사 및 학생 목록이 표시됩니다'}
            </p>
          </CardContent>
        </Card>

        {/* 검색 결과 */}
        {searchQuery && (
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-800 flex items-center">
                <User className="h-5 w-5 mr-2" />
                검색 결과
              </CardTitle>
              <CardDescription className="text-sky-600">
                {filteredStudents.length > 0
                  ? `${filteredStudents.length}명의 구성원이 검색되었습니다`
                  : '검색 결과가 없습니다'}
              </CardDescription>
            </CardHeader>

            {filteredStudents.length > 0 && (
              <CardContent className="space-y-3">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(student.role)}
                        <div>
                          <h4 className="font-semibold text-sky-800 flex items-center">
                            {student.name}
                            {student.is_leader && (
                              <Crown className="h-4 w-4 ml-1 text-yellow-500" />
                            )}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-sky-600">
                            <span>{student.group_name}</span>
                            <span>•</span>
                            <span>{student.class}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(student.role)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-sky-500 hover:bg-sky-600 text-white"
                            >
                              상세보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center text-sky-800">
                                {getRoleIcon(student.role)}
                                <span className="ml-2">
                                  {student.name} 상세 정보
                                </span>
                                {student.is_leader && (
                                  <Crown className="h-5 w-5 ml-1 text-yellow-500" />
                                )}
                              </DialogTitle>
                              <DialogDescription className="text-sky-600">
                                구성원의 상세 정보를 확인하세요
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* 기본 정보 */}
                              <div className="grid grid-cols-2 gap-4 p-3 bg-sky-50 rounded-lg">
                                <div>
                                  <span className="text-xs text-sky-600">
                                    이름
                                  </span>
                                  <p className="font-medium text-sky-800">
                                    {student.name}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-sky-600">
                                    역할
                                  </span>
                                  <div className="mt-1">
                                    {getRoleBadge(student.role)}
                                  </div>
                                </div>
                              </div>

                              {/* 소속 정보 */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sky-800 flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  소속 정보
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-xs text-sky-600">
                                      조
                                    </span>
                                    <p className="font-medium text-sky-800">
                                      {student.group_name}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-sky-600">
                                      반
                                    </span>
                                    <p className="font-medium text-sky-800">
                                      {student.class}
                                    </p>
                                  </div>
                                </div>
                                {student.is_leader && (
                                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center text-yellow-700">
                                      <Crown className="h-4 w-4 mr-2" />
                                      <span className="text-sm font-medium">
                                        조장
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 연락처 정보 */}
                              {student.contact && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sky-800 flex items-center">
                                    <Phone className="h-4 w-4 mr-2" />
                                    연락처
                                  </h4>
                                  <div className="p-3 bg-sky-50 rounded-lg">
                                    <PhoneLink
                                      phoneNumber={student.contact}
                                      showIcon
                                      className="text-sky-700"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* 전체 통계 */}
        <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h4 className="font-semibold text-emerald-800 flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                전체 구성원 현황
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {students.length}
                  </p>
                  <p className="text-sm text-emerald-600">총 인원</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {students.filter((s) => s.role === 'student').length}
                  </p>
                  <p className="text-sm text-emerald-600">학생</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {students.filter((s) => s.role === 'teacher').length}
                  </p>
                  <p className="text-sm text-emerald-600">교사</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {students.filter((s) => s.is_leader).length}
                  </p>
                  <p className="text-sm text-emerald-600">조장</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용 안내 */}
        <div className="text-center p-4 bg-sky-100/50 rounded-lg border border-sky-200">
          <p className="text-sm text-sky-700">
            💡 검색창에 이름을 입력하면 해당하는 교사 및 학생 목록이 표시됩니다.
            <br />
            상세보기 버튼을 클릭하면 구성원의 자세한 정보를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
