export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Design System Generator
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Transform design briefs into production-ready design systems with AI
        </p>
        <div className="flex justify-center">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
