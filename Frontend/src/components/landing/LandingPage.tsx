import React from 'react';
import { LandingNav } from './LandingNav';
import { FlowDiagram, EcosystemFlow } from './FlowDiagram';
import { Icon } from '../common/Icon';
import { Button } from '../common/UIComponents';
import { PORTAL_META } from '../common/PortalShell';

interface LandingPageProps {
  go: (page: string) => void;
  openAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ go, openAuth }) => {
  return (
    <div className="bg-cream text-deepblue w-full max-w-full overflow-x-hidden min-h-screen">
      <LandingNav go={go} openAuth={openAuth} />

      {/* HERO — on deep blue (#313851) with cream (#F6F3ED) and soft slate (#C2CBD3) */}
      <section className="bg-deepblue text-cream w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center w-full min-w-0">
          <div className="rise w-full min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mutedsage text-xs sm:text-sm font-semibold tracking-wide mb-3 sm:mb-4 border border-white/10">
              <span>Connected Educational Ecosystem</span>
              <span className="w-1.5 h-1.5 rounded-full bg-mutedsage" />
              <span>Students • Institutes • Academicians</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.1] font-semibold max-w-xl break-words">
              Master your curriculum. Explore personal passions. One unified ecosystem.
            </h1>
            <p className="mt-4 sm:mt-6 text-cream/80 text-sm sm:text-base lg:text-lg max-w-lg leading-relaxed break-words">
              VidyaSarthi brings <strong>formal education and flexible personal learning</strong> together. Follow your institute syllabus, track exam readiness with precision, build extra skills through adaptive pathways, and engage directly with cutting-edge academic research.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <Button variant="sagesolid" onClick={() => go('student')} className="text-xs sm:text-sm px-5 py-2.5 font-semibold">
                Explore Student Portal
              </Button>
              <Button
                variant="outline"
                className="border-cream/40 text-cream hover:bg-white/10 text-xs sm:text-sm px-4 py-2.5"
                onClick={() => go('institute')}
              >
                Institute Portal →
              </Button>
              <Button
                variant="outline"
                className="border-cream/40 text-cream hover:bg-white/10 text-xs sm:text-sm px-4 py-2.5"
                onClick={() => go('academician')}
              >
                Academician Portal →
              </Button>
            </div>
          </div>
          <div className="rise w-full min-w-0 max-w-full" style={{ animationDelay: '.1s' }}>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-6 w-full min-w-0 max-w-full overflow-hidden shadow-2xl backdrop-blur-sm">
              <FlowDiagram inverted={true} />
              <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">100%</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">Curriculum + Extra Learning</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">Fit Score</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">Dynamic Exam Readiness</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">Daily</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">Targeted Weak Subject Practice</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 sm:p-3.5 border border-white/5">
                  <div className="text-xl sm:text-2xl font-display text-cream font-bold">Live</div>
                  <div className="text-[11px] sm:text-xs text-cream/70 mt-0.5">Academician Research Discussions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CORE ROLES — EXACTLY 3 PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full overflow-hidden">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">Three pillars. One connected educational ecosystem.</h2>
            <p className="text-xs sm:text-sm text-deepblue/60 mt-1 max-w-md">
              Connecting student learning journeys, institutional monitoring & guidance, and academic research sharing.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
          {(['student', 'institute', 'academician'] as const).map((k) => {
            const m = PORTAL_META[k];
            return (
              <button
                key={k}
                onClick={() => go(k)}
                className="text-left rounded-2xl border border-deepblue/12 bg-white p-6 sm:p-7 hover:border-deepblue/30 hover:shadow-lg transition group focus-ring w-full relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl bg-mutedsage/50 flex items-center justify-center mb-4 group-hover:bg-mutedsage transition">
                  <Icon name={m.icon} className="w-6 h-6" />
                </div>
                <div className="font-display text-xl font-semibold mb-2 text-deepblue">{m.label} Portal</div>
                <p className="text-xs sm:text-sm text-deepblue/65 leading-relaxed mb-5">{m.blurb}</p>
                <span className="text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 text-deepblue group-hover:translate-x-1 transition-transform">
                  Enter {m.label} Portal <Icon name="arrowr" className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* DUAL-TRACK LEARNING VALUE PROPOSITION */}
      <section className="bg-mutedsage/25 border-y border-deepblue/10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full min-w-0">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-deepblue uppercase tracking-wider">The VidyaSarthi Difference</span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1">Dual-Track Learning: Curriculum + Passion</h2>
            <p className="text-xs sm:text-sm text-deepblue/70 mt-2 leading-relaxed">
              Most platforms either trap students in a rigid course or ignore their official college curriculum. VidyaSarthi balances both:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-[#E1D6AE] p-6 shadow-sm">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-sagedeep/10 text-sagedeep text-xs font-bold uppercase mb-3">
                Track A: Academic Curriculum
              </div>
              <h3 className="font-display text-lg font-semibold text-deepblue mb-2">School & College Syllabus Management</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-deepblue/75">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <strong>Syllabus Progress & Fit Score:</strong> Know exactly what percent of your syllabus is complete and your exam readiness.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <strong>Weak-Subject Detection:</strong> System analyzes exam marks and triggers automated daily practice tests.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <strong>Institute Timetable Sync:</strong> Classes, midterm exams, and practical schedules directly on your dashboard.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sagedeep" />
                  <strong>Institute Mentoring & Queries:</strong> Ask academic doubts directly to faculty with resolved tracking.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-[#E1D6AE] p-6 shadow-sm">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-deepblue/10 text-deepblue text-xs font-bold uppercase mb-3">
                Track B: Additional Learning
              </div>
              <h3 className="font-display text-lg font-semibold text-deepblue mb-2">Personal Interests, Emerging Tech & Skills</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-deepblue/75">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <strong>Diverse Subjects:</strong> Python, AI, Robotics, Data Science, Web Dev, Finance, Design, Psychology, and more.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <strong>Diagnostic Knowledge Assessment:</strong> Discrete initial test determines your starting point (Beginner/Intermediate/Advanced).
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <strong>Adaptive Pathways:</strong> Step-by-step topic nodes that dynamically advance or provide revision based on practice.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-deepblue" />
                  <strong>AI-Assisted Timetable:</strong> Intelligently blends institute schedules, extra learning, and personal sports/free time.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM FLOW */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full min-w-0">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">How information moves between roles</h2>
        <p className="text-xs sm:text-sm text-deepblue/65 mb-6 sm:mb-8 max-w-xl">
          Nothing lives in isolation — academic schedules, daily learning updates, diagnostic tests, and research discussions feed into one continuous growth loop.
        </p>
        <EcosystemFlow />
      </section>

      {/* ENTRY POINTS */}
      <section className="bg-deepblue text-cream w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center">Choose where you start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl mx-auto">
            {(['student', 'institute', 'academician'] as const).map((k) => {
              const m = PORTAL_META[k];
              return (
                <button
                  key={k}
                  onClick={() => go(k)}
                  className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-6 text-left transition focus-ring w-full group"
                >
                  <Icon name={m.icon} className="w-6 h-6 mb-4 text-mutedsage group-hover:scale-110 transition-transform" />
                  <div className="font-display font-semibold text-lg">{m.label} Portal</div>
                  <div className="text-xs text-cream/60 mt-1">Get started →</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-xs text-deepblue/50 flex flex-wrap items-center justify-between gap-3 w-full border-t border-deepblue/10">
        <span>© 2026 VidyaSarthi — Flexible Educational Ecosystem & Skill Intelligence Platform.</span>
        <span>Students • Institutes • Academicians</span>
      </footer>
    </div>
  );
};
