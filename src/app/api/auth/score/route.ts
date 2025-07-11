import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: '인증 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 환경 변수에서 인증 코드 가져오기
    const validCode = process.env.SCORE_AUTH_CODE;

    if (!validCode) {
      console.error('SCORE_AUTH_CODE environment variable is not set');
      return NextResponse.json(
        { success: false, message: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (code === validCode) {
      return NextResponse.json(
        {
          success: true,
          message: '인증이 완료되었습니다.',
          expiresAt: Date.now() + 30 * 60 * 1000, // 30분 후 만료
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: '인증 코드가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Score auth error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
