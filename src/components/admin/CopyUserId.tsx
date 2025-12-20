import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      <span className="text-xs font-mono text-muted-foreground">
        {userId.slice(0, 8)}...
      </span>
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
