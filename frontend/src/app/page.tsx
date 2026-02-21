import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Shield,
  Search,
  Share2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  CheckCircle,
  Eye,
  Layers,
  Brain,
  ShieldCheck,
  Code,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        {/* BG effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-radial from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs sm:text-sm text-text-secondary mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Now protecting transactions across 7 chains
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-5 sm:mb-6">
            Protect every
            <br />
            <span className="gradient-text">transaction</span> you sign
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            AI-powered transaction firewall that simulates, analyzes, and
            shields your crypto before you sign. Never lose funds to a
            malicious approval again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-brand text-white font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-surface border border-border text-text-primary font-semibold text-base sm:text-lg hover:bg-surface-2 transition-colors text-center"
            >
              View Demo
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-muted">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> Open Source</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> No Wallet Access Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> Free to Use</span>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { value: "$2.4B+", label: "Value Protected" },
            { value: "99.9%", label: "Uptime" },
            { value: "<1.5s", label: "Analysis Speed" },
            { value: "7", label: "Chains Supported" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-4xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section id="problem" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-danger uppercase tracking-wider mb-3">The Problem</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Crypto users lose <span className="text-danger">$5.6 billion</span> yearly to scams
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
              Phishing approvals, honeypot tokens, rug pulls, and malicious contracts drain wallets every day.
              Most users have no way to know what a transaction actually does before signing it.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Eye className="w-5 h-5" />, stat: "68%", desc: "of crypto thefts come from malicious token approvals that users unknowingly sign" },
              { icon: <Layers className="w-5 h-5" />, stat: "4 in 10", desc: "new tokens deployed have honeypot characteristics or hidden rug-pull mechanisms" },
              { icon: <AlertTriangle className="w-5 h-5" />, stat: "$0", desc: "is what most users can recover after signing a malicious unlimited approval" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 sm:p-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger mx-auto mb-4">
                  {item.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{item.stat}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE SOLUTION ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">The Solution</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              An AI bodyguard for your <span className="gradient-text">crypto wallet</span>
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
              Aya Shield sits between you and the blockchain. Every transaction is simulated, decoded,
              and explained in plain English by Google Gemini AI — before you ever sign.
            </p>
          </div>

          {/* Solution diagram */}
          <div className="glass-card p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/3 via-transparent to-transparent pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left: User */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-7 h-7 text-text-secondary" />
                </div>
                <p className="font-semibold text-text-primary">You</p>
                <p className="text-xs text-text-muted mt-1">Connect wallet, paste tx hash</p>
              </div>
              {/* Center: Shield */}
              <div className="text-center relative">
                <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-8 items-center text-text-muted">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-8 items-center text-text-muted">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                  <Image src="/logo.svg" alt="Aya Shield" width={48} height={48} />
                </div>
                <p className="font-bold gradient-text text-lg">Aya Shield</p>
                <p className="text-xs text-text-muted mt-1">Simulate &middot; Analyze &middot; Explain</p>
              </div>
              {/* Right: Protected */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-success" />
                </div>
                <p className="font-semibold text-text-primary">Protected</p>
                <p className="text-xs text-text-muted mt-1">Sign safely or block threats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Complete transaction security
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
              Four integrated modules that protect you from the moment you
              connect to a dApp until long after you sign.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Transaction Guardian"
              description="Pre-sign simulation with plain-English AI explanation. See exactly what a transaction will do — token transfers, approvals, contract calls — before you approve it."
              color="text-primary"
              bgColor="bg-primary/10"
              tag="Core Protection"
            />
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Contract Analyzer"
              description="Instant trust scoring for any contract. Honeypot detection, bytecode analysis, age verification, Etherscan enrichment, and red flag scanning in seconds."
              color="text-accent"
              bgColor="bg-accent/10"
              tag="Deep Analysis"
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6" />}
              title="Smart Receipts"
              description="Beautiful SVG receipt cards for every transaction with cost breakdown, event logs, and AI summary. Download or share your on-chain activity."
              color="text-success"
              bgColor="bg-success/10"
              tag="Social Proof"
            />
            <FeatureCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Emergency Revoke"
              description="One-tap panic scanner that finds all your token approvals, scores risk for each, and generates batch revoke transactions to reclaim your wallet."
              color="text-danger"
              bgColor="bg-danger/10"
              tag="Emergency Response"
            />
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Three steps to bulletproof security
            </h2>
            <p className="text-text-secondary text-base sm:text-lg">
              From connect to protected in under 2 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: <Globe className="w-5 h-5" />,
                title: "Connect",
                description:
                  "Sign up and paste any transaction hash, contract address, or wallet address. Works across Ethereum, Polygon, Arbitrum, Base, and more.",
              },
              {
                step: "02",
                icon: <Brain className="w-5 h-5" />,
                title: "AI Analyzes",
                description:
                  "Aya Shield simulates the transaction, decodes function calls, checks scam databases, analyzes bytecode, and asks Gemini AI to explain everything.",
              },
              {
                step: "03",
                icon: <Lock className="w-5 h-5" />,
                title: "Stay Protected",
                description:
                  "Get a clear risk score, plain-English explanation, and actionable advice. If something is dangerous, you will know before signing.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card p-6 sm:p-8 relative"
              >
                <div className="text-5xl font-extrabold text-border/60 absolute top-4 sm:top-6 right-4 sm:right-6">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Built Right</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Production-grade architecture
            </h2>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
              Not a toy. Aya Shield is built with the same stack used by leading
              fintech and security products.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { name: "Google Gemini 2.0", desc: "AI intelligence", icon: <Sparkles className="w-4 h-4" /> },
              { name: "FastAPI", desc: "Async backend", icon: <Zap className="w-4 h-4" /> },
              { name: "Next.js 15", desc: "React framework", icon: <Globe className="w-4 h-4" /> },
              { name: "Supabase", desc: "Auth & database", icon: <Lock className="w-4 h-4" /> },
              { name: "Web3 / EVM", desc: "Blockchain access", icon: <Layers className="w-4 h-4" /> },
              { name: "Etherscan API", desc: "Contract enrichment", icon: <Search className="w-4 h-4" /> },
              { name: "Docker", desc: "Containerized deploy", icon: <Code className="w-4 h-4" /> },
              { name: "TypeScript", desc: "Type-safe frontend", icon: <Shield className="w-4 h-4" /> },
            ].map((tech) => (
              <div key={tech.name} className="glass-card p-4 sm:p-5">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary mb-3">
                  {tech.icon}
                </div>
                <p className="font-semibold text-text-primary text-sm">{tech.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-success uppercase tracking-wider mb-3">Use Cases</p>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Who needs Aya Shield?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "DeFi Users", desc: "Verify every swap, stake, and yield farm before signing. Catch hidden fees and malicious redirects.", icon: <TrendingUp className="w-5 h-5" /> },
              { title: "NFT Collectors", desc: "Check marketplace contracts and minting sites. Avoid fake approvals that drain your wallet.", icon: <Sparkles className="w-5 h-5" /> },
              { title: "DAO Members", desc: "Analyze governance proposals and multi-sig calls. Understand what you are actually voting to execute.", icon: <Layers className="w-5 h-5" /> },
              { title: "New Crypto Users", desc: "Can not read Solidity? No problem. Aya Shield explains every transaction in plain English, like having a crypto-expert friend.", icon: <Brain className="w-5 h-5" /> },
              { title: "Developers", desc: "Test and verify your own contracts. Get trust scores and red flag analysis before deploying or interacting.", icon: <Code className="w-5 h-5" /> },
              { title: "Security Researchers", desc: "Rapid triage of suspicious contracts. Bytecode analysis, scam database lookups, and risk scoring in seconds.", icon: <Eye className="w-5 h-5" /> },
            ].map((uc) => (
              <div key={uc.title} className="glass-card p-6 hover:border-border-light transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/15 transition-colors">
                  {uc.icon}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{uc.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPEN SOURCE ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-6">
                <Code className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                100% Open Source
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto mb-6 leading-relaxed text-sm sm:text-base">
                Aya Shield is fully open source. You can audit every line of code,
                self-host on your own infrastructure, or contribute to make crypto
                security better for everyone.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 text-xs font-medium text-text-secondary border border-border">
                  <CheckCircle className="w-3.5 h-3.5 text-success" /> MIT License
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 text-xs font-medium text-text-secondary border border-border">
                  <CheckCircle className="w-3.5 h-3.5 text-success" /> Self-Hostable
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 text-xs font-medium text-text-secondary border border-border">
                  <CheckCircle className="w-3.5 h-3.5 text-success" /> Community Driven
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-surface/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">
            Ready to secure your wallet?
          </h2>
          <p className="text-text-secondary text-base sm:text-lg mb-8 px-2">
            Join users who never worry about malicious transactions again.
            It takes 30 seconds to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-brand text-white font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-surface border border-border text-text-primary font-semibold text-base sm:text-lg hover:bg-surface-2 transition-colors"
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

function FeatureCard({
  icon,
  title,
  description,
  color,
  bgColor,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  tag: string;
}) {
  return (
    <div className="glass-card p-6 sm:p-8 hover:border-border-light transition-colors group">
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <div
          className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${color} opacity-70`}>
          {tag}
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
