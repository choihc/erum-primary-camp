/**
 * 파일명: page.tsx
 * 목적: 코너 활동 소개 페이지
 * 역할: 각 코너별 활동 정보 및 담당교사 정보를 표시
 * 작성일: 2024-01-24
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Target, Lightbulb } from 'lucide-react';
import { cornerData, type CornerInfo } from '@/lib/cornerData';

export default function CornersPage() {
  const [selectedCorner, setSelectedCorner] = useState<CornerInfo | null>(null);

  /**
   * handleCornerSelect: 코너 선택 처리
   * @param {CornerInfo} corner - 선택된 코너 정보
   */
  const handleCornerSelect = (corner: CornerInfo) => {
    setSelectedCorner(corner);
  };

  /**
   * handleBackToList: 목록으로 돌아가기
   */
  const handleBackToList = () => {
    setSelectedCorner(null);
  };

  if (selectedCorner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="text-sky-600 hover:text-sky-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로
              </Button>
              <h1 className="text-xl font-bold text-sky-800">
                {selectedCorner.name}
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
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-sky-100 rounded-full">
                  <Target className="h-8 w-8 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-sky-800">
                    {selectedCorner.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {selectedCorner.id}번 코너
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 진행 장소 */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-sky-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-sky-800">진행 장소</h3>
                  <p className="text-sky-700">{selectedCorner.location}</p>
                </div>
              </div>

              {/* 담당 선생님 */}
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-sky-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-sky-800">담당 선생님</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCorner.teachers.map((teacher, index) => (
                      <Badge
                        key={index}
                        variant={
                          teacher === selectedCorner.mainTeacher
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          teacher === selectedCorner.mainTeacher
                            ? 'bg-sky-600'
                            : ''
                        }
                      >
                        {teacher}
                        {teacher === selectedCorner.mainTeacher && ' (주담당)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 활동 목표 */}
              {selectedCorner.objective && (
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-sky-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-sky-800">활동 목표</h3>
                    <p className="text-sky-700">{selectedCorner.objective}</p>
                  </div>
                </div>
              )}

              {/* 진행 방법 */}
              {selectedCorner.method && (
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-sky-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-sky-800">진행 방법</h3>
                    <p className="text-sky-700">{selectedCorner.method}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-sky-600" />
            <h1 className="text-xl font-bold text-sky-800">코너 활동 소개</h1>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cornerData.map((corner) => (
            <Card
              key={corner.id}
              className="hover:shadow-lg transition-shadow border-sky-200 bg-white/80 backdrop-blur-sm cursor-pointer"
              onClick={() => handleCornerSelect(corner)}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 p-3 bg-sky-100 rounded-full w-fit">
                  <Target className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-lg text-sky-800">
                  {corner.name}
                </CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  {corner.id}번 코너
                </Badge>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-sky-600">
                  <MapPin className="h-4 w-4" />
                  <span>{corner.location}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-sky-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {corner.mainTeacher} 외 {corner.teachers.length - 1}명
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  자세히 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
