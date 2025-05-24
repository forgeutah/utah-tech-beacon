
import { CalendarDays, Github } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center px-4 py-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="text-primary w-8 h-8" />
        <span className="text-xl font-extrabold tracking-tight text-white">
          Utah Dev Events
        </span>
      </div>
      <div className="flex items-center gap-5">
        <a
          href="https://github.com/forgeutah"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-white story-link"
          aria-label="Forge Utah Foundation Github"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </nav>
  );
}
