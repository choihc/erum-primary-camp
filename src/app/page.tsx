import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-sky-800">
              이룸교회 초등부
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-sky-700">
              2025 여름성경학교
            </h2>
          </div>

          {/* App Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Teacher App */}
            <Card className="hover:shadow-lg transition-shadow border-red-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-800">교사</CardTitle>
                <CardDescription className="text-red-600">
                  조 관리, 점수 입력, 학생 정보 관리
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/t">
                  <Button
                    size="lg"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    교사 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin App */}
            <Card className="hover:shadow-lg transition-shadow border-purple-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <ShieldCheck className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-800">
                  관리자
                </CardTitle>
                <CardDescription className="text-purple-600">
                  조 관리, 멤버 추가/삭제, 시스템 설정
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/admin">
                  <Button
                    size="lg"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    관리자 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
