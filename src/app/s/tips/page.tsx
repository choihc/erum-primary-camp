import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function CampTipsPage() {
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
          <h1 className="text-xl font-bold text-sky-800">수련회 준비물</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center space-y-2 py-6">
          <p className="text-sky-600 text-lg">
            수련회를 더욱 즐겁게 보내기 위하여
            <br />
            준비물을 준비해주세요.
          </p>
        </div>
        {/* 이미지 표시 */}
        <div className="flex justify-center">
          <Image
            src="/prepare.png"
            alt="수련회 준비물"
            width={800}
            height={600}
            className="w-full max-w-4xl h-auto rounded-lg shadow-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
}
