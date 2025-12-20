import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyUserIdProps {
  userId: string;
}

export const CopyUserId = ({ userId }: CopyUserIdProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      toast.success("User ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs font-mono text-muted-foreground cursor-default">
              {userId.slice(0, 8)}...
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span className="font-mono text-xs">{userId}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 p-0 hover:bg-muted"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-accent" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground" />
        )}
      </Button>
    </span>
  );
};
