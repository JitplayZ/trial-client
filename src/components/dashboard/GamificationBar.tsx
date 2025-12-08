import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, Sparkles } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { motion, AnimatePresence } from 'framer-motion';

const GamificationBar = () => {
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const [prevXP, setPrevXP] = useState(0);
  const { userXP, badges, progressXP, neededXP, getBadgeDisplayName, getBadgeIcon, loading } = useGamification();

  // Animate XP gain
  useEffect(() => {
    if (userXP.total_xp > prevXP && prevXP > 0) {
      setShowXPGain(true);
      setTimeout(() => setShowXPGain(false), 2000);
    }
    setPrevXP(userXP.total_xp);
  }, [userXP.total_xp, prevXP]);

  if (loading) {
    return (
      <Card className="glass-card mb-6 bg-card/50 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-4 bg-surface-hover rounded animate-pulse" />
            <div className="flex-1 h-2 bg-surface-hover rounded animate-pulse" />
            <div className="h-4 w-8 bg-surface-hover rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = neededXP > 0 ? (progressXP / neededXP) * 100 : 0;

  return (
    <>
      <Card className="glass-card mb-6 bg-card/50 backdrop-blur-xl border-border/50 relative overflow-hidden">
        {/* XP Gain Animation */}
        <AnimatePresence>
          {showXPGain && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-1 right-4 flex items-center gap-1 text-accent font-bold"
            >
              <Sparkles className="h-4 w-4" />
              <span>+XP!</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Level indicator */}
            <motion.div 
              className="flex items-center space-x-2 text-primary font-semibold"
              key={userXP.level}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
            >
              <Star className="h-5 w-5" />
              <span>Level {userXP.level}</span>
            </motion.div>

            {/* XP Progress bar */}
            <div className="flex-1">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>XP: {progressXP} / {neededXP}</span>
                <span>{userXP.total_xp} total</span>
              </div>
              <motion.div
                key={progressPercentage}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
              >
                <Progress value={progressPercentage} className="h-2" variant="gradient" />
              </motion.div>
            </div>

            {/* Badges */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBadgesModal(true)}
              className="flex items-center space-x-2 bg-surface/50 border-border/50 hover:bg-surface-hover"
            >
              <Trophy className="h-4 w-4" />
              <span>{badges.length}</span>
            </Button>

            {/* Streak placeholder */}
            <div className="flex items-center space-x-1 text-accent">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">-</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Modal */}
      <Dialog open={showBadgesModal} onOpenChange={setShowBadgesModal}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Your Achievements</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => (
                  <div key={index} className="text-center p-4 bg-surface/50 rounded-lg border border-border/50 backdrop-blur">
                    <div className="text-2xl mb-2">{getBadgeIcon(badge.badge_type)}</div>
                    <div className="font-medium text-sm">{getBadgeDisplayName(badge.badge_type)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground">No badges yet!</p>
                <p className="text-sm text-muted-foreground">Complete projects and actions to earn your first badge.</p>
              </div>
            )}

            {/* Available badges */}
            <div className="border-t border-border/50 pt-4">
              <h4 className="font-medium mb-3 text-sm text-foreground">Available Badges</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'first_project', name: 'First Project' },
                  { type: 'level_5', name: 'Level 5' },
                  { type: 'referral_success', name: 'Referral' },
                  { type: 'daily_streak_7', name: '7 Day Streak' },
                  { type: 'xp_5000', name: '5000 XP' },
                  { type: 'level_10', name: 'Level 10' }
                ].map((availableBadge) => {
                  const earned = badges.find(b => b.badge_type === availableBadge.type);
                  return (
                    <div key={availableBadge.type} className={`text-center p-2 rounded ${earned ? 'bg-accent/10 border border-accent/20' : 'bg-surface/30 border border-border/30'}`}>
                      <div className={`text-lg ${earned ? '' : 'grayscale opacity-50'}`}>
                        {getBadgeIcon(availableBadge.type)}
                      </div>
                      <div className="text-xs">{availableBadge.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GamificationBar;