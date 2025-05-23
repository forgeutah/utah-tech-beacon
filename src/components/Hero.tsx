
export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center mt-8 mb-12">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
        Discover &amp; Share{" "}
        <span className="bg-gradient-to-r from-indigo-400 to-primary bg-clip-text text-transparent">
          Tech Events
        </span>{" "}
        in Utah
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-6">
        The Utah Developer Community Calendar – your source for all{" "}
        <span className="text-primary font-semibold">technology events</span>{" "}
        across Utah. Powered by{" "}
        <span className="text-white font-bold">Forge Utah Foundation</span>.
      </p>
    </section>
  );
}
