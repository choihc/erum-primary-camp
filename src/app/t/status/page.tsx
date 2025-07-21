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
import { ArrowLeft, BarChart3, Trophy, TrendingUp, Users } from 'lucide-react';
import { supabase, Group } from '@/lib/supabase';

export default function StatusPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSession();
    loadGroups();
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
    } catch {
      localStorage.removeItem('teacherSession');
      router.push('/t');
    }
  };

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .gte('group_number', 1)
        .lte('group_number', 20)
        .order('score', { ascending: false });

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return <Badge className="bg-yellow-500 text-white">🥇 1위</Badge>;
    if (rank === 2)
      return <Badge className="bg-gray-400 text-white">🥈 2위</Badge>;
    if (rank === 3)
      return <Badge className="bg-amber-600 text-white">🥉 3위</Badge>;
    return (
      <Badge variant="outline" className="border-sky-300 text-sky-700">
        {rank}위
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 100) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-600">조 현황을 불러오는 중...</p>
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
          <h1 className="text-xl font-bold text-sky-800">점수 현황</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 페이지 제목 */}
        <div className="text-center space-y-2 py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-800 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            점수 현황
          </h2>
          <p className="text-sky-600">
            각 조의 현재 점수를 확인하고 비교해보세요
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700">
                {groups.length}
              </p>
              <p className="text-xs text-emerald-600">총 조 수</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700">
                {groups.length > 0
                  ? Math.max(...groups.map((g) => g.score))
                  : 0}
              </p>
              <p className="text-xs text-blue-600">최고 점수</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold text-amber-700">
                {Math.round(
                  groups.reduce((sum, group) => sum + group.score, 0) /
                    groups.length
                )}
              </p>
              <p className="text-xs text-amber-600">평균 점수</p>
            </CardContent>
          </Card>
          <Card className="border-violet-200 bg-violet-50/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-violet-600" />
              <p className="text-2xl font-bold text-violet-700">
                {groups.length > 0 ? groups[0].name : '-'}
              </p>
              <p className="text-xs text-violet-600">1위 조</p>
            </CardContent>
          </Card>
        </div>

        {/* 점수 랭킹 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              점수 랭킹
            </CardTitle>
            <CardDescription className="text-sky-600">
              실시간으로 업데이트되는 조별 점수 현황입니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.map((group, index) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRankBadge(index + 1)}
                    <div>
                      <h4 className="font-semibold text-sky-800">
                        {group.name}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-sky-800">
                      {group.score}
                    </p>
                    <p className="text-xs text-sky-600">점</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 점수 분포 막대그래프 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              점수 분포 차트
            </CardTitle>
            <CardDescription className="text-sky-600">
              조별 점수를 막대그래프로 한눈에 비교하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-sky-300" />
                <p className="text-sky-600">조 데이터가 없습니다.</p>
                <p className="text-sm text-sky-500">
                  조가 생성되면 차트가 표시됩니다.
                </p>
              </div>
            ) : (
              <>
                {/* Y축 레이블과 그래프 */}
                <div className="relative">
                  {/* 차트 영역 */}
                  <div className="flex">
                    {/* Y축 레이블 */}
                    <div className="w-12 h-64 flex flex-col justify-between text-xs text-sky-600 pr-2">
                      {groups.length > 0
                        ? (() => {
                            const maxScore = Math.max(
                              ...groups.map((g) => g.score),
                              0
                            );
                            const yAxisMax = maxScore + 1; // 최고점수 + 1
                            const step = yAxisMax / 4; // 5개 구간으로 나누기
                            return Array.from({ length: 5 }, (_, i) => {
                              const value = Math.round(yAxisMax - i * step);
                              return (
                                <div
                                  key={i}
                                  className="text-right leading-none"
                                >
                                  {value}
                                </div>
                              );
                            });
                          })()
                        : // 데이터가 없을 때 기본 스케일 (0-10)
                          Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="text-right leading-none">
                              {10 - i * 2.5}
                            </div>
                          ))}
                    </div>

                    {/* 그래프 영역 */}
                    <div className="flex-1 relative">
                      {/* 격자선 */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className="border-t border-sky-100"
                          ></div>
                        ))}
                      </div>

                      {/* X축 기준선 (0점 라인) */}
                      <div className="absolute bottom-0 left-0 right-0 border-b-2 border-sky-300"></div>

                      {/* 막대그래프와 라벨 영역 */}
                      <div className="h-64 relative">
                        {/* 막대들 */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 md:gap-2">
                          {groups.map((group) => {
                            const maxScore = Math.max(
                              ...groups.map((g) => g.score),
                              0
                            );
                            const yAxisMax = maxScore + 1; // 최고점수 + 1
                            const heightPixels = Math.max(
                              (group.score / yAxisMax) * 256, // 256px = h-64
                              group.score === 0 ? 2 : 4 // 최소 높이
                            );

                            // 조의 개수에 따라 막대 넓이 동적 조정
                            const getBarWidth = () => {
                              if (groups.length <= 6) return 'w-12'; // 48px
                              if (groups.length <= 10) return 'w-8'; // 32px
                              if (groups.length <= 14) return 'w-6'; // 24px
                              return 'w-4'; // 16px
                            };

                            return (
                              <div
                                key={group.id}
                                className="flex flex-col items-center group relative"
                              >
                                {/* 점수 표시 (호버 시) */}
                                <div
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-sky-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap absolute z-10"
                                  style={{ bottom: `${heightPixels + 4}px` }}
                                >
                                  {group.score}점
                                </div>

                                {/* 막대 */}
                                <div
                                  className={`${getBarWidth()} ${getScoreColor(
                                    group.score
                                  )} transition-all duration-700 hover:opacity-80 cursor-pointer shadow-sm`}
                                  style={{
                                    height: `${heightPixels}px`,
                                  }}
                                ></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* X축 라벨 (조명과 점수) */}
                  <div className="mt-4 ml-12">
                    <div className="flex justify-center gap-1 md:gap-2">
                      {groups.map((group) => {
                        // 조의 개수에 따라 라벨 넓이 동적 조정
                        const getLabelWidth = () => {
                          if (groups.length <= 6) return 'w-12'; // 48px
                          if (groups.length <= 10) return 'w-8'; // 32px
                          if (groups.length <= 14) return 'w-6'; // 24px
                          return 'w-4'; // 16px
                        };

                        const getFontSize = () => {
                          if (groups.length <= 10) return 'text-xs';
                          return 'text-[10px]'; // 더 작은 폰트
                        };

                        return (
                          <div
                            key={group.id}
                            className={`${getLabelWidth()} text-center space-y-1`}
                          >
                            <div
                              className={`${getFontSize()} text-sky-700 font-medium truncate`}
                            >
                              {group.name}
                            </div>
                            <div
                              className={`${getFontSize()} font-bold text-sky-800`}
                            >
                              {group.score}점
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 범례 */}
                <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-sky-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                    <span className="text-xs text-sky-700">100점 이상</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs text-sky-700">50-99점</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-amber-500 rounded"></div>
                    <span className="text-xs text-sky-700">20-49점</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs text-sky-700">0-19점</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 새로고침 안내 */}
        <div className="text-center p-4 bg-sky-100/50 rounded-lg border border-sky-200">
          <p className="text-sm text-sky-700">
            💡 점수는 실시간으로 업데이트됩니다.
            <Button
              variant="link"
              className="text-sky-600 hover:text-sky-700 p-0 ml-1"
              onClick={loadGroups}
            >
              새로고침
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
