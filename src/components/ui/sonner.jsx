import { Toaster as Sonner } from 'sonner';

/**
 * shadcn Sonner 토스트 (전역 스낵바). <Toaster /> 한 번만 앱에 마운트.
 * 사용: import { toast } from 'sonner'; toast.success('메시지');
 */
export function Toaster(props) {
  return (
    <Sonner
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}
