import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// SERVICE_ROLE_KEY가 있으면 사용하고, 없으면 ANON_KEY 사용
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing for group-members API!');
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

    const { data: members, error } = await supabase
      .from('group_members')
      .select(
        `
        *,
        groups (
          name
        )
      `
      )
      .order('group_id')
      .order('role')
      .order('name');

    if (error) {
      console.error('Group members fetch error:', error);
      return NextResponse.json(
        {
          error: '그룹 멤버 데이터를 불러오는 중 오류가 발생했습니다.',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(members || []);
  } catch (error) {
    console.error('Group members API error:', error);
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
    const {
      name,
      role,
      contact,
      group_id,
      class: memberClass,
    } = await request.json();

    // 입력 검증
    if (!name || !role || !group_id || !contact || !memberClass) {
      return NextResponse.json(
        { error: '이름, 역할, 그룹, 연락처, 반은 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    if (!['teacher', 'student'].includes(role)) {
      return NextResponse.json(
        { error: '역할은 teacher 또는 student여야 합니다.' },
        { status: 400 }
      );
    }

    const { data: member, error } = await supabase
      .from('group_members')
      .insert([
        {
          name,
          role,
          contact,
          group_id: parseInt(group_id),
          class: memberClass,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Group member creation error:', error);
      return NextResponse.json(
        { error: '그룹 멤버 추가 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Group member creation API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json(
        { error: '멤버 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Group member deletion error:', error);
      return NextResponse.json(
        { error: '그룹 멤버 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Group member deletion API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      name,
      role,
      contact,
      group_id,
      class: memberClass,
    } = await request.json();

    // 입력 검증
    if (!id || !name || !role || !group_id || !contact || !memberClass) {
      return NextResponse.json(
        { error: 'ID, 이름, 역할, 그룹, 연락처, 반은 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    if (!['teacher', 'student'].includes(role)) {
      return NextResponse.json(
        { error: '역할은 teacher 또는 student여야 합니다.' },
        { status: 400 }
      );
    }

    const { data: member, error } = await supabase
      .from('group_members')
      .update({
        name,
        role,
        contact,
        group_id: parseInt(group_id),
        class: memberClass,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Group member update error:', error);
      return NextResponse.json(
        { error: '그룹 멤버 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Group member update API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
