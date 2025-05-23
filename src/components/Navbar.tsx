
import { CalendarDays, Github, Plus } from "lucide-react";
import { useState } from "react";
import AddEventModal from "@/components/AddEventModal";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
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
          <button
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-semibold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-fade-in"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>
      </nav>
      
      <AddEventModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
