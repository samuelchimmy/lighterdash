import { useState } from "react";
import { X, Gift, ExternalLink } from "lucide-react";
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
      <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/10">
        {/* Decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="relative p-5">
          {/* Header with icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
              <div className="relative p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Gift className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Support LighterDash
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground mb-4 text-xs leading-relaxed">
            Love using LighterDash? Help us keep building by signing up to{" "}
            <span className="text-primary font-semibold">Lighter</span> using our referral link.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {["Zero Cost", "Support Us", "Get Trading"].map((benefit) => (
              <span
                key={benefit}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {benefit}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            size="sm"
            className="w-full h-9 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
          >
            <span>Open Lighter</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>

          {/* Footer note */}
          <p className="text-center text-[10px] text-muted-foreground/60 mt-3">
            Click X to close
          </p>
        </div>
      </div>
    </div>
  );
};
