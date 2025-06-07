
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
      <div className="space-y-1">
        <div>
          &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
        </div>
        <div>
          Built with <Heart className="inline w-4 h-4 text-red-500" /> by volunteers of{" "}
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
