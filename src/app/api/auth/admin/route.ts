import { NextRequest, NextResponse } from 'next/server';

// 환경 변수에서 어드민 인증 코드를 가져오거나 기본값 사용
const ADMIN_AUTH_CODE = process.env.ADMIN_AUTH_CODE || '';

export async function POST(request: NextRequest) {
  try {
    const { authCode } = await request.json();

    // 입력 검증
    if (!authCode || typeof authCode !== 'string') {
      return NextResponse.json(
        { success: false, message: '인증 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증 코드 검증
    if (authCode.trim().toUpperCase() !== ADMIN_AUTH_CODE.toUpperCase()) {
      return NextResponse.json(
        { success: false, message: '잘못된 인증 코드입니다.' },
        { status: 401 }
      );
    }

    // 인증 성공
    const now = new Date().getTime();
    const expiry = now + 60 * 60 * 1000; // 60분 (어드민은 더 긴 세션)

    return NextResponse.json({
      success: true,
      message: '어드민 인증이 완료되었습니다.',
      sessionData: {
        authenticated: true,
        role: 'admin',
        expiry: expiry,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
