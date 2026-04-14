import React from 'react';

const joinClasses = (...parts: Array<string | undefined | false>) => {
  return parts.filter(Boolean).join(' ');
};

type CardTone = 'surface' | 'muted' | 'dark';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const CARD_TONE_CLASS: Record<CardTone, string> = {
  surface: 'bg-white/[0.03] border-white/[0.08]',
  muted: 'bg-white/[0.02] border-white/[0.07]',
  dark: 'bg-black/20 border-white/10',
};

const CARD_PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: CardPadding;
  rounded?: 'xl' | '2xl';
}

export const AdminCard: React.FC<AdminCardProps> = ({
  tone = 'surface',
  padding = 'md',
  rounded = 'xl',
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={joinClasses(
        'border',
        CARD_TONE_CLASS[tone],
        CARD_PADDING_CLASS[padding],
        rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'rose'
  | 'ghost';

type ButtonSize = 'chip' | 'sm' | 'md';

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-1.5 border transition disabled:opacity-40 disabled:cursor-not-allowed';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'border-orange-500/35 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25',
  secondary: 'border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.04]',
  danger: 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
  ghost: 'border-white/15 text-white/70 hover:text-white/90 hover:border-white/25',
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  chip: 'px-2 py-1 rounded-md text-[10px] font-bold',
  sm: 'px-3 py-2 rounded-lg text-xs font-medium',
  md: 'px-4 py-2 rounded-lg text-sm font-bold',
};

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'secondary',
  size = 'sm',
  fullWidth,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={joinClasses(
        BUTTON_BASE_CLASS,
        BUTTON_VARIANT_CLASS[variant],
        BUTTON_SIZE_CLASS[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

type BadgeTone = 'orange' | 'premium' | 'neutral' | 'success' | 'danger';

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  orange: 'text-orange-300 border-orange-500/25 bg-orange-500/10',
  premium: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  neutral: 'text-white/75 border-white/20 bg-white/5',
  success: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  danger: 'text-red-300 border-red-500/30 bg-red-500/10',
};

interface AdminBadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ tone = 'neutral', className, children }) => {
  return (
    <span
      className={joinClasses(
        'inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border',
        BADGE_TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
};

interface AdminStatCardProps {
  title: string;
  value: string | number;
  caption: string;
  valueClassName?: string;
  loading?: boolean;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  caption,
  valueClassName,
  loading,
}) => {
  return (
    <AdminCard>
      <p className="text-white/45 text-xs uppercase tracking-wider">{title}</p>
      <p className={joinClasses('text-2xl font-black mt-1 text-white', valueClassName)}>{loading ? '...' : value}</p>
      <p className="text-white/35 text-xs mt-1">{caption}</p>
    </AdminCard>
  );
};

interface AdminSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'primary' | 'neutral';
}

export const AdminSpinner: React.FC<AdminSpinnerProps> = ({ size = 'md', tone = 'primary' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const toneClass = tone === 'primary' ? 'border-orange-500/30 border-t-orange-500' : 'border-white/30 border-t-white';

  return <span className={joinClasses('border-2 rounded-full animate-spin', sizeClass, toneClass)} />;
};
