import * as React from "react";

export const CardWatermark = () => (
  <div 
    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" 
    aria-hidden="true"
  >
    <span className="text-sm font-bold text-primary/[0.06] tracking-widest uppercase">
      LighterDash.lol
    </span>
  </div>
);
