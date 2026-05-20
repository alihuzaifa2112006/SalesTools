import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Users,
  Zap,
  Globe,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import LandingNav from "@/components/landing/LandingNav";

export default function LandingPage() {
  return (
    <div className="relative min-h-[100dvh] mesh-gradient overflow-x-hidden">
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-neutral-200/20 to-transparent rounded-full blur-3xl" />

      <LandingNav />

      <section className="relative z-10 px-4 pt-10 pb-20 sm:px-6 sm:pt-20 sm:pb-32 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 backdrop-blur-sm px-3 py-1.5 sm:px-4 text-[11px] sm:text-xs font-medium text-neutral-600 mb-6 sm:mb-8 animate-fade-in">
          <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span className="text-left">Built for Tricon Studios Marketing & Sales</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-neutral-900 animate-slide-up px-2">
          Close more deals.
          <br />
          <span className="text-gradient">Track every lead.</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed animate-slide-up px-2">
          Saller replaces messy spreadsheets with a premium CRM built for teams
          hunting clients on Instagram, Facebook, Google Maps, WhatsApp, and
          cold calls — all in one collaborative workspace.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 animate-slide-up px-4 sm:px-0 max-w-sm sm:max-w-none mx-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              Start Free Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              Sign in to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-12 sm:mt-20 relative mx-auto max-w-4xl px-2 sm:px-0">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-2xl shadow-neutral-900/[0.08] p-1 animate-float">
            <div className="rounded-xl bg-neutral-50 p-4 sm:p-8 md:p-12">
              <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
                {[
                  { label: "Total Leads", value: "248", icon: Users },
                  { label: "Conversion", value: "34%", icon: TrendingUp },
                  { label: "Revenue", value: "$42K", icon: BarChart3 },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white p-2.5 sm:p-4 border border-neutral-100 shadow-sm"
                  >
                    <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400 mb-1 sm:mb-2" />
                    <p className="text-lg sm:text-2xl font-semibold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-400 leading-tight">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-24 sm:h-32 rounded-xl bg-gradient-to-r from-neutral-100 to-neutral-50 flex items-end px-2 sm:px-4 pb-2 sm:pb-4 gap-1 sm:gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-neutral-900/80 min-w-0"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 sm:px-6 sm:py-24 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-neutral-900 mb-3 sm:mb-4">
          Everything your sales team needs
        </h2>
        <p className="text-center text-sm sm:text-base text-neutral-500 mb-10 sm:mb-16 max-w-xl mx-auto">
          From first Instagram DM to final payment — track the entire client
          journey in one beautiful dashboard.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: Globe,
              title: "Multi-Source Lead Tracking",
              desc: "Instagram, Facebook, Google Maps, WhatsApp, cold calls — filter and search by any source.",
            },
            {
              icon: Users,
              title: "Team Workspaces",
              desc: "Create shared workspaces, invite teammates, and collaborate on leads in real-time.",
            },
            {
              icon: MessageSquare,
              title: "Interaction Logs",
              desc: "Record every call, message, and follow-up. Never lose track of who talked to whom.",
            },
            {
              icon: BarChart3,
              title: "Sales Analytics",
              desc: "Conversion rates, monthly revenue velocity, and lead distribution charts at a glance.",
            },
            {
              icon: Shield,
              title: "Bank-Grade Security",
              desc: "JWT authentication with HttpOnly cookies, bcrypt password hashing, and strict SameSite policies.",
            },
            {
              icon: TrendingUp,
              title: "Payment Tracking",
              desc: "Track total value, payments received, remaining balance, and pending amounts per client.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-neutral-200/80 bg-white/60 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-900/[0.05] md:hover:-translate-y-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 group-hover:bg-neutral-900 transition-colors duration-300">
                <feature.icon className="h-5 w-5 text-neutral-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl p-8 sm:p-12 shadow-xl shadow-neutral-900/[0.05]">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900">
            Ready to replace your spreadsheets?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-500">
            Join Tricon Studios Marketing & Sales on Saller today.
          </p>
          <Link href="/register" className="inline-block mt-6 sm:mt-8 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Create Your Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-neutral-200/80 py-6 sm:py-8 px-4 text-center text-xs text-neutral-400 safe-bottom">
        &copy; {new Date().getFullYear()} Saller &middot; Tricon Studios Marketing & Sales
      </footer>
    </div>
  );
}
