'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Info,
  Lightbulb,
  FileText,
  ArrowLeft,
  Camera,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export default function StudentMainPage() {
  const menuItems = [
    {
      title: '여름성경학교 신청하기',
      description: '여름성경학교 참가 신청 (구글 폼)',
      icon: FileText,
      href: '#',
      color: 'bg-violet-500 hover:bg-violet-600',
      isExternal: true,
      externalType: 'google-form',
    },
    {
      title: '여름성경학교에서 알아야할 점',
      description: '여름성경학교 관련 중요 정보',
      icon: Info,
      href: '/s/info',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      title: '여름성경학교 준비물',
      description: '여름성경학교를 더 즐겁게 보낼수 있도록 준비해주세요.',
      icon: Lightbulb,
      href: '/s/tips',
      color: 'bg-amber-500 hover:bg-amber-600',
    },
    {
      title: '여름성경학교 사진보기',
      description: '여름성경학교 사진을 확인하세요',
      icon: Camera,
      href: 'https://naver.me/5gYo35qO',
      color: 'bg-pink-500 hover:bg-pink-600',
      isExternal: true,
      externalType: 'mybox',
    },
  ];

  const handleExternalLink = (type: string) => {
    switch (type) {
      case 'google-form':
        // 구글 폼 링크 - 실제 링크로 교체
        window.open('https://forms.gle/QTew4otoaSRu6MM69', '_blank');
        break;
      case 'mybox':
        // 마이박스 링크 - 실제 링크로 교체 필요
        window.open('https://naver.me/5gYo35qO', '_blank');
        break;
      default:
        console.log('Unknown external link type:', type);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* 신청하기 배너 */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                2025년 여름여름성경학교 신청
              </h3>
            </div>
          </div>
          <a
            href="https://forms.gle/QTew4otoaSRu6MM69"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-violet-600 px-4 py-2 rounded-md font-semibold text-sm hover:bg-white/90 transition-colors flex items-center space-x-2"
          >
            <span>지금 신청하기</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

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
          <h1 className="text-xl font-bold text-sky-800">
            2025년 여름여름성경학교
          </h1>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Menu Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow border-sky-200 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 p-3 bg-sky-100 rounded-full w-fit">
                  <item.icon className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-lg text-sky-800">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sky-600 text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                {item.isExternal ? (
                  <Button
                    className={`w-full text-white ${item.color}`}
                    onClick={() => handleExternalLink(item.externalType || '')}
                  >
                    바로가기
                  </Button>
                ) : (
                  <Link href={item.href}>
                    <Button className={`w-full text-white ${item.color}`}>
                      바로가기
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notice */}
        <div className="mt-8 p-4 bg-sky-100/50 rounded-lg border border-sky-200">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-sky-700">
              <p className="font-semibold mb-1">안내사항</p>
              <ul className="space-y-1 text-xs">
                <li>• 여름성경학교 사진은 여름성경학교 종료 후 업로드됩니다</li>
                <li>• 문의사항은 담당 교사에게 연락해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
