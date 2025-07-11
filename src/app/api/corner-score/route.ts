/**
 * 파일명: route.ts
 * 목적: 코너 점수 입력 API
 * 역할: 조별 코너 점수를 데이터베이스에 저장하는 API
 * 작성일: 2024-01-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { groupId, score, cornerId, scoreType } = await request.json();

    // 필수 파라미터 검증
    if (!groupId || score === undefined || !cornerId) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 그룹 존재 여부 확인
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, score')
      .eq('group_number', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, message: '해당 조를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 점수 업데이트
    const newScore = group.score + score;
    const { error: updateError } = await supabase
      .from('groups')
      .update({ score: newScore })
      .eq('id', group.id);

    if (updateError) {
      console.error('점수 업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, message: '점수 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 코너 점수 기록 저장 (선택사항 - 테이블이 있을 경우)
    // TODO: corner_scores 테이블 생성 후 활성화
    console.log(`Score type: ${scoreType || 'manual'} for corner ${cornerId}`);
    /*
    const { error: recordError } = await supabase
      .from('corner_scores')
      .insert({
        group_id: group.id,
        corner_id: cornerId,
        score: score,
        score_type: scoreType || 'manual'
      });

    if (recordError) {
      console.error('코너 점수 기록 오류:', recordError);
      // 기록 실패해도 점수 업데이트는 성공으로 처리
    }
    */

    return NextResponse.json(
      {
        success: true,
        message: '점수가 성공적으로 추가되었습니다.',
        data: {
          groupId: groupId,
          previousScore: group.score,
          addedScore: score,
          newScore: newScore,
          cornerId: cornerId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('코너 점수 입력 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 코너 진행 상황 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: '조 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 그룹 정보 조회
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, group_number, name, score')
      .eq('group_number', parseInt(groupId))
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, message: '해당 조를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 코너 진행 상황 조회 (임시로 로컬 스토리지 사용)
    // TODO: 실제 데이터베이스에서 조회하도록 변경
    return NextResponse.json(
      {
        success: true,
        data: {
          group: group,
          // 진행 상황은 클라이언트에서 로컬 스토리지로 관리
          message: '그룹 정보를 성공적으로 조회했습니다.',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('코너 진행 상황 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
