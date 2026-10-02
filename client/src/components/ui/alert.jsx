import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border p-4 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg~*]:pl-7', {
  variants: {
    variant: {
      default: 'border-border bg-card text-foreground',
      destructive: 'border-destructive/40 bg-destructive/5 text-destructive',
      success: 'border-primary/40 bg-accent text-foreground [&>svg]:text-primary',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';
export const AlertTitle = ({ className, ...props }) => <p className={cn('mb-1 font-semibold leading-none', className)} {...props} />;
export const AlertDescription = ({ className, ...props }) => <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
