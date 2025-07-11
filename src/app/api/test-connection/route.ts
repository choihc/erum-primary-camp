import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// SERVICE_ROLE_KEY가 있으면 사용하고, 없으면 ANON_KEY 사용
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

export async function GET() {
  try {
    // 환경 변수 확인
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase 환경 변수가 설정되지 않았습니다.',
          missing: {
            url: !supabaseUrl,
            key: !supabaseKey,
          },
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 간단한 쿼리로 연결 테스트
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name')
      .limit(1);

    if (groupsError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Groups 테이블 접근 실패',
          details: groupsError.message,
        },
        { status: 500 }
      );
    }

    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('id, name')
      .limit(1);

    if (membersError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group_members 테이블 접근 실패',
          details: membersError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '데이터베이스 연결 성공',
      data: {
        groups: groups?.length || 0,
        members: members?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '데이터베이스 연결 테스트 중 오류 발생',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
