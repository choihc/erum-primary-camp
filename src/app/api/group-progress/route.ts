/**
 * 파일명: route.ts
 * 목적: 조별 코너 진행 상황 관리 API
 * 역할: 코너 진행 상황 조회, 생성, 업데이트 기능 제공
 * 작성일: 2024-01-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET: 조별 코너 진행 상황 조회
 * @param {NextRequest} request - 요청 객체 (groupId 쿼리 파라미터 포함)
 * @returns {NextResponse} 진행 상황 데이터 반환
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

    // 진행 상황 조회
    const { data: progress, error: progressError } = await supabase
      .from('group_progress')
      .select('*')
      .eq('group_id', group.id)
      .single();

    if (progressError) {
      // 진행 상황이 없으면 초기 데이터 생성 (groups 테이블의 점수와 동기화)
      const { data: newProgress, error: createError } = await supabase
        .from('group_progress')
        .insert({
          group_id: group.id,
          current_corner_index: 0,
          completed_corners: [],
          total_score: group.score, // groups 테이블의 현재 점수로 초기화
        })
        .select()
        .single();

      if (createError) {
        console.error('진행 상황 생성 오류:', createError);
        return NextResponse.json(
          { success: false, message: '진행 상황 생성에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          groupId: parseInt(groupId),
          currentCornerIndex: newProgress.current_corner_index,
          completedCorners: newProgress.completed_corners,
          totalScore: group.score, // groups 테이블의 점수 사용
        },
      });
    }

    // groups 테이블의 점수와 동기화 확인
    const syncedTotalScore = group.score; // groups 테이블의 점수를 우선

    // group_progress 테이블의 점수가 다르면 동기화
    if (progress.total_score !== syncedTotalScore) {
      const { error: syncError } = await supabase
        .from('group_progress')
        .update({ total_score: syncedTotalScore })
        .eq('group_id', group.id);

      if (syncError) {
        console.error('점수 동기화 오류:', syncError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        groupId: parseInt(groupId),
        currentCornerIndex: progress.current_corner_index,
        completedCorners: progress.completed_corners,
        totalScore: syncedTotalScore, // 동기화된 점수 사용
      },
    });
  } catch (error) {
    console.error('진행 상황 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 조별 코너 진행 상황 업데이트
 * @param {NextRequest} request - 요청 객체 (진행 상황 데이터 포함)
 * @returns {NextResponse} 업데이트 결과 반환
 */
export async function POST(request: NextRequest) {
  try {
    const { groupId, currentCornerIndex, completedCorners, totalScore } =
      await request.json();

    // 필수 파라미터 검증
    if (
      !groupId ||
      currentCornerIndex === undefined ||
      !Array.isArray(completedCorners) ||
      totalScore === undefined
    ) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 그룹 존재 여부 확인
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('group_number', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, message: '해당 조를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 진행 상황 업데이트
    const { data: updatedProgress, error: updateError } = await supabase
      .from('group_progress')
      .upsert(
        {
          group_id: group.id,
          current_corner_index: currentCornerIndex,
          completed_corners: completedCorners,
          total_score: totalScore,
        },
        {
          onConflict: 'group_id',
        }
      )
      .select()
      .single();

    if (updateError) {
      console.error('진행 상황 업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, message: '진행 상황 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '진행 상황이 성공적으로 업데이트되었습니다.',
      data: {
        groupId: groupId,
        currentCornerIndex: updatedProgress.current_corner_index,
        completedCorners: updatedProgress.completed_corners,
        totalScore: updatedProgress.total_score,
      },
    });
  } catch (error) {
    console.error('진행 상황 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT: 특정 코너 완료 처리
 * @param {NextRequest} request - 요청 객체 (코너 완료 데이터 포함)
 * @returns {NextResponse} 완료 처리 결과 반환
 */
export async function PUT(request: NextRequest) {
  try {
    const { groupId, cornerId, score } = await request.json();

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
      .select('id')
      .eq('group_number', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, message: '해당 조를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 진행 상황 조회
    const { data: currentProgress, error: progressError } = await supabase
      .from('group_progress')
      .select('*')
      .eq('group_id', group.id)
      .single();

    if (progressError) {
      return NextResponse.json(
        { success: false, message: '진행 상황을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 완료된 코너 배열에 추가 (중복 방지)
    const completedCorners = currentProgress.completed_corners || [];
    if (!completedCorners.includes(cornerId)) {
      completedCorners.push(cornerId);
    }

    // 진행 상황 업데이트
    const { data: updatedProgress, error: updateError } = await supabase
      .from('group_progress')
      .update({
        current_corner_index: currentProgress.current_corner_index + 1,
        completed_corners: completedCorners,
        total_score: currentProgress.total_score + score,
      })
      .eq('group_id', group.id)
      .select()
      .single();

    if (updateError) {
      console.error('코너 완료 처리 오류:', updateError);
      return NextResponse.json(
        { success: false, message: '코너 완료 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '코너가 성공적으로 완료되었습니다.',
      data: {
        groupId: groupId,
        currentCornerIndex: updatedProgress.current_corner_index,
        completedCorners: updatedProgress.completed_corners,
        totalScore: updatedProgress.total_score,
      },
    });
  } catch (error) {
    console.error('코너 완료 처리 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
