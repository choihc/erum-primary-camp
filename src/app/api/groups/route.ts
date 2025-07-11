import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// SERVICE_ROLE_KEY가 있으면 사용하고, 없으면 ANON_KEY 사용
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing for groups API!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 환경 변수 확인
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase 환경 변수가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .order('id');

    if (error) {
      console.error('Groups fetch error:', error);
      return NextResponse.json(
        {
          error: '그룹 데이터를 불러오는 중 오류가 발생했습니다.',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(groups || []);
  } catch (error) {
    console.error('Groups API error:', error);
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, teacher, leader } = await request.json();

    // 입력 검증
    if (!name || !teacher || !leader) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert([
        {
          name,
          teacher,
          leader,
          score: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Group creation error:', error);
      return NextResponse.json(
        { error: '그룹 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Group creation API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('id');

    if (!groupId) {
      return NextResponse.json(
        { error: '그룹 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('groups').delete().eq('id', groupId);

    if (error) {
      console.error('Group deletion error:', error);
      return NextResponse.json(
        { error: '그룹 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Group deletion API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
