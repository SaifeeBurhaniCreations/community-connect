import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function Layout({ children, title, showBack, onBack, rightAction }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-40 glass border-b border-border/50 safe-top">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              {showBack && (
                <button
                  onClick={onBack}
                  className="touch-target flex items-center justify-center -ml-2"
                >
                  <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
            </div>
            {rightAction && <div>{rightAction}</div>}
          </div>
        </header>
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 pb-20 overflow-y-auto"
      >
        {children}
      </motion.main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
