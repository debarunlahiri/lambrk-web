import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

const contactEmail = "contact@lambrk.com";

type Product = {
  id: string;
  name: string;
  kind: string;
  tagline: string;
  description: string;
  features: string[];
  meta: string[];
  href: string;
  cta: string;
  privacyHref?: string;
  tint: string;
  icon?: { src: string; width: number; height: number };
  screen?: { src: string; width: number; height: number; alt: string };
};

const products: Product[] = [
  {
    id: "splitease",
    name: "SplitEase",
    kind: "Android app",
    tagline: "Shared expenses, minus the awkward maths.",
    description:
      "SplitEase helps friends, roommates, couples and travel groups track shared costs and see who owes whom, from rent and groceries to dinners and road trips.",
    features: [
      "Create a group and invite the people you split with",
      "Split a bill equally or set each person’s share",
      "Add a category, notes or a receipt to any expense",
      "Settle-up suggestions that need fewer transfers",
    ],
    meta: ["Android 7.0+", "17.1 MB", "No ads"],
    href: "https://appverse.bitknob.com/android/splitease",
    cta: "Get SplitEase",
    privacyHref: "/splitease/privacy-policy",
    tint: "#1f8a63",
    icon: { src: "/products/splitease-icon.webp", width: 192, height: 192 },
    screen: {
      src: "/products/splitease-screen.png",
      width: 1080,
      height: 2424,
      alt: "SplitEase groups screen listing two shared expense groups",
    },
  },
  {
    id: "stride",
    name: "Stride",
    kind: "Android app",
    tagline: "Your steps and the air you breathe, in one place.",
    description:
      "Stride counts your steps with your phone’s built-in sensor, tracks goals you set yourself, and shows the air quality for a location you choose. No account needed.",
    features: [
      "Step counting with no extra hardware",
      "Your own daily goals for steps, exercise minutes and move calories",
      "Air quality for your city, with plain-language advice",
      "Steps, goals and history stay on your device",
    ],
    meta: ["Android 8.0+", "4 MB", "No ads, no account"],
    href: "https://appverse.bitknob.com/android/stride",
    cta: "Get Stride",
    privacyHref: "/stride/privacy-policy",
    tint: "#2aa58a",
    icon: { src: "/products/stride-icon.webp", width: 192, height: 192 },
    screen: {
      src: "/products/stride-screen.jpg",
      width: 1080,
      height: 2340,
      alt: "Stride today screen showing air quality, activity rings and weekly steps",
    },
  },
  {
    id: "compass",
    name: "Compass",
    kind: "Android app",
    tagline: "Find north. Check it’s level.",
    description:
      "Compass shows your direction in real time and helps you check whether a surface is level, using the sensors already in your phone.",
    features: [
      "Live heading in degrees",
      "Magnetic north, or true north when you turn it on",
      "Built-in level for left/right and front/back tilt",
      "No ads or analytics; sensor readings stay on your phone",
    ],
    meta: ["Android 7.0+", "1.9 MB", "No ads"],
    href: "https://appverse.bitknob.com/android/compass",
    cta: "Get Compass",
    privacyHref: "/compass/privacy-policy",
    tint: "#2f9bd6",
    icon: { src: "/products/compass-icon.webp", width: 507, height: 475 },
    screen: {
      src: "/products/compass-screen.png",
      width: 1080,
      height: 2424,
      alt: "Compass screen showing a heading of 0 degrees north and a two-axis level",
    },
  },
  {
    id: "laidoffcircle",
    name: "LaidOffCircle",
    kind: "Web community",
    tagline: "Laid off, not disconnected.",
    description:
      "A place to find your people, share your story, and build your next chapter after a layoff.",
    features: [
      "A feed for stories, polls and layoff updates",
      "Referral opportunities shared by members",
      "Workforce insights to see where things are heading",
      "Direct messages and a network of people who get it",
    ],
    meta: ["Web", "Works on any device"],
    href: "https://laidoffcircle.com/",
    cta: "Visit LaidOffCircle",
    icon: { src: "/products/laidoffcircle-icon.png", width: 512, height: 512 },
    tint: "#e0703a",
  },
];

function tintStyle(tint: string, amount: number) {
  return {
    background: `color-mix(in srgb, ${tint} ${amount}%, var(--card))`,
  };
}

function ProductIcon({ product, size }: { product: Product; size: number }) {
  if (product.icon) {
    return (
      <Image
        src={product.icon.src}
        alt=""
        width={product.icon.width}
        height={product.icon.height}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-[22%] object-contain"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, background: product.tint, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-[22%] font-black text-white"
    >
      {product.name.charAt(0)}
    </span>
  );
}

function ProductVisual({ product }: { product: Product }) {
  return (
    <div
      style={tintStyle(product.tint, 14)}
      className="flex min-h-80 items-center justify-center overflow-hidden rounded-3xl px-6 pt-10 ring-1 ring-border sm:px-10 md:min-h-[30rem]"
    >
      {product.screen ? (
        <Image
          src={product.screen.src}
          alt={product.screen.alt}
          width={product.screen.width}
          height={product.screen.height}
          sizes="280px"
          className="h-auto w-56 translate-y-4 self-end rounded-t-[2rem] shadow-2xl ring-1 ring-black/10 sm:w-64"
        />
      ) : (
        <div className="max-w-xs self-center pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Your next chapter starts here
          </p>
          <p className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            You’re in good company.
          </p>
          <p className="mt-3 text-base text-muted">
            Different journeys. A shared way forward.
          </p>
        </div>
      )}
    </div>
  );
}

function ProductSection({ product, flip }: { product: Product; flip: boolean }) {
  const external = { target: "_blank", rel: "noopener noreferrer" };
  return (
    <section
      id={product.id}
      aria-labelledby={`${product.id}-title`}
      className="grid scroll-mt-24 items-center gap-8 md:grid-cols-2 md:gap-14"
    >
      <div className={flip ? "md:order-2" : ""}>
        <ProductVisual product={product} />
      </div>

      <div>
        <div className="flex items-center gap-3">
          <ProductIcon product={product} size={48} />
          <div>
            <h3 id={`${product.id}-title`} className="text-2xl font-black tracking-tight">
              {product.name}
            </h3>
            <p className="text-sm text-muted">{product.kind}</p>
          </div>
        </div>

        <p className="mt-6 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {product.tagline}
        </p>
        <p className="mt-3 leading-relaxed text-muted">{product.description}</p>

        <ul className="mt-6 space-y-2.5">
          {product.features.map((feature) => (
            <li key={feature} className="flex gap-3 text-sm leading-relaxed">
              <Check
                aria-hidden="true"
                size={18}
                strokeWidth={3}
                style={{ color: product.tint }}
                className="mt-0.5 shrink-0"
              />
              {feature}
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-2">
          {product.meta.map((item) => (
            <li
              key={item}
              className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={product.href}
            {...external}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-bold text-background transition-opacity hover:opacity-80"
          >
            {product.cta}
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          {product.privacyHref && (
            <Link
              href={product.privacyHref}
              className="text-sm font-medium text-muted underline underline-offset-4 hover:text-foreground"
            >
              Privacy policy
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Image src="/lambrk.png" alt="" width={32} height={32} className="rounded-lg" />
            lambrk
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
            <a href="#products" className="hidden rounded-full px-4 py-2 hover:bg-surface sm:block">
              Products
            </a>
            <Link href="/login" className="rounded-full px-4 py-2 hover:bg-surface">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-80"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Apps and communities by Lambrk
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-7xl">
            Small apps that do <span className="gradient-text">one thing well.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Lambrk makes focused tools for everyday life: splitting a bill,
            counting your steps, finding north. And places to find your people
            when you need them.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#products"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-7 text-base font-bold text-background transition-opacity hover:opacity-80"
            >
              See the products
              <ArrowRight aria-hidden="true" size={20} />
            </a>
            <Link
              href="/register"
              className="inline-flex h-14 items-center rounded-full bg-card px-7 text-base font-bold ring-1 ring-border transition-colors hover:bg-surface"
            >
              Join Lambrk
            </Link>
          </div>

          {/* Product index */}
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <a
                  href={`#${product.id}`}
                  className="flex h-full items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-colors hover:bg-surface"
                >
                  <ProductIcon product={product} size={44} />
                  <span className="min-w-0">
                    <span className="block font-bold">{product.name}</span>
                    <span className="block truncate text-sm text-muted">{product.kind}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Products */}
        <section
          id="products"
          aria-labelledby="products-title"
          className="scroll-mt-16 border-t border-border"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 id="products-title" className="text-3xl font-black tracking-tight sm:text-5xl">
              The products
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">
              Three Android apps and one community on the web.
            </p>

            <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-28">
              {products.map((product, index) => (
                <ProductSection key={product.id} product={product} flip={index % 2 === 1} />
              ))}
            </div>
          </div>
        </section>

        {/* Lambrk community */}
        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="rounded-3xl bg-card px-6 py-12 text-center ring-1 ring-border sm:px-12 sm:py-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                And there’s <span className="gradient-text">lambrk</span> itself.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
                Share your moments, discover communities, and connect with
                people around the world.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-7 text-base font-bold text-background transition-opacity hover:opacity-80"
                >
                  Get started
                  <ArrowRight aria-hidden="true" size={20} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center rounded-full bg-background px-7 text-base font-bold ring-1 ring-border transition-colors hover:bg-surface"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Lambrk ·{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {contactEmail}
            </a>
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {products
              .filter((product) => product.privacyHref)
              .map((product) => (
                <li key={product.id}>
                  <Link
                    href={product.privacyHref!}
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {product.name} privacy
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
