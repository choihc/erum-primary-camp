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
    const { groupId, score, cornerId, scoreType, baseScore, bonusScore } =
      await request.json();

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

    // 코너 점수 기록 저장
    const { error: recordError } = await supabase.from('corner_scores').upsert(
      {
        group_id: group.id,
        corner_id: cornerId,
        score: score,
        base_score: baseScore || score,
        bonus_score: bonusScore || 0,
        score_type: scoreType || 'manual',
      },
      {
        onConflict: 'group_id,corner_id',
      }
    );

    if (recordError) {
      console.error('코너 점수 기록 오류:', recordError);
      // 기록 실패해도 점수 업데이트는 성공으로 처리
    }

    // group_progress 테이블의 total_score도 업데이트
    const { error: progressUpdateError } = await supabase
      .from('group_progress')
      .upsert(
        {
          group_id: group.id,
          total_score: newScore, // groups 테이블의 새 점수와 동기화
        },
        {
          onConflict: 'group_id',
        }
      );

    if (progressUpdateError) {
      console.error('진행 상황 점수 업데이트 오류:', progressUpdateError);
      // 오류 발생해도 메인 점수 업데이트는 성공으로 처리
    }

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
          scoreType: scoreType,
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
 * 코너별 상세 점수 기록 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const cornerId = searchParams.get('cornerId');

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

    if (cornerId) {
      // 특정 코너의 점수 기록 조회
      const { data: cornerScore, error: cornerError } = await supabase
        .from('corner_scores')
        .select('*')
        .eq('group_id', group.id)
        .eq('corner_id', parseInt(cornerId))
        .single();

      if (cornerError && cornerError.code !== 'PGRST116') {
        console.error('코너 점수 조회 오류:', cornerError);
        return NextResponse.json(
          { success: false, message: '코너 점수 조회에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: cornerScore || null,
      });
    } else {
      // 해당 조의 모든 코너 점수 기록 조회
      const { data: cornerScores, error: scoresError } = await supabase
        .from('corner_scores')
        .select('*')
        .eq('group_id', group.id)
        .order('corner_id');

      if (scoresError) {
        console.error('코너 점수 목록 조회 오류:', scoresError);
        return NextResponse.json(
          { success: false, message: '코너 점수 목록 조회에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          group: group,
          cornerScores: cornerScores || [],
        },
      });
    }
  } catch (error) {
    console.error('코너 점수 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 코너 점수 수정 API
 */
export async function PUT(request: NextRequest) {
  try {
    const { groupId, cornerId, score, baseScore, bonusScore, scoreType } =
      await request.json();

    // 필수 파라미터 검증
    if (!groupId || !cornerId || score === undefined) {
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

    // 기존 코너 점수 조회
    const { data: existingScore, error: existingError } = await supabase
      .from('corner_scores')
      .select('*')
      .eq('group_id', group.id)
      .eq('corner_id', cornerId)
      .single();

    if (existingError) {
      return NextResponse.json(
        { success: false, message: '기존 점수를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 점수 차이 계산
    const scoreDifference = score - existingScore.score;

    // 그룹 총점 업데이트
    const newGroupScore = group.score + scoreDifference;
    const { error: groupUpdateError } = await supabase
      .from('groups')
      .update({ score: newGroupScore })
      .eq('id', group.id);

    if (groupUpdateError) {
      console.error('그룹 점수 업데이트 오류:', groupUpdateError);
      return NextResponse.json(
        { success: false, message: '그룹 점수 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 코너 점수 기록 업데이트
    const { error: updateError } = await supabase
      .from('corner_scores')
      .update({
        score: score,
        base_score: baseScore || score,
        bonus_score: bonusScore || 0,
        score_type: scoreType || 'manual',
      })
      .eq('group_id', group.id)
      .eq('corner_id', cornerId);

    if (updateError) {
      console.error('코너 점수 업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, message: '코너 점수 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // group_progress 테이블의 total_score도 업데이트
    const { error: progressUpdateError } = await supabase
      .from('group_progress')
      .upsert(
        {
          group_id: group.id,
          total_score: newGroupScore, // 변경된 그룹 총점과 동기화
        },
        {
          onConflict: 'group_id',
        }
      );

    if (progressUpdateError) {
      console.error('진행 상황 점수 업데이트 오류:', progressUpdateError);
      // 오류 발생해도 메인 점수 업데이트는 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      message: '점수가 성공적으로 수정되었습니다.',
      data: {
        groupId: groupId,
        cornerId: cornerId,
        previousScore: existingScore.score,
        newScore: score,
        scoreDifference: scoreDifference,
        newGroupScore: newGroupScore,
        scoreType: scoreType,
      },
    });
  } catch (error) {
    console.error('코너 점수 수정 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
