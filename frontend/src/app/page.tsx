import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Shield,
  Search,
  Share2,
  AlertTriangle,
  ArrowRight,
  Lock,
  CheckCircle,
  Eye,
  Layers,
  Brain,
  Code,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs text-text-secondary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Protecting transactions across 7 chains
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-text-primary mb-6">
            Protect every transaction
            <br className="hidden sm:block" />
            you sign
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            AI-powered transaction firewall that simulates, analyzes, and
            shields your crypto before you sign.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-surface transition-colors text-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="py-12 px-4 sm:px-6 border-y border-border">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-text-secondary">
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Open Source</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> No Wallet Access Required</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Free to Use</span>
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> 7 Chains Supported</span>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section id="problem" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-danger tracking-wide uppercase mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              $5.6 billion lost to crypto scams yearly
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Phishing approvals, honeypot tokens, and malicious contracts drain wallets every day.
              Most users have no way to know what a transaction does before signing.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Eye className="w-5 h-5" />, stat: "68%", desc: "of crypto thefts come from malicious token approvals users unknowingly sign" },
              { icon: <Layers className="w-5 h-5" />, stat: "4 in 10", desc: "new tokens deployed have honeypot characteristics or rug-pull mechanisms" },
              { icon: <AlertTriangle className="w-5 h-5" />, stat: "$0", desc: "is what most users recover after signing a malicious unlimited approval" },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-xl p-8 text-center">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-danger mx-auto mb-4">
                  {item.icon}
                </div>
                <p className="text-3xl font-semibold text-text-primary mb-2">{item.stat}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-text-secondary tracking-wide uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Three steps to complete security
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect",
                description: "Paste any transaction hash, contract address, or wallet address. Works across Ethereum, Polygon, Arbitrum, Base, and more.",
              },
              {
                step: "02",
                title: "AI Analyzes",
                description: "Aya Shield simulates the transaction, decodes function calls, checks scam databases, and uses Gemini AI to explain everything.",
              },
              {
                step: "03",
                title: "Stay Protected",
                description: "Get a clear risk score, plain-English explanation, and actionable advice. Know before you sign.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-surface-2 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-text-secondary tracking-wide uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Complete transaction security
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Four integrated modules that protect you from connect to sign.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Transaction Guardian",
                description: "Pre-sign simulation with plain-English AI explanation. See exactly what a transaction will do before you approve it.",
                tag: "Core",
              },
              {
                icon: <Search className="w-5 h-5" />,
                title: "Contract Analyzer",
                description: "Instant trust scoring for any contract. Honeypot detection, bytecode analysis, and red flag scanning in seconds.",
                tag: "Analysis",
              },
              {
                icon: <Share2 className="w-5 h-5" />,
                title: "Smart Receipts",
                description: "Beautiful receipt cards for every transaction with cost breakdown, event logs, and AI summary.",
                tag: "Receipts",
              },
              {
                icon: <AlertTriangle className="w-5 h-5" />,
                title: "Emergency Revoke",
                description: "Panic scanner that finds all token approvals, scores risk, and generates batch revoke transactions.",
                tag: "Emergency",
              },
            ].map((feature) => (
              <div key={feature.title} className="border border-border rounded-xl p-8 hover:border-border-light transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-text-secondary">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{feature.tag}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-text-secondary tracking-wide uppercase mb-3">Use Cases</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Built for everyone in crypto
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "DeFi Users", desc: "Verify every swap, stake, and yield farm before signing.", icon: <TrendingUp className="w-5 h-5" /> },
              { title: "NFT Collectors", desc: "Check marketplace contracts and minting sites for threats.", icon: <Sparkles className="w-5 h-5" /> },
              { title: "DAO Members", desc: "Analyze governance proposals and multi-sig calls.", icon: <Layers className="w-5 h-5" /> },
              { title: "New Users", desc: "Every transaction explained in plain English by AI.", icon: <Brain className="w-5 h-5" /> },
              { title: "Developers", desc: "Test and verify your contracts before deploying.", icon: <Code className="w-5 h-5" /> },
              { title: "Researchers", desc: "Rapid triage of suspicious contracts and transactions.", icon: <Eye className="w-5 h-5" /> },
            ].map((uc) => (
              <div key={uc.title} className="border border-border rounded-xl p-6 hover:border-border-light transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center text-text-secondary mb-4">
                  {uc.icon}
                </div>
                <h3 className="font-semibold mb-1">{uc.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPEN SOURCE ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-6">
            <Code className="w-6 h-6 text-text-secondary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            100% Open Source
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            Audit every line of code, self-host on your infrastructure, or
            contribute to make crypto security better for everyone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["MIT License", "Self-Hostable", "Community Driven"].map((label) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-text-secondary">
                <CheckCircle className="w-3.5 h-3.5 text-success" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Ready to secure your wallet?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            It takes 30 seconds to get started. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/analyze"
              className="w-full sm:w-auto px-8 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-white transition-colors text-center"
            >
              Try Analysis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
