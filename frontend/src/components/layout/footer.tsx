import Link from "next/link";
import Image from "next/image";

const product = [
  { label: "Transaction Guardian", href: "/dashboard/analyze" },
  { label: "Contract Analyzer", href: "/dashboard/analyze" },
  { label: "Smart Receipts", href: "/dashboard/receipts" },
  { label: "Emergency Revoke", href: "/dashboard/panic" },
];

const resources = [
  { label: "Documentation", href: "https://github.com/blinderchief/AyaShield#readme" },
  { label: "GitHub", href: "https://github.com/blinderchief/AyaShield" },
  { label: "API Reference", href: "#" },
];

const legal = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "MIT License", href: "https://github.com/blinderchief/AyaShield/blob/main/LICENSE" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center overflow-hidden">
                <Image src="/favicon.svg" alt="Aya Shield" width={32} height={32} />
              </div>
              <span className="font-semibold text-text-primary tracking-tight">Aya Shield</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              AI-powered transaction firewall for the multi-chain era. Open source and free forever.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-3">
              {product.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              {legal.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-text-secondary hover:text-text-primary transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Aya Shield. Open source under MIT License.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/blinderchief/AyaShield"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/AyaShield"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
