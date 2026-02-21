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
  Github,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-accent" />
            <span>Now supporting 7 EVM chains</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-text-primary mb-6 animate-slide-up" style={{ letterSpacing: "-0.02em" }}>
            Know what you&apos;re signing
            <br className="hidden sm:block" />
            <span className="text-text-secondary">before you sign</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
            Aya Shield is an AI-powered transaction firewall that simulates, 
            decodes, and explains every transaction in plain English.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-all duration-200 flex items-center justify-center gap-2 shadow-card hover:shadow-card-hover"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://github.com/blinderchief/AyaShield"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-border text-text-primary font-medium hover:bg-surface transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" /> View on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="py-10 px-4 sm:px-6 border-y border-border bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm">
            {[
              { label: "Open Source", icon: <Code className="w-4 h-4" /> },
              { label: "No API Keys Stored", icon: <Lock className="w-4 h-4" /> },
              { label: "7 Chains Supported", icon: <Layers className="w-4 h-4" /> },
              { label: "Gemini 2.0 AI", icon: <Brain className="w-4 h-4" /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-text-secondary">
                <span className="text-accent">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VALUE PROP ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-accent tracking-wide uppercase mb-4">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
              $5.6B lost to crypto scams in 2023
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Most users can&apos;t read transaction data. Malicious approvals, honeypot tokens, 
              and phishing sites exploit this every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                stat: "68%", 
                label: "of crypto thefts",
                desc: "come from malicious token approvals users unknowingly sign" 
              },
              { 
                stat: "4 in 10", 
                label: "new tokens",
                desc: "have honeypot characteristics or hidden rug-pull mechanisms" 
              },
              { 
                stat: "$0", 
                label: "recovery rate",
                desc: "for most users after signing a malicious unlimited approval" 
              },
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl border border-border bg-white hover:shadow-card transition-shadow">
                <p className="text-5xl font-semibold text-text-primary mb-1" style={{ letterSpacing: "-0.02em" }}>{item.stat}</p>
                <p className="text-sm font-medium text-accent uppercase tracking-wide mb-3">{item.label}</p>
                <p className="text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-accent tracking-wide uppercase mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Three steps to complete protection
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: "01",
                title: "Paste any address or hash",
                description: "Transaction hash, contract address, or wallet. Works across Ethereum, Polygon, Arbitrum, Base, and more.",
              },
              {
                num: "02", 
                title: "AI analyzes everything",
                description: "Simulation, function decoding, scam database check, bytecode analysis — all explained in plain English.",
              },
              {
                num: "03",
                title: "Know before you sign",
                description: "Get a clear risk score, specific warnings, and actionable advice. Never sign blind again.",
              },
            ].map((item) => (
              <div key={item.num} className="relative">
                <div className="text-7xl font-bold text-border mb-6" style={{ letterSpacing: "-0.04em" }}>{item.num}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-accent tracking-wide uppercase mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
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
                description: "Pre-sign simulation with AI explanation. See exactly what happens before you approve.",
                badge: "Core",
              },
              {
                icon: <Search className="w-5 h-5" />,
                title: "Contract Analyzer", 
                description: "Instant trust scoring. Honeypot detection, bytecode analysis, and red flag scanning.",
                badge: "Analysis",
              },
              {
                icon: <Share2 className="w-5 h-5" />,
                title: "Smart Receipts",
                description: "Beautiful receipt cards for every transaction with cost breakdown and AI summary.",
                badge: "Share",
              },
              {
                icon: <AlertTriangle className="w-5 h-5" />,
                title: "Emergency Revoke",
                description: "Panic scanner finds all approvals, scores risk, and generates batch revoke transactions.",
                badge: "Emergency",
              },
            ].map((feature) => (
              <div key={feature.title} className="group p-8 rounded-2xl border border-border bg-white hover:border-border-light hover:shadow-card transition-all duration-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-text-primary group-hover:bg-accent group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{feature.badge}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOR EVERYONE ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-accent tracking-wide uppercase mb-4">Use Cases</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Built for everyone in crypto
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "DeFi Traders", desc: "Verify every swap, stake, and yield farm before signing.", icon: <TrendingUp className="w-5 h-5" /> },
              { title: "NFT Collectors", desc: "Check marketplace contracts and minting sites for threats.", icon: <Sparkles className="w-5 h-5" /> },
              { title: "DAO Members", desc: "Analyze governance proposals and multi-sig calls.", icon: <Layers className="w-5 h-5" /> },
              { title: "Crypto Beginners", desc: "Every transaction explained in plain English by AI.", icon: <Brain className="w-5 h-5" /> },
              { title: "Developers", desc: "Test and verify your contracts before deploying.", icon: <Code className="w-5 h-5" /> },
              { title: "Security Researchers", desc: "Rapid triage of suspicious contracts and transactions.", icon: <Eye className="w-5 h-5" /> },
            ].map((uc) => (
              <div key={uc.title} className="p-6 rounded-xl border border-border bg-white hover:shadow-card transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-accent mb-4">
                  {uc.icon}
                </div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPEN SOURCE ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-8">
            <Github className="w-7 h-7 text-text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
            100% Open Source
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Audit every line of code. Self-host on your infrastructure. 
            Contribute to make crypto security better for everyone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["MIT License", "Self-Hostable", "Community Driven", "No Vendor Lock-in"].map((label) => (
              <span key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-sm text-text-secondary">
                <CheckCircle className="w-4 h-4 text-success" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-text-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
            Ready to secure your wallet?
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Takes 30 seconds to get started. Free forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-text-primary font-medium hover:bg-surface transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start Protecting Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/analyze"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-200"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
