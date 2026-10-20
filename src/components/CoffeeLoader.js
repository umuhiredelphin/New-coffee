import React from "react";
import logoImage from "../assets/logo.png";

const messages = [
  "Brewing your experience",
  "Preparing your coffee",
  "Warming up the cups",
  "Grinding fresh beans",
  "Steaming the milk",
  "Crafting perfection",
  "Pouring your favorite",
  "Almost ready..."
];

function CoffeeLoader({ message, fullScreen = true, showNav = false }) {
  const msg = message || messages[Math.floor(Math.random() * messages.length)];

  const content = (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950">
      <div className="relative flex flex-col items-center">
        <div className="relative animate-fade-in">
          <img
            src={logoImage}
            alt="F&F Coffee"
            className="w-28 sm:w-32 md:w-36 h-auto object-contain animate-pulse-soft drop-shadow-[0_0_30px_rgba(212,168,83,0.15)]"
          />
        </div>
        <div className="mt-8 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-loading-dot" style={{ animationDelay: "0s" }} />
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-loading-dot" style={{ animationDelay: "0.3s" }} />
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-loading-dot" style={{ animationDelay: "0.6s" }} />
        </div>
        <p className="mt-6 text-gold-400/70 text-xs font-medium tracking-[0.2em] uppercase animate-pulse">
          {msg}
        </p>
      </div>
    </div>
  );

  if (fullScreen) return content;

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950">
      {content}
    </div>
  );
}

export default CoffeeLoader;
