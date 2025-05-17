
import { CalendarDays, Plus, Github } from "lucide-react";

const upcomingEvents = [
  {
    title: "Salt Lake Tech Meetup",
    date: "2025-06-01",
    location: "Kiln, Salt Lake City",
    link: "#",
  },
  {
    title: "AI Utah Conference",
    date: "2025-06-15",
    location: "University of Utah",
    link: "#",
  },
  {
    title: "Women Who Code SLC",
    date: "2025-07-12",
    location: "Impact Hub SLC",
    link: "#",
  },
];

const Index = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1F2C] to-[#23283B]">

    {/* NAVBAR */}
    <nav className="w-full flex justify-between items-center px-4 py-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="text-primary w-8 h-8" />
        <span className="text-xl font-extrabold tracking-tight text-white">Utah Dev Events</span>
      </div>
      <a
        href="https://github.com/ForgeUtahFoundation"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white story-link"
        aria-label="Forge Utah Foundation Github"
      >
        <Github className="w-5 h-5" />
        <span>GitHub</span>
      </a>
    </nav>

    {/* HERO SECTION */}
    <section className="flex flex-col items-center text-center mt-8 mb-12">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
        Discover & Share <span className="bg-gradient-to-r from-indigo-400 to-primary bg-clip-text text-transparent">Tech Events</span> in Utah
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-6">
        The Utah Developer Community Calendar – your source for all <span className="text-primary font-semibold">technology events</span> across Utah. 
        Powered by <span className="text-white font-bold">Forge Utah Foundation</span>.
      </p>
      <button
        className="group flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-semibold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-fade-in"
      >
        <Plus className="w-5 h-5" />
        Add Event
      </button>
    </section>

    {/* UPCOMING EVENTS PREVIEW */}
    <section className="flex flex-col items-center flex-1 mb-10">
      <div className="card-gradient max-w-3xl w-full p-6 shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
          <CalendarDays className="w-6 h-6 text-primary" />
          Upcoming Events
        </h2>
        <div className="divide-y divide-border">
          {upcomingEvents.map((event, i) => (
            <a
              key={i}
              className="group flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-4 px-2 hover:bg-white/5 rounded-lg transition-all story-link"
              href={event.link}
            >
              <span className="font-medium text-white">{event.title}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &mdash; {event.location}
              </span>
            </a>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <a href="#" className="text-primary text-sm story-link">See full calendar &rarr;</a>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
      <span>
        &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
      </span>
    </footer>
  </div>
);

export default Index;
