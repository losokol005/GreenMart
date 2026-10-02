import { Toaster as Sonner } from 'sonner';

export const Toaster = (props) => (
  <Sonner
    position="bottom-right"
    toastOptions={{
      classNames: {
        toast: 'group toast !border-border !bg-card !text-foreground !shadow-lg !rounded-md',
        description: '!text-muted-foreground',
        actionButton: '!bg-primary !text-white',
      },
    }}
    {...props}
  />
);
