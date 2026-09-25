import React from 'react';

interface FlowDiagramProps {
  inverted?: boolean;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ inverted = false }) => {
  const steps = ['Curriculum', 'Extra Skills', 'Assess', 'Practice', 'Research', 'Excel'];
  return (
    <div className="w-full max-w-full py-1 px-1">
      <div className="grid grid-cols-6 gap-0 w-full">
        {steps.map((s, i) => (
          <div key={s} className="relative flex flex-col items-center min-w-0">
            {i < steps.length - 1 && (
              <div
                className={`block absolute top-[18px] sm:top-[20px] left-[calc(50%+20px)] sm:left-[calc(50%+22px)] w-[calc(100%-40px)] sm:w-[calc(100%-44px)] h-[1.5px] pointer-events-none ${
                  inverted
                    ? 'bg-gradient-to-r from-white/30 via-white/45 to-white/30'
                    : 'bg-gradient-to-r from-deepblue/25 via-deepblue/45 to-deepblue/25'
                }`}
              />
            )}
            <div
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-display text-xs sm:text-sm font-semibold transition-transform ${
                inverted
                  ? 'bg-white/10 border-white/25 text-cream shadow-inner'
                  : 'bg-mutedsage/40 border-deepblue/15 text-deepblue'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[9.5px] sm:text-[11px] font-semibold mt-1.5 text-center leading-tight whitespace-nowrap ${
                inverted ? 'text-cream/85' : 'text-deepblue/80'
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EcosystemFlow: React.FC = () => {
  const rows = [
    {
      who: 'Student',
      flow: 'Academic Curriculum + Personal Interests → Diagnostic Test → Adaptive Pathway → Daily Updates → Exam Readiness (Fit Score) → Research Discussion'
    },
    {
      who: 'Institute',
      flow: 'Academic Schedules → Student Progress & Potential → Marks Management → Weak Subject Detection → Targeted Practice → Mentoring'
    },
    {
      who: 'Academician',
      flow: 'Publishes Research Papers → Students Discover & Inquire → Technical Discussions & Mentoring → Direct Academic Impact'
    },
  ];
  return (
    <div className="space-y-3 w-full max-w-full">
      {rows.map((r) => (
        <div
          key={r.who}
          className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-xl border border-deepblue/12 bg-white/60 px-3.5 py-3 sm:px-4 sm:py-3.5 break-words w-full shadow-sm"
        >
          <div className="sm:w-36 shrink-0 font-display font-semibold text-deepblue text-sm sm:text-base">{r.who}</div>
          <div className="text-xs sm:text-sm text-deepblue/75 leading-relaxed">{r.flow}</div>
        </div>
      ))}
    </div>
  );
};
