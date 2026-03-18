import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      <header className="border-b border-white/40 bg-gradient-to-r from-orange-50 via-rose-50 to-amber-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/postpilot-logo.png"
              alt="PostPilot - Auto Social Scheduler"
              width={180}
              height={60}
              sizes="(max-width: 640px) 160px, 192px"
              className="h-10 w-auto sm:h-11 object-contain"
              priority
            />
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative flex items-center justify-center px-4 py-12 sm:py-20">
          <div className="container mx-auto flex flex-col items-center text-center max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-1 text-xs font-medium shadow-sm backdrop-blur">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-[10px] font-semibold">
                New
              </span>
              <span className="text-xs text-slate-700">
                AI-powered social media done for you
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
                The AI that runs your
                <br className="hidden sm:block" /> social media for you.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
                PostPilot plans, writes, schedules, and posts for you across
                all your social channels. We keep your brand voice consistent,
                your calendar full, and your audience engaged while you focus
                on actually running your business.
              </p>
            </div>

            <div className="w-full max-w-xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 bg-white/80 backdrop-blur rounded-full shadow-lg shadow-orange-300/40 px-3 py-2 sm:py-3 items-stretch sm:items-center">
                <input
                  type="text"
                  placeholder="Enter your brand or business handle"
                  className="flex-1 bg-transparent outline-none border-none px-3 text-sm sm:text-base placeholder:text-slate-400"
                />
                <Link href="/register" className="shrink-0">
                  <Button className="rounded-full px-6 sm:px-8 text-sm sm:text-base">
                    Get my social plan
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Built for founders, marketers, and agencies who need a
                consistent social presence without hiring a full team.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-slate-600">
                Loved by modern brands and creators
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-700/80">
                <span>Solo founders</span>
                <span className="hidden sm:inline">•</span>
                <span>Coaching & info products</span>
                <span className="hidden sm:inline">•</span>
                <span>E‑commerce brands</span>
                <span className="hidden sm:inline">•</span>
                <span>Agencies & social media managers</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
