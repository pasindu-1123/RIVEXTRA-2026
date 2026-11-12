import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Fingerprint,
  Link2,
  Palette,
  QrCode,
  ScanLine,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import Reveal from "./components/Reveal";
import MobileMenu from "./components/MobileMenu";
import CardPreview from "./create/CardPreview";

/* ---------- Fake (sample) QR code ----------
   Illustration ekak witharai. Scan karanna bari, hari dewal enne naha. */
function buildFakeQr() {
  const N = 29;
  const grid = Array.from({ length: N }, () => Array(N).fill(false));
  const reserved = Array.from({ length: N }, () => Array(N).fill(false));

  let seed = 2026;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const inBounds = (x, y) => x >= 0 && y >= 0 && x < N && y < N;

  // 3 finder patterns
  const finder = (fx, fy) => {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const gx = fx + dx;
        const gy = fy + dy;
        if (!inBounds(gx, gy)) continue;
        reserved[gy][gx] = true;
        grid[gy][gx] = false;
      }
    }
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        grid[fy + dy][fx + dx] = edge || core;
      }
    }
  };
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);

  // timing patterns
  for (let i = 8; i < N - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // alignment pattern
  const ac = 22;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      grid[ac + dy][ac + dx] = d !== 1;
      reserved[ac + dy][ac + dx] = true;
    }
  }

  // random data modules
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!reserved[y][x]) grid[y][x] = rnd() > 0.5;
    }
  }

  // svg path (row runs)
  let path = "";
  for (let y = 0; y < N; y++) {
    let x = 0;
    while (x < N) {
      if (grid[y][x]) {
        let len = 1;
        while (x + len < N && grid[y][x + len]) len++;
        path += `M${x} ${y}h${len}v1h-${len}z`;
        x += len;
      } else {
        x++;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${N + 2} ${N + 2}" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${N + 2}" height="${N + 2}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const FAKE_QR = buildFakeQr();

const sampleDetails = {
  name: "Student Name",
  grade: "12",
  school: "Your School Name",
  age: "",
  bmi: "",
};

const features = [
  {
    number: "01",
    icon: Fingerprint,
    title: "Your Digital Identity",
    description:
      "Bring your personal information together in one clean, accessible digital profile.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "One Unique QR Code",
    description:
      "Share your profile through a single QR code that can be scanned using a phone camera.",
  },
  {
    number: "03",
    icon: Palette,
    title: "Designed to Stand Out",
    description:
      "Get a stylish digital card with a modern design that makes sharing your identity simple.",
  },
];

const steps = [
  {
    icon: UserRound,
    title: "Fill your details",
    text: "Add your name and the information you want to share.",
  },
  {
    icon: Sparkles,
    title: "Get your card",
    text: "Your stylish digital card is generated instantly.",
  },
  {
    icon: Share2,
    title: "Scan & share",
    text: "Anyone can scan your QR code and see your profile.",
  },
];

const marqueeItems = [
  { icon: QrCode, label: "Unique QR Code" },
  { icon: Zap, label: "Instant Creation" },
  { icon: Smartphone, label: "Works on Any Phone" },
  { icon: ShieldCheck, label: "You Choose What to Share" },
  { icon: Link2, label: "One Personal Link" },
  { icon: Palette, label: "Modern Card Design" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* NAVIGATION */}
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-black tracking-[0.14em] sm:text-2xl sm:tracking-[0.18em]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 sm:h-9 sm:w-9">
            <QrCode className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
          </span>
          <span>
            RIVE<span className="text-blue-500">XTRA</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-gray-300 md:flex">
          {[
            ["Home", "/"],
            ["Features", "#features"],
            ["How it works", "#how"],
            ["About", "#about"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="group relative py-1 transition hover:text-blue-400"
            >
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/create"
            className="primary-button inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold sm:px-5 sm:py-3"
          >
            <Sparkles className="h-4 w-4" />
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create QR Card</span>
          </Link>
          <MobileMenu />
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto flex max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-20 lg:min-h-[690px] lg:px-10 lg:py-24">
        {/* Grid + ambient lighting */}
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-32 top-0 h-[320px] w-[320px] rounded-full bg-blue-600/20 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-[240px] w-[300px] rounded-full bg-purple-900/20 blur-[110px] sm:left-10 sm:h-[300px] sm:w-[400px] sm:blur-[130px]" />

        <div className="relative z-10 grid w-full items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Hero text */}
          <div className="animate-fade-in min-w-0 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[11px] font-semibold tracking-[0.15em] text-blue-300 sm:mb-7 sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              YOUR DIGITAL IDENTITY
            </div>

            <h1 className="mx-auto max-w-2xl text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:mx-0 lg:text-7xl">
              Your identity.
              <br />
              <span className="shine-text">One unique link.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0">
              A smarter way to share who you are. Create your personal digital
              profile, generate a unique QR card, and make your information
              accessible with a simple scan.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
              <Link
                href="/create"
                className="primary-button group inline-flex items-center justify-center gap-3 px-7 py-4 font-semibold"
              >
                Create Your QR Card
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
              </Link>

              <a
                href="#features"
                className="secondary-button inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold"
              >
                <ScanLine className="h-5 w-5" />
                Explore RIVEXTRA
              </a>
            </div>

            {/* Mini stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 text-xs text-gray-500 sm:mt-12 sm:flex sm:flex-wrap sm:justify-center sm:gap-8 sm:text-sm lg:justify-start">
              {[
                { icon: UserRound, big: "01", label: "Personal profile" },
                { icon: QrCode, big: "QR", label: "Easy sharing" },
                { icon: Link2, big: "∞", label: "Your unique link" },
              ].map(({ icon: Icon, big, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 sm:text-left"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-white sm:text-xl">
                      {big}
                    </p>
                    <p className="mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real card design with a sample QR */}
          <div className="relative mx-auto w-full max-w-[400px] min-w-0 px-2 sm:px-0">
            {/* rotating ring */}
            <div className="animate-spin-slow pointer-events-none absolute -inset-3 rounded-[40px] border border-dashed border-blue-400/20 sm:-inset-6 sm:rounded-[44px]" />

            <CardPreview
              details={sampleDetails}
              generatedQr={FAKE_QR}
              isGenerated={true}
              showActions={false}
            />

            {/* Floating badges */}
            <div className="animate-float-slow absolute -bottom-4 -left-1 flex items-center gap-2.5 rounded-xl border border-blue-400/20 bg-[#0c1424] px-3.5 py-2.5 shadow-xl sm:-bottom-6 sm:-left-10 sm:gap-3 sm:px-5 sm:py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300 sm:h-9 sm:w-9">
                <ScanLine className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <p className="text-[10px] text-gray-500 sm:text-xs">ONE SCAN</p>
                <p className="mt-0.5 text-xs font-semibold text-blue-300 sm:text-sm">
                  Your profile. Connected.
                </p>
              </div>
            </div>

            <div
              className="animate-float-slow absolute -right-1 -top-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-[#0c1424] px-3 py-2 shadow-xl sm:-right-8 sm:-top-5 sm:px-4 sm:py-2.5"
              style={{ animationDelay: "1.5s" }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <Check className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-semibold text-emerald-300">
                Card Ready
              </p>
            </div>

            <p className="mt-12 text-center text-[11px] text-gray-500 sm:mt-14 sm:text-xs">
              Sample preview · the QR shown is for illustration only
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE STRIP */}
      <section className="border-y border-white/10 bg-white/[0.02] py-4 sm:py-5">
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-10 sm:gap-12">
            {[...marqueeItems, ...marqueeItems].map(
              ({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 whitespace-nowrap text-xs text-gray-400 sm:text-sm"
                >
                  <Icon className="h-4 w-4 text-blue-400" />
                  {label}
                  <span className="ml-8 h-1 w-1 rounded-full bg-blue-500/50 sm:ml-9" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:text-left">
              <p className="text-[11px] font-bold tracking-[0.3em] text-blue-400 sm:text-xs">
                WHAT MAKES US DIFFERENT
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                Everything you need.
                <br />
                <span className="blue-text">All in one place.</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-400 sm:mt-5 sm:text-base sm:leading-8">
                RIVEXTRA brings your digital identity and QR card together in
                one simple experience.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:mt-16 md:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.number} delay={i * 150}>
                  <article className="premium-card card-shine group h-full p-6 transition duration-300 hover:-translate-y-2 hover:border-blue-500/40 sm:p-8">
                    <div className="flex items-center justify-between">
                      <div className="icon-box">
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold tracking-widest text-blue-400/70">
                        {feature.number}
                      </p>
                    </div>

                    <div className="my-6 h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent sm:my-8" />

                    <h3 className="text-lg font-bold sm:text-xl">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-400 sm:mt-4">
                      {feature.description}
                    </p>

                    <div className="mt-6 text-blue-400 transition group-hover:translate-x-2 sm:mt-8">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold tracking-[0.3em] text-blue-400 sm:text-xs">
                HOW IT WORKS
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                Three simple <span className="blue-text">steps.</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-12 grid gap-10 sm:mt-16 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent md:block" />

            {steps.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 150}>
                <div className="group relative text-center">
                  <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/30 bg-[#0c1424] text-blue-300 transition duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] sm:mb-6">
                    <Icon className="h-8 w-8" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-gray-400">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / CTA */}
      <section id="about" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <Reveal>
          <div className="premium-card relative mx-auto max-w-7xl overflow-hidden px-5 py-12 text-center sm:px-16 sm:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 max-w-full -translate-x-1/2 rounded-full bg-blue-600/15 blur-[100px]" />
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10 text-blue-300 sm:mb-6">
                <Sparkles className="h-7 w-7" />
              </div>

              <p className="text-[11px] font-bold tracking-[0.3em] text-blue-400 sm:text-xs">
                THE RIVEXTRA EXPERIENCE
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-2xl font-bold leading-tight sm:mt-5 sm:text-4xl lg:text-5xl">
                Make sharing your identity{" "}
                <span className="shine-text">simpler.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:mt-6 sm:text-base sm:leading-8">
                Create your digital profile and let your unique QR code connect
                people to the information you choose to share.
              </p>

              <Link
                href="/create"
                className="primary-button group mt-8 inline-flex items-center gap-3 px-8 py-4 font-semibold sm:mt-9"
              >
                Get Started
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ADVERTISEMENT PLACEHOLDER */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto flex min-h-28 max-w-5xl flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="text-[10px] tracking-[0.25em] text-gray-600">
            ADVERTISEMENT
          </p>
          <p className="mt-2 text-xs text-gray-500">Advertisement space</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-white/10 px-4 py-8 sm:mt-16 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-black tracking-[0.18em]">
              RIVE<span className="text-blue-500">XTRA</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Your identity. One unique link.
            </p>
          </div>

          <p className="text-xs text-gray-600">
            © 2026 RIVEXTRA. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}