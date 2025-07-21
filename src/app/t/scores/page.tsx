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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Plus,
  Trophy,
  Undo2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Shield,
} from 'lucide-react';
import { supabase, Group } from '@/lib/supabase';

interface ScoreChange {
  groupId: number;
  originalScore: number;
  newScore: number;
  changed: boolean;
}

export default function ScoresPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [scoreChanges, setScoreChanges] = useState<Record<number, ScoreChange>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkSession();
    if (isAuthenticated) {
      loadGroups();
    }
  }, [isAuthenticated]);

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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSaving(true);

    try {
      const response = await fetch('/api/auth/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAuthCode('');
      } else {
        setAuthError(data.message || '인증에 실패했습니다.');
        setAuthCode('');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setAuthCode('');
    } finally {
      setSaving(false);
    }
  };

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .gte('group_number', 1)
        .lte('group_number', 20)
        .order('name');

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      const groupsData = data || [];
      setGroups(groupsData);

      // Initialize score changes
      const initialScoreChanges: Record<number, ScoreChange> = {};
      groupsData.forEach((group) => {
        initialScoreChanges[group.id] = {
          groupId: group.id,
          originalScore: group.score,
          newScore: group.score,
          changed: false,
        };
      });
      setScoreChanges(initialScoreChanges);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const addScore = (groupId: number, points: number) => {
    setScoreChanges((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        newScore: prev[groupId].newScore + points,
        changed: true,
      },
    }));
  };

  const resetScore = (groupId: number) => {
    setScoreChanges((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        newScore: prev[groupId].originalScore,
        changed: false,
      },
    }));
  };

  const saveScores = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const changedGroups = Object.values(scoreChanges).filter(
        (sc) => sc.changed
      );

      if (changedGroups.length === 0) {
        setSaveStatus('success');
        setSaving(false);
        return;
      }

      // Update scores in database
      for (const scoreChange of changedGroups) {
        const { error } = await supabase
          .from('groups')
          .update({ score: scoreChange.newScore })
          .eq('id', scoreChange.groupId);

        if (error) {
          console.error('Error updating score:', error);
          setSaveStatus('error');
          setSaving(false);
          return;
        }
      }

      // Reload groups to get updated data
      await loadGroups();
      setSaveStatus('success');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving scores:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.values(scoreChanges).some((sc) => sc.changed);
  const totalChanges = Object.values(scoreChanges).filter(
    (sc) => sc.changed
  ).length;

  // 인증이 안 된 경우 인증 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-sky-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-sky-800">
              점수 입력 인증
            </CardTitle>
            <CardDescription className="text-sky-600">
              점수 입력을 위해 추가 인증이 필요합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="authCode"
                  className="block text-sm font-medium text-sky-700 mb-2"
                >
                  인증 비밀번호 (4자리 숫자)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-400" />
                  <Input
                    id="authCode"
                    type="password"
                    maxLength={4}
                    placeholder="0000"
                    value={authCode}
                    onChange={(e) =>
                      setAuthCode(e.target.value.replace(/\D/g, ''))
                    }
                    className="pl-10 text-center text-lg tracking-widest border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                  />
                </div>
              </div>

              {authError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {authError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3">
                <Link href="/t/main" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-sky-200 text-sky-600 hover:bg-sky-50"
                  >
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                  disabled={authCode.length !== 4 || saving}
                >
                  {saving ? '인증 중...' : '인증'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-600">점수 정보를 불러오는 중...</p>
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
          <h1 className="text-xl font-bold text-sky-800">점수 입력</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 저장 상태 알림 */}
        {saveStatus === 'success' && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-800">저장 완료!</AlertTitle>
            <AlertDescription className="text-emerald-700">
              점수가 성공적으로 업데이트되었습니다.
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">저장 실패</AlertTitle>
            <AlertDescription className="text-red-700">
              점수 저장 중 오류가 발생했습니다. 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        )}

        {/* 조별 점수 입력 */}
        <div className="grid gap-4 md:grid-cols-2">
          {groups
            .sort((a, b) => a.id - b.id)
            .map((group) => {
              const scoreChange = scoreChanges[group.id];
              const isChanged = scoreChange?.changed || false;
              const currentScore = scoreChange?.newScore || group.score;
              const scoreIncrement = currentScore - group.score;

              return (
                <Card
                  key={group.id}
                  className={`hover:shadow-lg transition-all border-sky-200 backdrop-blur-sm ${
                    isChanged ? 'bg-blue-50/80 border-blue-300' : 'bg-white/80'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sky-800 flex items-center">
                        <Trophy className="h-5 w-5 mr-2" />
                        {group.name}
                      </CardTitle>
                      {isChanged && (
                        <Badge className="bg-blue-500 text-white">
                          +{scoreIncrement}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 현재 점수 표시 */}
                    <div className="text-center space-y-2">
                      <div className="text-sm text-sky-600">현재 점수</div>
                      <div className="flex items-center justify-center space-x-4">
                        <span className="text-3xl font-bold text-sky-800">
                          {currentScore}
                        </span>
                        {isChanged && (
                          <div className="text-sm text-blue-600">
                            (원래: {group.score})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 점수 조작 버튼 */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => addScore(group.id, 10)}
                          className="bg-sky-500 hover:bg-sky-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          10점
                        </Button>
                        <Button
                          onClick={() => addScore(group.id, 50)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          50점
                        </Button>
                        <Button
                          onClick={() => addScore(group.id, 100)}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          100점
                        </Button>
                      </div>
                      {isChanged && (
                        <Button
                          onClick={() => resetScore(group.id)}
                          variant="outline"
                          className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                        >
                          <Undo2 className="h-4 w-4 mr-1" />
                          취소
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* 저장 안내 */}
        <div className="text-center p-4 bg-sky-100/50 rounded-lg border border-sky-200">
          <p className="text-sm text-sky-700">
            💡 점수를 변경한 후 반드시 <strong>&lsquo;저장하기&rsquo;</strong>{' '}
            버튼을 눌러주세요. 저장하지 않으면 변경사항이 반영되지 않습니다.
          </p>
        </div>

        {/* 바텀시트 여백 - 바텀시트가 나타날 때 컨텐츠가 가려지지 않도록 */}
        {hasChanges && <div className="h-32"></div>}
      </div>

      {/* 바텀시트 - 변경사항이 있을 때만 표시 */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-amber-800">
                    {totalChanges}개 조 점수 변경
                  </div>
                  <div className="text-sm text-amber-600">
                    저장하지 않으면 변경사항이 사라집니다
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset all changes
                    const resetChanges = Object.fromEntries(
                      Object.entries(scoreChanges).map(([id, sc]) => [
                        id,
                        {
                          ...sc,
                          newScore: sc.originalScore,
                          changed: false,
                        },
                      ])
                    );
                    setScoreChanges(resetChanges);
                  }}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  전체 취소
                </Button>
                <Button
                  onClick={saveScores}
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px]"
                >
                  {saving ? '저장 중...' : '저장하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
