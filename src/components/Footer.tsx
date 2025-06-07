
import { useState, useEffect } from "react";

const emojis = [
  { emoji: "☕", name: "coffee" },
  { emoji: "❤️", name: "heart" },
  { emoji: "🍺", name: "beer" },
  { emoji: "💡", name: "lightbulb" },
  { emoji: "🔧", name: "wrench" },
  { emoji: "⚡", name: "lightning" }
];

export default function Footer() {
  const [currentEmojiIndex, setCurrentEmojiIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentEmojiIndex((prev) => (prev + 1) % emojis.length);
        setIsAnimating(false);
      }, 150); // Half of animation duration
    }, 2000); // Change emoji every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const currentEmoji = emojis[currentEmojiIndex].emoji;

  return (
    <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
      <div className="space-y-1">
        <div>
          &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
        </div>
        <div>
          Built with{" "}
          <span className="inline-block">
            <span 
              className={`inline-block text-lg transition-all duration-300 ${
                isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
              }`} 
            >
              {currentEmoji}
            </span>
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
