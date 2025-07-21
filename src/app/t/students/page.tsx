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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Search, User, Users } from 'lucide-react';
import { supabase, Student } from '@/lib/supabase';

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
      setLoading(true);

      // 그룹 정보 가져오기
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .gte('group_number', 1)
        .lte('group_number', 20);

      if (groupsError) {
        throw groupsError;
      }

      // 그룹 멤버 정보 가져오기
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('*');

      if (membersError) {
        throw membersError;
      }

      // 그룹 정보와 멤버 정보를 결합하여 학생 정보 생성
      const transformedStudents: Student[] = members.map((member): Student => {
        const group = groups.find((g) => g.group_number === member.group_id);

        return {
          id: member.id,
          name: member.name,
          class: member.class || '미배정',
          group_id: member.group_id,
          group_name: group?.name || '미배정',
          contact: member.contact || '',
          created_at: member.created_at || new Date().toISOString(),
        };
      });

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-600">학생 정보를 불러오는 중...</p>
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
          <h1 className="text-xl font-bold text-sky-800">학생 정보열람</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 검색 섹션 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              학생 검색
            </CardTitle>
            <CardDescription className="text-sky-600">
              학생 이름으로 검색하여 상세 정보를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-400" />
              <Input
                type="text"
                placeholder="학생 이름을 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* 검색 결과 */}
        {searchQuery && (
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-800 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                검색 결과
              </CardTitle>
              <CardDescription className="text-sky-600">
                &quot;{searchQuery}&quot;에 대한 검색 결과:{' '}
                {filteredStudents.length}명
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-sky-600">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>검색 결과가 없습니다.</p>
                  <p className="text-sm mt-1">다른 이름으로 검색해보세요.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredStudents.map((student) => (
                    <Dialog key={student.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-sky-100">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-sky-100 rounded-full">
                                  <User className="h-4 w-4 text-sky-600" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sky-800">
                                      {student.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-sky-600">
                                    <span>{student.group_name}</span>
                                    {student.class && (
                                      <>
                                        <span>•</span>
                                        <span>{student.class}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>

                      {/* 학생 상세 정보 모달 */}
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-sky-800 flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            {student.name} 상세 정보
                          </DialogTitle>
                          <DialogDescription className="text-sky-600">
                            학생의 상세 정보를 확인하세요
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-sky-700">
                                이름
                              </label>
                              <div className="p-2 bg-sky-50 rounded border">
                                {student.name}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-sky-700">
                                소속 조
                              </label>
                              <div className="p-2 bg-sky-50 rounded border">
                                {student.group_name}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-sky-700">
                                반
                              </label>
                              <div className="p-2 bg-sky-50 rounded border">
                                {student.class || '미배정'}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-sky-700">
                                연락처
                              </label>
                              <div className="p-2 bg-sky-50 rounded border">
                                {student.contact || '미등록'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 전체 통계 */}
        <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-700">
                  {students.length}
                </div>
                <div className="text-sm text-emerald-600">총 학생 수</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">
                  {new Set(students.map((s) => s.group_name)).size}
                </div>
                <div className="text-sm text-emerald-600">활성화된 조</div>
              </div>
              <div className="md:col-span-1 col-span-2">
                <div className="text-2xl font-bold text-emerald-700">
                  {students.filter((s) => s.contact).length}
                </div>
                <div className="text-sm text-emerald-600">연락처 등록</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용 안내 */}
        <Card className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-sm text-blue-700 space-y-2">
              <p className="font-semibold">💡 사용 안내</p>
              <ul className="space-y-1 text-xs">
                <li>• 학생 이름을 입력하여 검색할 수 있습니다</li>
                <li>
                  • 검색 결과에서 학생 카드를 클릭하면 상세 정보를 볼 수
                  있습니다
                </li>
                <li>
                  • 부분 검색도 지원됩니다 (예: &quot;김&quot; 입력 시 김씨 성을
                  가진 모든 학생)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
