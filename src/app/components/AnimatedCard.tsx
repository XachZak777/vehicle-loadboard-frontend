import { motion } from 'motion/react';
import { Card } from './ui/card';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  hoverEffect?: boolean;
}

export function AnimatedCard({ children, delay = 0, className = '', hoverEffect = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      <Card className={`transition-all duration-300 ${hoverEffect ? 'hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-400 dark:hover:border-orange-500' : ''} ${className}`}>
        {children}
      </Card>
    </motion.div>
  );
}
