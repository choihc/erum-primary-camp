import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneLinkProps {
  phoneNumber: string;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function PhoneLink({
  phoneNumber,
  className,
  children,
  showIcon = false,
}: PhoneLinkProps) {
  // 전화번호에서 숫자와 +만 추출 (tel: 링크용)
  const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

  // 한국 번호의 경우 +82로 시작하도록 변환
  const telLink = cleanPhoneNumber.startsWith('010')
    ? `tel:+82${cleanPhoneNumber.substring(1)}`
    : cleanPhoneNumber.startsWith('+82')
    ? `tel:${cleanPhoneNumber}`
    : `tel:${cleanPhoneNumber}`;

  return (
    <a
      href={telLink}
      className={cn(
        'inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors',
        className
      )}
    >
      {showIcon && <Phone className="h-4 w-4" />}
      <span>{children || phoneNumber}</span>
    </a>
  );
}
