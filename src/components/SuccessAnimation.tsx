import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { CheckCircle2, TrendingUp, Trophy } from 'lucide-react';

interface SuccessAnimationProps {
  trigger: boolean;
  type?: 'milestone' | 'profit' | 'achievement';
  message?: string;
  onComplete?: () => void;
}

export const SuccessAnimation = ({ 
  trigger, 
  type = 'milestone', 
  message,
  onComplete 
}: SuccessAnimationProps) => {
  const [show, setShow] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!show) return null;

  const icons = {
    milestone: CheckCircle2,
    profit: TrendingUp,
    achievement: Trophy,
  };

  const Icon = icons[type];

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
        colors={['hsl(142, 76%, 36%)', 'hsl(270, 60%, 40%)', 'hsl(0, 72%, 51%)', 'hsl(210, 100%, 50%)']}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="animate-in zoom-in-50 fade-in duration-500">
          <div className="bg-card border-2 border-primary rounded-2xl p-8 shadow-2xl max-w-md mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                  <Icon className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {type === 'milestone' && 'Milestone Reached!'}
                  {type === 'profit' && 'Great Trade!'}
                  {type === 'achievement' && 'Achievement Unlocked!'}
                </h3>
                {message && (
                  <p className="text-muted-foreground">{message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Hook to trigger success animations based on conditions
export const useSuccessAnimation = () => {
  const [animation, setAnimation] = useState<{
    trigger: boolean;
    type: 'milestone' | 'profit' | 'achievement';
    message: string;
  }>({
    trigger: false,
    type: 'milestone',
    message: '',
  });

  const celebrate = (type: 'milestone' | 'profit' | 'achievement', message: string) => {
    setAnimation({ trigger: true, type, message });
  };

  const reset = () => {
    setAnimation({ trigger: false, type: 'milestone', message: '' });
  };

  return { animation, celebrate, reset };
};
