
import { Heart, Beer, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const icons = [
  { Icon: Heart, color: "text-red-500" },
  { Icon: Beer, color: "text-amber-500" },
  { Icon: Zap, color: "text-yellow-500" }
];

export default function Footer() {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIconIndex((prev) => (prev + 1) % icons.length);
        setIsAnimating(false);
      }, 150); // Half of animation duration
    }, 2000); // Change icon every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = icons[currentIconIndex].Icon;
  const iconColor = icons[currentIconIndex].color;

  return (
    <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
      <div className="space-y-1">
        <div>
          &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
        </div>
        <div>
          Built with{" "}
          <span className="inline-block">
            <CurrentIcon 
              className={`inline w-4 h-4 ${iconColor} transition-all duration-300 ${
                isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
              }`} 
            />
          </span>
          {" "}by volunteers of{" "}
          <a 
            href="https://forgeutah.tech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Forge Utah Foundation
          </a>
        </div>
      </div>
    </footer>
  );
}
