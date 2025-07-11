'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  ArrowRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import Link from 'next/link';

interface Program {
  title: string;
  startTime: Date;
  endTime: Date;
  date: string;
  timeStr: string;
}

const SCHEDULE: Program[] = [
  {
    title: '접수',
    startTime: new Date('2025-07-18T15:00:00'),
    endTime: new Date('2025-07-18T15:30:00'),
    date: '7월 18일',
    timeStr: '15:00 ~ 15:30',
  },
  {
    title: '성경학교장 도착',
    startTime: new Date('2025-07-18T15:30:00'),
    endTime: new Date('2025-07-18T17:00:00'),
    date: '7월 18일',
    timeStr: '15:30 ~ 17:00',
  },
  {
    title: '개회 및 OT',
    startTime: new Date('2025-07-18T17:00:00'),
    endTime: new Date('2025-07-18T17:30:00'),
    date: '7월 18일',
    timeStr: '17:00 ~ 17:30',
  },
  {
    title: '방배정 및 조별모임',
    startTime: new Date('2025-07-18T17:30:00'),
    endTime: new Date('2025-07-18T18:00:00'),
    date: '7월 18일',
    timeStr: '17:30 ~ 18:00',
  },
  {
    title: '저녁식사',
    startTime: new Date('2025-07-18T18:00:00'),
    endTime: new Date('2025-07-18T19:00:00'),
    date: '7월 18일',
    timeStr: '18:00 ~ 19:00',
  },
  {
    title: '저녁집회1',
    startTime: new Date('2025-07-18T19:00:00'),
    endTime: new Date('2025-07-18T22:00:00'),
    date: '7월 18일',
    timeStr: '19:00 ~ 22:00',
  },
  {
    title: '소그룹 및 간식',
    startTime: new Date('2025-07-18T22:00:00'),
    endTime: new Date('2025-07-18T23:00:00'),
    date: '7월 18일',
    timeStr: '22:00 ~ 23:00',
  },
  {
    title: '취침',
    startTime: new Date('2025-07-18T23:00:00'),
    endTime: new Date('2025-07-19T08:00:00'),
    date: '7월 18일',
    timeStr: '23:00 ~ 08:00',
  },
  {
    title: '아침식사',
    startTime: new Date('2025-07-19T08:00:00'),
    endTime: new Date('2025-07-19T09:00:00'),
    date: '7월 19일',
    timeStr: '08:00 ~ 09:00',
  },
  {
    title: '몸풀기 레크레이션',
    startTime: new Date('2025-07-19T09:00:00'),
    endTime: new Date('2025-07-19T10:00:00'),
    date: '7월 19일',
    timeStr: '09:00 ~ 10:00',
  },
  {
    title: '조별 게임 대회',
    startTime: new Date('2025-07-19T10:00:00'),
    endTime: new Date('2025-07-19T12:00:00'),
    date: '7월 19일',
    timeStr: '10:00 ~ 12:00',
  },
  {
    title: '점심식사',
    startTime: new Date('2025-07-19T12:00:00'),
    endTime: new Date('2025-07-19T13:00:00'),
    date: '7월 19일',
    timeStr: '12:00 ~ 13:00',
  },
  {
    title: '물놀이 프로그램',
    startTime: new Date('2025-07-19T13:00:00'),
    endTime: new Date('2025-07-19T17:00:00'),
    date: '7월 19일',
    timeStr: '13:00 ~ 17:00',
  },
  {
    title: '자유시간',
    startTime: new Date('2025-07-19T17:00:00'),
    endTime: new Date('2025-07-19T18:00:00'),
    date: '7월 19일',
    timeStr: '17:00 ~ 18:00',
  },
  {
    title: '저녁식사',
    startTime: new Date('2025-07-19T18:00:00'),
    endTime: new Date('2025-07-19T19:00:00'),
    date: '7월 19일',
    timeStr: '18:00 ~ 19:00',
  },
  {
    title: '저녁집회2',
    startTime: new Date('2025-07-19T19:00:00'),
    endTime: new Date('2025-07-19T22:00:00'),
    date: '7월 19일',
    timeStr: '19:00 ~ 22:00',
  },
  {
    title: '소그룹 및 간식',
    startTime: new Date('2025-07-19T22:00:00'),
    endTime: new Date('2025-07-19T23:00:00'),
    date: '7월 19일',
    timeStr: '22:00 ~ 23:00',
  },
  {
    title: '취침',
    startTime: new Date('2025-07-19T23:00:00'),
    endTime: new Date('2025-07-20T07:00:00'),
    date: '7월 19일',
    timeStr: '23:00 ~ 07:00',
  },
  {
    title: '퇴실 준비',
    startTime: new Date('2025-07-20T07:00:00'),
    endTime: new Date('2025-07-20T08:00:00'),
    date: '7월 20일',
    timeStr: '07:00 ~ 08:00',
  },
  {
    title: '교회 이동',
    startTime: new Date('2025-07-20T08:00:00'),
    endTime: new Date('2025-07-20T09:00:00'),
    date: '7월 20일',
    timeStr: '08:00 ~ 09:00',
  },
  {
    title: '아침식사 및 설문작성',
    startTime: new Date('2025-07-20T09:00:00'),
    endTime: new Date('2025-07-20T10:00:00'),
    date: '7월 20일',
    timeStr: '09:00 ~ 10:00',
  },
  {
    title: '통합예배 및 시상',
    startTime: new Date('2025-07-20T10:00:00'),
    endTime: new Date('2025-07-20T11:30:00'),
    date: '7월 20일',
    timeStr: '10:00 ~ 11:30',
  },
];

export default function CurrentProgramStatus() {
  // 테스트용 가짜 시간 설정 (실제 운영시에는 null로 설정)
  // const FAKE_TIME = new Date('2025-07-19T10:20:00'); // 테스트: 7월 18일 17:30
  const FAKE_TIME = null; // 실제 운영시 사용

  const [currentTime, setCurrentTime] = useState(FAKE_TIME || new Date());
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [nextProgram, setNextProgram] = useState<Program | null>(null);
  const [status, setStatus] = useState<'before' | 'during' | 'after'>('before');

  useEffect(() => {
    const updateStatus = () => {
      const now = FAKE_TIME || new Date();
      setCurrentTime(now);

      // 성경학교 종료 시간 (7월 20일 12:00)
      const campEndTime = new Date('2025-07-20T12:00:00');

      if (now >= campEndTime) {
        setStatus('after');
        setCurrentProgram(null);
        setNextProgram(null);
        return;
      }

      // 성경학교 시작 시간 (7월 18일 15:00)
      const campStartTime = new Date('2025-07-18T15:00:00');

      if (now < campStartTime) {
        setStatus('before');
        setCurrentProgram(null);
        setNextProgram(SCHEDULE[0]);
        return;
      }

      setStatus('during');

      // 현재 진행 중인 프로그램 찾기
      let current: Program | null = null;
      let next: Program | null = null;

      for (let i = 0; i < SCHEDULE.length; i++) {
        const program = SCHEDULE[i];

        if (now >= program.startTime && now < program.endTime) {
          current = program;
          next = i < SCHEDULE.length - 1 ? SCHEDULE[i + 1] : null;
          break;
        }

        if (now < program.startTime) {
          next = program;
          break;
        }
      }

      setCurrentProgram(current);
      setNextProgram(next);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const formatCurrentTime = () => {
    return currentTime.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getProgressPercentage = () => {
    if (!currentProgram) return 0;

    const total =
      currentProgram.endTime.getTime() - currentProgram.startTime.getTime();
    const elapsed = currentTime.getTime() - currentProgram.startTime.getTime();

    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  if (status === 'after') {
    return (
      <Card className="border-violet-300 bg-violet-50 shadow-md backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-violet-800">
              성경학교가 마무리되었습니다.
            </div>
            <div className="text-lg text-violet-700 font-medium">
              겨울 성경학교에 다시 만나요!
            </div>
            <div className="text-sm text-violet-600">
              모든 프로그램이 완료되었습니다.
            </div>
            <Link href="/s/timetable">
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-violet-300 text-violet-700 hover:bg-violet-100"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                전체 시간표 보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'before') {
    return (
      <Card className="border-orange-300 bg-orange-50 shadow-md backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-700" />
                <span className="text-sm font-medium text-orange-800">
                  현재 상태
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-orange-200 text-orange-800 font-medium"
              >
                접수 중
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-lg font-bold text-orange-800">
                성경학교 접수 진행 중
              </div>
              <div className="text-sm text-orange-700 font-medium">
                7월 18일 15:00까지
              </div>
            </div>

            {nextProgram && (
              <div className="pt-3 border-t border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    다음 프로그램
                  </span>
                </div>
                <div className="text-sm text-orange-800">
                  <span className="font-medium">{nextProgram.title}</span>
                  <span className="text-orange-600 ml-2">
                    {nextProgram.date} {nextProgram.timeStr}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-orange-200 text-center">
              <Link href="/s/timetable">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  전체 시간표 보기
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-300 bg-emerald-50 shadow-md backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-emerald-700" />
              <span className="text-sm font-medium text-emerald-800">
                현재 시간: {formatCurrentTime()}
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-200 text-emerald-800 font-medium"
            >
              진행 중
            </Badge>
          </div>

          {currentProgram ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-lg font-bold text-emerald-800">
                  🎯 {currentProgram.title}
                </div>
                <div className="text-sm text-emerald-700 font-medium">
                  {currentProgram.date} {currentProgram.timeStr}
                </div>

                {/* 진행률 바 */}
                <div className="w-full bg-emerald-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <div className="text-xs text-emerald-600 text-right font-medium">
                  {Math.round(getProgressPercentage())}% 완료
                </div>
              </div>

              {nextProgram && (
                <div className="pt-3 border-t border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      다음 프로그램
                    </span>
                  </div>
                  <div className="text-sm text-emerald-800">
                    <span className="font-medium">{nextProgram.title}</span>
                    <span className="text-emerald-600 ml-2">
                      {nextProgram.date} {nextProgram.timeStr}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-emerald-200 text-center">
                <Link href="/s/timetable">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    전체 시간표 보기
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-lg font-medium text-emerald-800">
                잠시 후 다음 프로그램이 시작됩니다
              </div>
              {nextProgram && (
                <div className="text-sm text-emerald-700 mt-2">
                  <span className="font-medium">{nextProgram.title}</span>
                  <span className="text-emerald-600 ml-2">
                    {nextProgram.date} {nextProgram.timeStr}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-emerald-200">
                <Link href="/s/timetable">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    전체 시간표 보기
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
