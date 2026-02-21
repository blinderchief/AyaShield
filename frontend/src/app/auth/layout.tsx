import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface relative overflow-hidden items-center justify-center p-12 border-r border-border">
        <div className="relative text-center max-w-md">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-text-primary flex items-center justify-center overflow-hidden">
              <Image src="/favicon.svg" alt="Aya Shield" width={48} height={48} />
            </div>
            <span className="text-2xl font-semibold text-text-primary">
              Aya Shield
            </span>
          </Link>
          <h2 className="text-3xl font-semibold mb-4 text-text-primary">
            Your AI-powered
            <br />
            crypto bodyguard
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Simulate transactions, analyze contracts, and revoke risky
            approvals — all before anything touches your wallet.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 bg-white">
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-text-primary flex items-center justify-center overflow-hidden">
            <Image src="/favicon.svg" alt="Aya Shield" width={36} height={36} />
          </div>
          <span className="font-semibold text-text-primary text-lg">Aya Shield</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
