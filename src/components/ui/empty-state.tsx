'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  primaryAction: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
}

export function EmptyState({ illustration, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="mb-6">{illustration}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      <div className="flex gap-3">
        <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
        )}
      </div>
    </motion.div>
  );
}
