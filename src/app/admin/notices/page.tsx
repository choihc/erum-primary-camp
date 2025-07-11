'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import {
  ArrowLeft,
  Bell,
  Plus,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Send,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
    loadNotices();
  }, []);

  /**
   * checkAuthentication: 관리자 인증 확인
   */
  const checkAuthentication = () => {
    const sessionData = localStorage.getItem('adminSession');
    if (!sessionData) {
      router.push('/admin');
      return;
    }

    try {
      const { expiry } = JSON.parse(sessionData);
      const now = new Date().getTime();

      if (now >= expiry) {
        localStorage.removeItem('adminSession');
        router.push('/admin');
        return;
      }
    } catch {
      localStorage.removeItem('adminSession');
      router.push('/admin');
    }
  };

  /**
   * loadNotices: 공지사항 목록 로드
   */
  const loadNotices = async () => {
    try {
      setLoadingNotices(true);
      const response = await fetch('/api/notices');
      if (!response.ok) {
        throw new Error('공지사항을 불러오는 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingNotices(false);
    }
  };

  /**
   * handleSubmit: 공지사항 등록 처리
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          author: 'admin',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '공지사항 등록에 실패했습니다.');
      }

      setSuccess('공지사항이 성공적으로 등록되었습니다!');
      setTitle('');
      setContent('');

      // 등록 후 목록 새로고침
      await loadNotices();

      // 성공 메시지 3초 후 자동 숨김
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('공지사항 등록 오류:', error);
      setError(
        error instanceof Error
          ? error.message
          : '공지사항 등록 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * isNewNotice: 최신 공지사항 여부 확인 (7일 이내)
   * @param {string} createdAt - 생성일시
   * @returns {boolean} 최신 공지사항 여부
   */
  const isNewNotice = (createdAt: string): boolean => {
    const noticeDate = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - noticeDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  /**
   * formatDate: 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷된 날짜
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * handleEdit: 수정 모드 시작
   * @param {Notice} notice - 수정할 공지사항
   */
  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setEditTitle(notice.title);
    setEditContent(notice.content);
    setError('');
    setSuccess('');
  };

  /**
   * handleCancelEdit: 수정 취소
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setError('');
  };

  /**
   * handleUpdateSubmit: 수정 제출
   */
  const handleUpdateSubmit = async () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/notices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '공지사항 수정에 실패했습니다.');
      }

      setSuccess('공지사항이 성공적으로 수정되었습니다!');
      setEditingId(null);
      setEditTitle('');
      setEditContent('');

      // 수정 후 목록 새로고침
      await loadNotices();

      // 성공 메시지 3초 후 자동 숨김
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('공지사항 수정 오류:', error);
      setError(
        error instanceof Error
          ? error.message
          : '공지사항 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleDeleteClick: 삭제 버튼 클릭
   * @param {number} noticeId - 삭제할 공지사항 ID
   */
  const handleDeleteClick = (noticeId: number) => {
    setDeleteNoticeId(noticeId);
    setDeleteDialogOpen(true);
  };

  /**
   * handleDeleteConfirm: 삭제 확인
   */
  const handleDeleteConfirm = async () => {
    if (!deleteNoticeId) return;

    try {
      setDeleteLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/notices?id=${deleteNoticeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '공지사항 삭제에 실패했습니다.');
      }

      setSuccess('공지사항이 성공적으로 삭제되었습니다!');
      setDeleteDialogOpen(false);
      setDeleteNoticeId(null);

      // 삭제 후 목록 새로고침
      await loadNotices();

      // 성공 메시지 3초 후 자동 숨김
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('공지사항 삭제 오류:', error);
      setError(
        error instanceof Error
          ? error.message
          : '공지사항 삭제 중 오류가 발생했습니다.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * handleDeleteCancel: 삭제 취소
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteNoticeId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/main">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-purple-800">
                공지사항 관리
              </h1>
            </div>
          </div>
        </div>

        {/* 공지사항 등록 폼 */}
        <Card className="mb-8 border-purple-200 bg-white/80">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center">
              <Plus className="h-5 w-5 mr-2" />새 공지사항 등록
            </CardTitle>
            <CardDescription>
              교사들에게 전달할 공지사항을 작성해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-purple-700 mb-2"
                >
                  제목
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/200자
                </p>
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-purple-700 mb-2"
                >
                  내용
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지사항 내용을 입력하세요"
                  className="w-full min-h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">{content.length}자</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    등록 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    공지사항 등록
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 등록된 공지사항 목록 */}
        <Card className="border-purple-200 bg-white/80">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              등록된 공지사항
            </CardTitle>
            <CardDescription>현재 등록된 공지사항 목록입니다</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingNotices ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-purple-600">공지사항을 불러오는 중...</p>
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-600 text-lg">
                  등록된 공지사항이 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => {
                  const isNew = isNewNotice(notice.created_at);
                  const isEditing = editingId === notice.id;

                  return (
                    <Card
                      key={notice.id}
                      className={`border transition-all ${
                        isNew
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    제목
                                  </label>
                                  <Input
                                    value={editTitle}
                                    onChange={(e) =>
                                      setEditTitle(e.target.value)
                                    }
                                    placeholder="제목을 입력하세요"
                                    maxLength={200}
                                    className="w-full"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {editTitle.length}/200자
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    내용
                                  </label>
                                  <textarea
                                    value={editContent}
                                    onChange={(e) =>
                                      setEditContent(e.target.value)
                                    }
                                    placeholder="내용을 입력하세요"
                                    className="w-full min-h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                                    rows={4}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {editContent.length}자
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={handleUpdateSubmit}
                                    disabled={loading}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    {loading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                                        저장 중...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-3 w-3 mr-2" />
                                        저장
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    size="sm"
                                    disabled={loading}
                                  >
                                    <X className="h-3 w-3 mr-2" />
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center space-x-2 mb-2">
                                  <CardTitle className="text-lg text-gray-800">
                                    {notice.title}
                                  </CardTitle>
                                  {isNew && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                                      최신
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="flex items-center space-x-4 text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{notice.author}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(notice.created_at)}</span>
                                  </div>
                                </CardDescription>
                              </>
                            )}
                          </div>
                          {!isEditing && (
                            <div className="flex space-x-2 ml-4">
                              <Button
                                onClick={() => handleEdit(notice)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 border-blue-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(notice.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {!isEditing && (
                        <CardContent className="pt-0">
                          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {notice.content}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="공지사항 삭제"
        description="정말로 이 공지사항을 삭제하시겠습니까?"
        isLoading={deleteLoading}
      />
    </div>
  );
}
