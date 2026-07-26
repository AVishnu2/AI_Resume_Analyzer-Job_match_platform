import React from 'react';
import { motion } from 'framer-motion';

// --- Card Components ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glassmorphism?: boolean;
}

export function Card({
  className = '',
  hoverEffect = false,
  glassmorphism = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-white/10 ${
        glassmorphism ? 'bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl shadow-md dark:shadow-soft' : 'bg-white dark:bg-slate-900 shadow-lg'
      } p-6 transition duration-300 ${
        hoverEffect ? 'hover:border-indigo-400/40 dark:hover:border-white/20 hover:shadow-xl' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-xl font-semibold tracking-tight text-slate-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

// --- Form Input Components ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-brand-500 dark:focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export function Label({ className = '', children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </label>
  );
}

// --- Button Components ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantStyles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-md',
    gradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-95 shadow-md shadow-purple-500/25',
    secondary: 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/15 hover:text-slate-900 dark:hover:text-white',
    outline: 'border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// --- Circular Gauge Indicator ---
interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  label?: string;
}

export function Gauge({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  colorClass = 'text-brand-500',
  label = '',
}: GaugeProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="text-slate-200 dark:text-slate-800"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Circle */}
        <motion.circle
          className={colorClass}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Centered Score */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}%</span>
        {label && <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>}
      </div>
    </div>
  );
}

// --- Linear Progress Bar ---
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  colorClass?: string;
}

export function Progress({ value, colorClass = 'bg-brand-500', className = '', ...props }: ProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 ${className}`} {...props}>
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

// --- Skeleton Loading Components ---
export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/60 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <Card className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

// --- Badges ---
export function Badge({
  className = '',
  variant = 'brand',
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'brand' | 'success' | 'warning' | 'error' | 'gray' }) {
  const styles = {
    brand: 'bg-brand-500/15 text-brand-700 dark:text-brand-200 border-brand-500/30',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    gray: 'bg-slate-200 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500/15',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
