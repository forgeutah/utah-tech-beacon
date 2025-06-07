
export default function Footer() {
  return (
    <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
      <span>
        Built with Love by volunteers of{" "}
        <a 
          href="https://forgeutah.tech" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Forge Utah Foundation
        </a>
      </span>
    </footer>
  );
}
