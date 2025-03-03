import { ReactNode } from 'react';

export interface Toast {
  id?: string;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  variant?: 'default' | 'destructive';
}

export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: ReactNode;
}

export const useToast = () => {
  const toast = (props: Toast) => {
    // 開発用の簡易実装: コンソールに出力し、必要に応じてalertを表示
    console.log('Toast:', props);
    
    if (props.variant === 'destructive') {
      alert(`${props.title}: ${props.description}`);
    }
  };

  return {
    toast,
  };
}; 