import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";

export const metadata = {
  title: "NachtVeilig",
  description: "Community veiligheidsplatform",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <Providers>
          <PwaRegister />
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <nav className="container-page flex items-center justify-between py-3">
              <Link href="/" className="font-semibold">
                NachtVeilig
              </Link>
              <div className="hidden items-center gap-4 text-sm md:flex">
                <Link href="/kaart">Kaart</Link>
                <Link href="/melden">Melden</Link>
                <Link href="/veilig">Veilig</Link>
                <Link href="/meldingen">Meldingen</Link>
                <Link href="/account">Profiel</Link>
                <ThemeToggle />
              </div>
              <div className="md:hidden">
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="pb-24">{children}</main>
          <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
            <div className="grid grid-cols-5 text-center text-xs">
              <Link className="p-3" href="/kaart">Kaart</Link>
              <Link className="p-3 font-semibold text-brand-700" href="/melden">Melden</Link>
              <Link className="p-3" href="/veilig">Veilig</Link>
              <Link className="p-3" href="/meldingen">Meldingen</Link>
              <Link className="p-3" href="/account">Profiel</Link>
            </div>
          </nav>
        </Providers>
      </body>
    </html>
  );
}
