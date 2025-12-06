import { useState } from "react";
import { X, Sparkles, Gift, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const REFERRAL_LINK = "https://app.lighter.xyz/?referral=LIGHTERDASH";

export const ReferralPromoModal = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    window.open(REFERRAL_LINK, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl shadow-primary/10">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {/* Header with icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Support LighterDash
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
            Love using LighterDash? Help us keep building by signing up to{" "}
            <span className="text-primary font-semibold">Lighter</span> using our referral link. 
            It's free and helps us continue developing new features!
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["Zero Cost", "Support Development", "Get Trading"].map((benefit) => (
              <span
                key={benefit}
                className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {benefit}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
          >
            <span>Open Lighter</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            Click the X to close and continue to LighterDash
          </p>
        </div>
      </div>
    </div>
  );
};
