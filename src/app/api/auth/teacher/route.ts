import { NextRequest, NextResponse } from 'next/server';

// 환경 변수에서 인증 코드를 가져오거나 기본값 사용
const TEACHER_AUTH_CODE = process.env.TEACHER_AUTH_CODE || '2024A';

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
    if (authCode.trim().toUpperCase() !== TEACHER_AUTH_CODE.toUpperCase()) {
      return NextResponse.json(
        { success: false, message: '잘못된 인증 코드입니다.' },
        { status: 401 }
      );
    }

    // 인증 성공
    const now = new Date().getTime();
    const expiry = now + 24 * 60 * 60 * 1000; // 24시간

    return NextResponse.json({
      success: true,
      message: '인증이 완료되었습니다.',
      sessionData: {
        authenticated: true,
        expiry: expiry,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('Teacher authentication error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
