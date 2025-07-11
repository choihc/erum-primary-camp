/**
 * 파일명: delete-confirm-dialog.tsx
 * 목적: 삭제 확인 다이얼로그 컴포넌트
 * 역할: 공지사항 삭제 전 확인 모달 제공
 * 작성일: 2024-12-30
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '삭제 확인',
  description = '정말로 삭제하시겠습니까?',
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">{description}</p>
          <p className="text-sm text-red-600 mt-2">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
