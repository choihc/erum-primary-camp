/**
 * 파일명: page.tsx
 * 목적: 코너 네비게이션 페이지
 * 역할: 조별 코너 활동 순서 네비게이션 및 점수 입력 기능
 * 작성일: 2024-01-24
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Route,
  MapPin,
  Users,
  Target,
  Trophy,
  ArrowRight,
  CheckCircle,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';
import {
  getCornerById,
  getGroupSequence,
  scoreSettings,
  type CornerInfo,
} from '@/lib/cornerData';

interface GroupProgress {
  groupId: number;
  currentCornerIndex: number;
  completedCorners: number[];
  totalScore: number;
}

interface CornerScore {
  id: number;
  group_id: number;
  corner_id: number;
  score: number;
  base_score: number;
  bonus_score: number;
  score_type: string;
  result_detail?: string;
  recorded_at: string;
  updated_at: string;
}

export default function CornerNavigationPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupProgress, setGroupProgress] = useState<GroupProgress | null>(
    null
  );
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number>(0);
  const [bonusScore, setBonusScore] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [cornerScores, setCornerScores] = useState<CornerScore[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCorner, setEditingCorner] = useState<{
    cornerId: number;
    currentScore: CornerScore | null;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupProgress(selectedGroupId);
    }
  }, [selectedGroupId]);

  /**
   * checkSession: 세션 확인
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
   * loadGroupProgress: 조별 진행 상황 로드
   * @param {number} groupId - 조 ID
   */
  const loadGroupProgress = async (groupId: number) => {
    try {
      setLoading(true);

      // 진행 상황과 코너별 점수 기록을 동시에 로드
      const [progressResponse, scoresResponse] = await Promise.all([
        fetch(`/api/group-progress?groupId=${groupId}`),
        fetch(`/api/corner-score?groupId=${groupId}`),
      ]);

      const progressResult = await progressResponse.json();
      const scoresResult = await scoresResponse.json();

      if (progressResult.success && progressResult.data) {
        const progress: GroupProgress = {
          groupId: progressResult.data.groupId,
          currentCornerIndex: progressResult.data.currentCornerIndex,
          completedCorners: progressResult.data.completedCorners,
          totalScore: progressResult.data.totalScore,
        };
        setGroupProgress(progress);
      } else {
        // API 실패 시 초기 진행 상황 설정
        const initialProgress: GroupProgress = {
          groupId,
          currentCornerIndex: 0,
          completedCorners: [],
          totalScore: 0,
        };
        setGroupProgress(initialProgress);
      }

      // 코너별 점수 기록 설정
      if (scoresResult.success && scoresResult.data?.cornerScores) {
        setCornerScores(scoresResult.data.cornerScores);
      } else {
        setCornerScores([]);
      }
    } catch (error) {
      console.error('진행 상황 로드 오류:', error);
      // 오류 시 초기 진행 상황 설정
      const initialProgress: GroupProgress = {
        groupId,
        currentCornerIndex: 0,
        completedCorners: [],
        totalScore: 0,
      };
      setGroupProgress(initialProgress);
      setCornerScores([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * saveGroupProgress: 조별 진행 상황 저장
   * @param {GroupProgress} progress - 저장할 진행 상황
   */
  const saveGroupProgress = async (progress: GroupProgress) => {
    try {
      const response = await fetch('/api/group-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: progress.groupId,
          currentCornerIndex: progress.currentCornerIndex,
          completedCorners: progress.completedCorners,
          totalScore: progress.totalScore,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGroupProgress(progress);
      } else {
        console.error('진행 상황 저장 실패:', result.message);
        // 저장 실패해도 로컬 상태는 업데이트
        setGroupProgress(progress);
      }
    } catch (error) {
      console.error('진행 상황 저장 오류:', error);
      // 오류가 발생해도 로컬 상태는 업데이트
      setGroupProgress(progress);
    }
  };

  /**
   * handleGroupSelect: 조 선택 처리
   * @param {number} groupId - 선택된 조 ID
   */
  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  /**
   * handleBackToGroupSelect: 조 선택 화면으로 돌아가기
   */
  const handleBackToGroupSelect = () => {
    setSelectedGroupId(null);
    setGroupProgress(null);
  };

  /**
   * getCurrentCorner: 현재 코너 정보 가져오기
   * @returns {CornerInfo | null} 현재 코너 정보
   */
  const getCurrentCorner = (): CornerInfo | null => {
    if (!selectedGroupId || !groupProgress) return null;

    const sequence = getGroupSequence(selectedGroupId);
    const currentCornerId = sequence[groupProgress.currentCornerIndex];
    return getCornerById(currentCornerId) || null;
  };

  /**
   * getNextCorner: 다음 코너 정보 가져오기
   * @returns {CornerInfo | null} 다음 코너 정보
   */
  const getNextCorner = (): CornerInfo | null => {
    if (!selectedGroupId || !groupProgress) return null;

    const sequence = getGroupSequence(selectedGroupId);
    if (groupProgress.currentCornerIndex + 1 < sequence.length) {
      const nextCornerId = sequence[groupProgress.currentCornerIndex + 1];
      return getCornerById(nextCornerId) || null;
    }
    return null;
  };

  /**
   * handleScoreSelect: 점수 선택 처리
   * @param {number} score - 선택된 점수
   */
  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
    setBonusScore(0);
    setShowScoreModal(true);
  };

  /**
   * handleBonusChange: 보너스 점수 변경
   * @param {number} change - 변경할 보너스 점수
   */
  const handleBonusChange = (change: number) => {
    const newBonus = Math.max(
      0,
      Math.min(scoreSettings.bonusMax, bonusScore + change)
    );
    setBonusScore(newBonus);
  };

  /**
   * handleScoreSubmit: 점수 제출
   */
  const handleScoreSubmit = () => {
    const total = selectedScore + bonusScore;
    setFinalScore(total);
    setShowScoreModal(false);
    setShowConfirmModal(true);
  };

  /**
   * handleCornerEdit: 코너 편집 모달 열기
   * @param {number} cornerId - 편집할 코너 ID
   */
  const handleCornerEdit = async (cornerId: number) => {
    try {
      if (!selectedGroupId) return;

      // 해당 코너의 점수 기록 조회
      const response = await fetch(
        `/api/corner-score?groupId=${selectedGroupId}&cornerId=${cornerId}`
      );
      const result = await response.json();

      setEditingCorner({
        cornerId,
        currentScore: result.success && result.data ? result.data : null,
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('코너 점수 조회 오류:', error);
      alert('코너 점수 정보를 불러올 수 없습니다.');
    }
  };

  /**
   * handleScoreEdit: 점수 수정 처리
   * @param {number} newScore - 새로운 점수
   * @param {number} baseScore - 기본 점수
   * @param {number} bonusScore - 보너스 점수
   * @param {string} scoreType - 점수 유형
   */
  const handleScoreEdit = async (
    newScore: number,
    baseScore: number,
    bonusScore: number,
    scoreType: string
  ) => {
    if (!editingCorner || !selectedGroupId) return;

    try {
      setLoading(true);

      const response = await fetch('/api/corner-score', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroupId,
          cornerId: editingCorner.cornerId,
          score: newScore,
          baseScore,
          bonusScore,
          scoreType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 진행 상황 다시 로드
        await loadGroupProgress(selectedGroupId);
        setShowEditModal(false);
        setEditingCorner(null);
        alert('점수가 성공적으로 수정되었습니다.');
      } else {
        throw new Error(result.message || '점수 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('점수 수정 오류:', error);
      alert('점수 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleScoreConfirm: 점수 확인 및 등록
   */
  const handleScoreConfirm = async () => {
    if (!groupProgress || !selectedGroupId) return;

    setLoading(true);

    try {
      const sequence = getGroupSequence(selectedGroupId);
      const currentCornerId = sequence[groupProgress.currentCornerIndex];

      // 1. 점수를 데이터베이스에 저장 (기존 API)
      const scoreResponse = await fetch('/api/corner-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroupId,
          score: finalScore,
          baseScore: selectedScore,
          bonusScore: bonusScore,
          cornerId: currentCornerId,
          scoreType:
            selectedScore === scoreSettings.win
              ? 'win'
              : selectedScore === scoreSettings.lose
              ? 'lose'
              : selectedScore === scoreSettings.draw
              ? 'draw'
              : 'manual',
        }),
      });

      const scoreResult = await scoreResponse.json();

      if (!scoreResult.success) {
        throw new Error(scoreResult.message || '점수 저장에 실패했습니다.');
      }

      // 2. 코너 완료 처리 (새로운 API)
      const progressResponse = await fetch('/api/group-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroupId,
          cornerId: currentCornerId,
          score: finalScore,
        }),
      });

      const progressResult = await progressResponse.json();

      if (progressResult.success && progressResult.data) {
        // API에서 반환된 데이터로 로컬 상태 업데이트
        const updatedProgress: GroupProgress = {
          groupId: progressResult.data.groupId,
          currentCornerIndex: progressResult.data.currentCornerIndex,
          completedCorners: progressResult.data.completedCorners,
          totalScore: progressResult.data.totalScore,
        };
        setGroupProgress(updatedProgress);
      } else {
        // API 실패 시 로컬에서 업데이트
        const updatedProgress: GroupProgress = {
          ...groupProgress,
          currentCornerIndex: groupProgress.currentCornerIndex + 1,
          completedCorners: [
            ...groupProgress.completedCorners,
            currentCornerId,
          ],
          totalScore: groupProgress.totalScore + finalScore,
        };
        await saveGroupProgress(updatedProgress);
      }

      // 모달 닫기
      setShowConfirmModal(false);
      setSelectedScore(0);
      setBonusScore(0);
      setFinalScore(0);
    } catch (error) {
      console.error('점수 저장 오류:', error);
      alert('점수 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * isAllCompleted: 모든 코너 완료 여부 확인
   * @returns {boolean} 모든 코너 완료 여부
   */
  const isAllCompleted = (): boolean => {
    if (!selectedGroupId || !groupProgress) return false;
    const sequence = getGroupSequence(selectedGroupId);
    return groupProgress.currentCornerIndex >= sequence.length;
  };

  const currentCorner = getCurrentCorner();
  const nextCorner = getNextCorner();

  // 조 선택 화면
  if (!selectedGroupId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Route className="h-6 w-6 text-sky-600" />
              <h1 className="text-xl font-bold text-sky-800">
                코너 네비게이션
              </h1>
            </div>
            <Link href="/t/main">
              <Button
                variant="ghost"
                size="sm"
                className="text-sky-600 hover:text-sky-700"
              >
                메인으로
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-sky-800 mb-2">
              조를 선택하세요
            </h2>
            <p className="text-sky-600">
              진행할 조를 선택하면 코너 활동을 시작할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((groupNumber) => (
              <Card
                key={groupNumber}
                className="hover:shadow-lg transition-shadow border-sky-200 bg-white/80 backdrop-blur-sm cursor-pointer"
                onClick={() => handleGroupSelect(groupNumber)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-3 bg-sky-100 rounded-full w-fit">
                    <Users className="h-6 w-6 text-sky-600" />
                  </div>
                  <CardTitle className="text-lg text-sky-800">
                    {groupNumber}조
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    variant="outline"
                    className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
                  >
                    선택
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 모든 코너 완료 화면
  if (isAllCompleted()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToGroupSelect}
                className="text-sky-600 hover:text-sky-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />조 선택
              </Button>
              <h1 className="text-xl font-bold text-sky-800">
                {selectedGroupId}조 - 완료
              </h1>
            </div>
            <Link href="/t/main">
              <Button
                variant="ghost"
                size="sm"
                className="text-sky-600 hover:text-sky-700"
              >
                메인으로
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-4">
          <Card className="border-green-200 bg-green-50/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Trophy className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                🎉 모든 코너 완료! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-green-700 text-lg">
                {selectedGroupId}조가 모든 코너 활동을 완료했습니다!
              </p>
              {groupProgress && (
                <div className="bg-white/60 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">
                    총 획득 점수: {groupProgress.totalScore}점
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    완료된 코너: {groupProgress.completedCorners.length}개
                  </p>
                </div>
              )}
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  onClick={handleBackToGroupSelect}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  다른 조 선택
                </Button>
                <Link href="/t/main">
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700"
                  >
                    메인으로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 코너 진행 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToGroupSelect}
              className="text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />조 선택
            </Button>
            <h1 className="text-xl font-bold text-sky-800">
              {selectedGroupId}조 코너 진행
            </h1>
          </div>
          <Link href="/t/main">
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600 hover:text-sky-700"
            >
              메인으로
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 진행 상황 */}
        {groupProgress && (
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-sky-800">
                  현재 진행 상황
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSequenceModal(true)}
                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  전체보기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sky-700">
                    진행률: {groupProgress.currentCornerIndex + 1} /{' '}
                    {getGroupSequence(selectedGroupId).length}
                  </span>
                  <span className="text-sky-700">
                    총 점수: {groupProgress.totalScore}점
                  </span>
                </div>
                <Progress
                  value={
                    (groupProgress.currentCornerIndex /
                      getGroupSequence(selectedGroupId).length) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 현재 코너 정보 */}
        {currentCorner && (
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-sky-100 rounded-full">
                  <Target className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-sky-800">
                    현재 코너: {currentCorner.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {currentCorner.id}번 코너
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 장소 정보를 더 강조해서 표시 */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border-2 border-sky-200">
                  <div className="p-2 bg-sky-500 rounded-full">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sky-600 mb-1">
                      진행 장소
                    </p>
                    <p className="text-xl font-bold text-sky-800">
                      {currentCorner.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-sky-600" />
                  <div>
                    <p className="font-medium text-sky-800">담당 선생님</p>
                    <p className="text-sky-700">{currentCorner.mainTeacher}</p>
                  </div>
                </div>
              </div>

              {/* 다음 코너 정보 */}
              {nextCorner && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <ArrowRight className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">
                      다음 코너
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-emerald-800">
                      {nextCorner.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-sm">
                        {nextCorner.location}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 점수 입력 */}
        <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-sky-800">점수 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleScoreSelect(scoreSettings.win)}
                className="h-20 bg-green-500 hover:bg-green-600 text-white"
              >
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">승리</div>
                  <div className="text-sm">{scoreSettings.win}점</div>
                </div>
              </Button>
              <Button
                onClick={() => handleScoreSelect(scoreSettings.draw)}
                className="h-20 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">동점</div>
                  <div className="text-sm">{scoreSettings.draw}점</div>
                </div>
              </Button>
              <Button
                onClick={() => handleScoreSelect(scoreSettings.lose)}
                className="h-20 bg-red-500 hover:bg-red-600 text-white"
              >
                <div className="text-center">
                  <AlertCircle className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">패배</div>
                  <div className="text-sm">{scoreSettings.lose}점</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 점수 입력 모달 */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>점수 입력</DialogTitle>
            <DialogDescription>
              기본 점수에 보너스 점수를 추가할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-800 mb-2">
                기본 점수: {selectedScore}점
              </div>
              <div className="text-lg text-sky-700">
                보너스 점수: {bonusScore}점
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBonusChange(-1)}
                disabled={bonusScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[60px] text-center">
                +{bonusScore}점
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBonusChange(1)}
                disabled={bonusScore >= scoreSettings.bonusMax}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                총 점수: {selectedScore + bonusScore}점
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowScoreModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-sky-600 hover:bg-sky-700"
                onClick={handleScoreSubmit}
              >
                점수 등록
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 점수 확인 모달 */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>점수 확인</DialogTitle>
            <DialogDescription>
              입력한 점수가 맞는지 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedGroupId}조에 <strong>{finalScore}점</strong>을
                추가합니다. 확인을 누르면 다음 코너로 넘어갑니다.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleScoreConfirm}
                disabled={loading}
              >
                {loading ? '등록 중...' : '확인'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 전체 순서 보기 모달 */}
      <Dialog open={showSequenceModal} onOpenChange={setShowSequenceModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGroupId}조 코너 순서</DialogTitle>
            <DialogDescription>
              전체 코너 활동 순서를 확인할 수 있습니다. 완료된 코너를 클릭하면
              점수를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {getGroupSequence(selectedGroupId).map((cornerId, index) => {
              const corner = getCornerById(cornerId);
              const isCompleted =
                groupProgress?.completedCorners.includes(cornerId);
              const isCurrent = groupProgress?.currentCornerIndex === index;

              // 해당 코너의 점수 기록 찾기
              const cornerScore = cornerScores.find(
                (score) => score.corner_id === cornerId
              );

              // 점수 유형에 따른 결과 텍스트
              const getResultText = (scoreType: string) => {
                switch (scoreType) {
                  case 'win':
                    return '승리';
                  case 'lose':
                    return '패배';
                  case 'draw':
                    return '무승부';
                  default:
                    return '기타';
                }
              };

              const getResultColor = (scoreType: string) => {
                switch (scoreType) {
                  case 'win':
                    return 'text-green-600 bg-green-100';
                  case 'lose':
                    return 'text-red-600 bg-red-100';
                  case 'draw':
                    return 'text-yellow-600 bg-yellow-100';
                  default:
                    return 'text-gray-600 bg-gray-100';
                }
              };

              return (
                <div
                  key={cornerId}
                  className={`p-3 rounded-lg border-2 ${
                    isCurrent
                      ? 'border-sky-500 bg-sky-50'
                      : isCompleted
                      ? 'border-green-500 bg-green-50 cursor-pointer hover:bg-green-100'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => isCompleted && handleCornerEdit(cornerId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          isCurrent
                            ? 'bg-sky-500 text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isCurrent ? (
                          <Target className="h-4 w-4" />
                        ) : isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{corner?.name}</p>
                        <div className="flex items-center space-x-2 mt-1 mb-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                            {corner?.location}
                          </span>
                        </div>
                        {/* 점수 및 결과 표시 */}
                        {cornerScore && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-sm font-semibold text-blue-600">
                              {cornerScore.score}점
                            </span>
                            {cornerScore.bonus_score > 0 && (
                              <span className="text-xs text-green-600">
                                (+{cornerScore.bonus_score} 보너스)
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getResultColor(
                                cornerScore.score_type
                              )}`}
                            >
                              {getResultText(cornerScore.score_type)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        variant={
                          isCurrent
                            ? 'default'
                            : isCompleted
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {isCurrent ? '진행중' : isCompleted ? '완료' : '대기'}
                      </Badge>
                      {isCompleted && (
                        <span className="text-xs text-gray-500">
                          클릭하여 수정
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* 점수 수정 모달 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>점수 수정</DialogTitle>
            <DialogDescription>
              {editingCorner && getCornerById(editingCorner.cornerId)?.name}{' '}
              코너의 점수를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          {editingCorner && (
            <ScoreEditForm
              currentScore={editingCorner.currentScore}
              onSubmit={handleScoreEdit}
              onCancel={() => {
                setShowEditModal(false);
                setEditingCorner(null);
              }}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * ScoreEditForm: 점수 수정 폼 컴포넌트
 */
interface ScoreEditFormProps {
  currentScore: CornerScore | null;
  onSubmit: (
    score: number,
    baseScore: number,
    bonusScore: number,
    scoreType: string
  ) => void;
  onCancel: () => void;
  loading: boolean;
}

const ScoreEditForm = ({
  currentScore,
  onSubmit,
  onCancel,
  loading,
}: ScoreEditFormProps) => {
  const [selectedScore, setSelectedScore] = useState<number>(
    currentScore?.base_score || 0
  );
  const [bonusScore, setBonusScore] = useState<number>(
    currentScore?.bonus_score || 0
  );
  const [scoreType, setScoreType] = useState<string>(
    currentScore?.score_type || 'manual'
  );

  /**
   * handleBonusChange: 보너스 점수 변경
   * @param {number} change - 변경할 보너스 점수
   */
  const handleBonusChange = (change: number) => {
    const newBonus = Math.max(
      0,
      Math.min(scoreSettings.bonusMax, bonusScore + change)
    );
    setBonusScore(newBonus);
  };

  /**
   * handleSubmit: 점수 수정 제출
   */
  const handleSubmit = () => {
    const totalScore = selectedScore + bonusScore;
    onSubmit(totalScore, selectedScore, bonusScore, scoreType);
  };

  return (
    <div className="space-y-4">
      {/* 현재 정보 표시 */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">현재 점수 정보</h4>
        {currentScore ? (
          <div className="text-sm text-gray-600 space-y-1">
            <p>총 점수: {currentScore.score}점</p>
            <p>기본 점수: {currentScore.base_score}점</p>
            <p>보너스 점수: {currentScore.bonus_score}점</p>
            <p>
              결과:{' '}
              {currentScore.score_type === 'win'
                ? '승리'
                : currentScore.score_type === 'lose'
                ? '패배'
                : currentScore.score_type === 'draw'
                ? '무승부'
                : '기타'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">점수 기록이 없습니다.</p>
        )}
      </div>

      {/* 점수 선택 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">새로운 점수 선택</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant={scoreType === 'win' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedScore(scoreSettings.win);
              setScoreType('win');
            }}
            className={`h-16 ${
              scoreType === 'win'
                ? 'bg-green-500 hover:bg-green-600'
                : 'hover:bg-green-50'
            }`}
          >
            <div className="text-center">
              <Trophy className="h-4 w-4 mx-auto mb-1" />
              <div className="font-semibold">승리</div>
              <div className="text-sm">{scoreSettings.win}점</div>
            </div>
          </Button>
          <Button
            variant={scoreType === 'draw' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedScore(scoreSettings.draw);
              setScoreType('draw');
            }}
            className={`h-16 ${
              scoreType === 'draw'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'hover:bg-yellow-50'
            }`}
          >
            <div className="text-center">
              <CheckCircle className="h-4 w-4 mx-auto mb-1" />
              <div className="font-semibold">동점</div>
              <div className="text-sm">{scoreSettings.draw}점</div>
            </div>
          </Button>
          <Button
            variant={scoreType === 'lose' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedScore(scoreSettings.lose);
              setScoreType('lose');
            }}
            className={`h-16 ${
              scoreType === 'lose'
                ? 'bg-red-500 hover:bg-red-600'
                : 'hover:bg-red-50'
            }`}
          >
            <div className="text-center">
              <AlertCircle className="h-4 w-4 mx-auto mb-1" />
              <div className="font-semibold">패배</div>
              <div className="text-sm">{scoreSettings.lose}점</div>
            </div>
          </Button>
        </div>
      </div>

      {/* 보너스 점수 */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">보너스 점수</h4>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBonusChange(-1)}
            disabled={bonusScore <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[60px] text-center">
            +{bonusScore}점
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBonusChange(1)}
            disabled={bonusScore >= scoreSettings.bonusMax}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 총 점수 표시 */}
      <div className="text-center">
        <div className="text-xl font-bold text-green-600">
          총 점수: {selectedScore + bonusScore}점
        </div>
      </div>

      {/* 버튼들 */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          취소
        </Button>
        <Button
          className="flex-1 bg-sky-600 hover:bg-sky-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '수정 중...' : '점수 수정'}
        </Button>
      </div>
    </div>
  );
};
