import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { SocialCooldownState } from "@/hooks/useSocialCooldown";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function getCooldownParts(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { days, hours, minutes };
}

interface SocialRewardCooldownProps {
  /** Backend response from get_social_reward_cooldown */
  cooldown: SocialCooldownState | null;
  label?: string;
}

/**
 * Renders a server-time-based cooldown countdown for social rewards.
 * Uses backend-provided ms_remaining + cooldown_end so it's accurate across devices.
 */
export function SocialRewardCooldown({
  cooldown,
  label = "Next submission available in",
}: SocialRewardCooldownProps) {
  // Local tick to keep countdown live (only needed when in cooldown)
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!cooldown?.ms_remaining || cooldown.ms_remaining <= 0) return;
    const id = window.setInterval(() => {
      setOffset((prev) => prev + 60_000);
    }, 60_000);
    return () => window.clearInterval(id);
  }, [cooldown?.ms_remaining]);

  // Reset offset if cooldown object changes (e.g., refetch)
  useEffect(() => {
    setOffset(0);
  }, [cooldown?.cooldown_end]);

  if (!cooldown) return null;

  const { ms_remaining, cooldown_end, allowed, reason } = cooldown;

  // No cooldown data or fully allowed = render nothing (caller can handle form)
  if (ms_remaining === null || cooldown_end === null) {
    if (!allowed) {
      // Pending request or first-time – show reason but no countdown
      return (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">{reason}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const adjusted = Math.max(0, ms_remaining - offset);
  const eligibleNow = adjusted <= 0;
  const { days, hours, minutes } = getCooldownParts(adjusted);

  const eligibleDate = new Date(cooldown_end);

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">
          {eligibleNow ? "You can submit again now" : label}
        </p>
      </div>

      {!eligibleNow && (
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <p className="text-2xl font-bold text-primary tabular-nums">
            {days > 0 ? `${days}d` : `${hours}h`} {days > 0 ? `${pad2(hours)}h` : `${pad2(minutes)}m`}
          </p>
          <p className="text-xs text-muted-foreground">remaining</p>
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground text-center">
        Eligible on {eligibleDate.toLocaleString()}
      </p>
    </div>
  );
}

