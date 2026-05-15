import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: any;
  size?: any;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  glowEffect?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant,
  size,
  className = '',
  disabled = false,
  type = 'button',
  glowEffect = false
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={onClick}
        variant={variant}
        size={size}
        disabled={disabled}
        type={type}
        className={`transition-all duration-300 ${
          glowEffect && !disabled ? 'hover:shadow-lg hover:shadow-orange-500/50' : ''
        } ${className}`}
      >
        {children}
      </Button>
    </motion.div>
  );
}
