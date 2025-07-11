import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Info,
  Clock,
  Smartphone,
  Shield,
  Camera,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export default function CampInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sky-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/s">
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-sky-800">성경학교 정보</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 페이지 제목 */}
        <div className="text-center space-y-2 py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-sky-800 flex items-center justify-center">
            <Info className="h-8 w-8 mr-3" />
            성경학교에서 알아야할 점
          </h2>
          <p className="text-sky-600">
            성경학교 참가 전 꼭 알아두어야 할 중요한 정보들입니다
          </p>
        </div>

        {/* 중요 안내사항 */}
        <div className="space-y-4">
          {/* 성경학교 시작 안내 */}
          <Card className="border-sky-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sky-800 flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2" />
                성경학교 시작 안내
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-sky-700">
                <p>
                  • 성경학교는{' '}
                  <strong className="text-sky-800">
                    7월 18일(금) 오후 3시
                  </strong>{' '}
                  중예배실 집결 후 시작됩니다.
                </p>
                <div className="ml-4 text-sky-600">
                  <p>
                    - 학교가 <strong>3시 이후</strong>에 끝날 시{' '}
                    <strong>5시 출발</strong>하는 차가 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 핸드폰 관련 안내 */}
          <Card className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center text-lg">
                <Smartphone className="h-5 w-5 mr-2" />
                핸드폰 관련 안내
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-amber-800">
                <p>
                  • 은혜로운 성경학교를 위하여{' '}
                  <strong>핸드폰은 성경학교 출발 전 수거</strong>합니다.
                </p>
                <div className="ml-4 space-y-1 text-amber-700">
                  <p>
                    - <strong>공기계를 제출하지 않도록</strong> 지도 부탁드리며(
                    <strong>짐 검사 예정</strong>입니다.)
                  </p>
                  <p>
                    - 급한 연락은 <strong>임원 선생님</strong> 혹은{' '}
                    <strong>오픈채팅방 문의</strong>를 통해주시기 바랍니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 규칙 및 제재 사항 */}
          <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2" />
                규칙 및 제재 사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-red-800">
                <p>
                  • <strong>예배와 공동체 활동에 방해되는 모든 물품</strong>은
                  교사 지도하에 제재될 수 있습니다.
                </p>
                <div className="ml-4 text-red-700">
                  <p>
                    - <strong>교역자 및 교사의 판단</strong>에 따라{' '}
                    <strong className="text-red-800">퇴소조치</strong> 될 수
                    있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성경학교 사진 안내 */}
          <Card className="border-purple-200 bg-purple-50/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center text-lg">
                <Camera className="h-5 w-5 mr-2" />
                성경학교 사진 안내
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-purple-800">
                <p>
                  • 성경학교 사진은 <strong>교회 공식 SNS, 홈페이지</strong>에
                  업로드되며, <strong>네이버 MYBOX</strong>를 통하여 원본사진
                  다운로드가 가능합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 분실물 방지 안내 */}
          <Card className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center text-lg">
                <Tag className="h-5 w-5 mr-2" />
                분실물 방지 안내
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-emerald-800">
                <p>
                  • <strong>분실물 방지</strong>를 위해{' '}
                  <strong>신발, 슬리퍼 등 모든 개인용품</strong>에 이름을
                  써주시길 바랍니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 중요 알림 */}
        <Card className="border-sky-300 bg-sky-100/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-sky-800">
                <p className="font-semibold mb-1">📢 중요 안내</p>
                <p>
                  위 내용을 반드시 숙지하시고 성경학교에 참여해주시기 바랍니다.
                </p>
                <p className="mt-2 text-xs text-sky-600">
                  추가 문의사항은 담당 교사에게 연락해주세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
