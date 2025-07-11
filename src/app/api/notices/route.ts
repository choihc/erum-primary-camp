/**
 * 파일명: route.ts
 * 목적: 공지사항 API 라우트 처리
 * 역할: 공지사항 조회 및 등록 API 제공
 * 작성일: 2024-12-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET: 공지사항 목록 조회
 * @returns {NextResponse} 공지사항 목록 반환
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('공지사항 조회 오류:', error);
      return NextResponse.json(
        { error: '공지사항을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('공지사항 조회 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새로운 공지사항 등록
 * @param {NextRequest} request - 공지사항 등록 요청
 * @returns {NextResponse} 등록 결과 반환
 */
export async function POST(request: NextRequest) {
  try {
    const { title, content, author } = await request.json();

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 제목 길이 검증
    if (title.length > 200) {
      return NextResponse.json(
        { error: '제목은 200자 이내로 입력해주세요.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notices')
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          author: author || 'admin',
        },
      ])
      .select();

    if (error) {
      console.error('공지사항 등록 오류:', error);
      return NextResponse.json(
        { error: '공지사항 등록 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('공지사항 등록 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 공지사항 수정
 * @param {NextRequest} request - 공지사항 수정 요청
 * @returns {NextResponse} 수정 결과 반환
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, title, content } = await request.json();

    // 필수 필드 검증
    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, 제목, 내용을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 제목 길이 검증
    if (title.length > 200) {
      return NextResponse.json(
        { error: '제목은 200자 이내로 입력해주세요.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notices')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('공지사항 수정 오류:', error);
      return NextResponse.json(
        { error: '공지사항 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '해당 공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('공지사항 수정 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 공지사항 삭제
 * @param {NextRequest} request - 공지사항 삭제 요청
 * @returns {NextResponse} 삭제 결과 반환
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '삭제할 공지사항 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('notices').delete().eq('id', id);

    if (error) {
      console.error('공지사항 삭제 오류:', error);
      return NextResponse.json(
        { error: '공지사항 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('공지사항 삭제 중 예외 발생:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
