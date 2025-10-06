import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'gradient';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, showLabel = false, label, variant = 'default', ...props }, ref) => {
  const isComplete = value === 100;
  
  const variantStyles = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    gradient: 'bg-gradient-primary'
  };

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground" aria-live="polite">
            {label || 'Progress'}
          </span>
          <span className="text-foreground font-medium">
            {isComplete ? (
              <span className="flex items-center gap-1 text-success">
                <Check className="h-3 w-3" />
                Complete
              </span>
            ) : (
              `${Math.round(value || 0)}%`
            )}
          </span>
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-muted/30 backdrop-blur-sm border border-border/20",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
            variantStyles[variant],
            isComplete && "animate-pulse"
          )}
          style={{ 
            transform: `translateX(-${100 - (value || 0)}%)`,
            boxShadow: value && value > 0 ? '0 0 12px hsl(var(--primary) / 0.4)' : 'none'
          }}
        />
        {/* Shimmer effect for indeterminate state */}
        {value === undefined && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" 
               style={{ backgroundSize: '200% 100%' }} 
          />
        )}
      </ProgressPrimitive.Root>
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
