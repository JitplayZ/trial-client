import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";

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

export function SocialRewardCooldown({
  lastRewardAt,
  cooldownDays = 7,
  label = "Next submission available in",
}: {
  lastRewardAt: string | null | undefined;
  cooldownDays?: number;
  label?: string;
}) {
  const nextEligibleAt = useMemo(() => {
    if (!lastRewardAt) return null;
    const last = new Date(lastRewardAt);
    if (Number.isNaN(last.getTime())) return null;
    return new Date(last.getTime() + cooldownDays * 24 * 60 * 60 * 1000);
  }, [lastRewardAt, cooldownDays]);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Tick every minute to keep UI fresh without being noisy.
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!nextEligibleAt) return null;

  const msRemaining = nextEligibleAt.getTime() - now.getTime();
  const eligibleNow = msRemaining <= 0;
  const { days, hours, minutes } = getCooldownParts(msRemaining);

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
        Eligible on {nextEligibleAt.toLocaleString()}
      </p>
    </div>
  );
}
