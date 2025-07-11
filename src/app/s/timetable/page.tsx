'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TimetablePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-sky-800">전체 시간표</h1>
          <div className="w-20"></div> {/* 중앙 정렬을 위한 공간 */}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-full mx-auto p-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-sky-200 p-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-sky-800 mb-2">
              2025 이룸교회
              <br />
              초등부 여름성경학교
            </h2>
            <p className="text-sky-600">전체 프로그램 일정표</p>
          </div>

          {/* 이미지 컨테이너 */}
          <div className="flex justify-center">
            <div className="relative w-full">
              <Image
                src="/timetable.png"
                alt="여름성경학교 전체 시간표"
                width={1600}
                height={1200}
                className="w-full h-auto rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>

          {/* 하단 안내 */}
          <div className="mt-4 text-center text-sm text-sky-600">
            <p>프로그램 일정은 현장 상황에 따라 변경될 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
