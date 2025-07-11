import { NextResponse } from 'next/server';

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'SET'
        : 'NOT_SET',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'SET'
        : 'NOT_SET',
      TEACHER_AUTH_CODE: process.env.TEACHER_AUTH_CODE ? 'SET' : 'NOT_SET',
      ADMIN_AUTH_CODE: process.env.ADMIN_AUTH_CODE ? 'SET' : 'NOT_SET',
    },
    apis: [
      'GET /api/debug',
      'GET /api/test-connection',
      'POST /api/auth/admin',
      'POST /api/auth/teacher',
      'GET /api/groups',
      'POST /api/groups',
      'DELETE /api/groups',
      'GET /api/group-members',
      'POST /api/group-members',
      'PUT /api/group-members',
      'DELETE /api/group-members',
    ],
    pages: [
      '/ - 메인 페이지',
      '/admin - 관리자 인증',
      '/admin/main - 관리자 대시보드',
      '/admin/groups - 조 관리',
      '/t - 교사 인증',
      '/t/main - 교사 대시보드',
      '/s - 학생 페이지',
    ],
  };

  return NextResponse.json(debugInfo);
}
