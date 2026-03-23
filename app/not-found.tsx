import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f8f5f1] text-[#292929]">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full rounded-2xl border border-[#dfd4c9] bg-white p-8 text-center shadow-sm sm:p-10">
          <img
            src="/DomnerDesktop.png"
            alt="Domner Logo"
            className="mx-auto h-10 w-auto sm:h-11"
          />

          <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[#8a6a53]">
            404
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5f5f5f] sm:text-base">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#292929] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/explore"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9c6b4] bg-white px-4 py-2.5 text-sm font-semibold text-[#6f4e37] transition-colors hover:bg-[#f8f2ec] sm:w-auto"
            >
              <Compass className="h-4 w-4" />
              Explore
            </Link>
          </div>

          <p className="mt-7 text-xs text-[#8a8a8a]">
            Need help? Contact{" "}
            <a
              href="mailto:domner.travel@gmail.com"
              className="font-medium text-[#6f4e37] hover:underline"
            >
              domner.travel@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
