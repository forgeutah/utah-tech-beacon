
export default function Footer() {
  return (
    <footer className="w-full text-center py-6 text-muted-foreground text-sm border-t border-border mt-auto">
      <span>
        &copy; {new Date().getFullYear()} Forge Utah Foundation. Empowering Utah's developer community.
      </span>
    </footer>
  );
}
