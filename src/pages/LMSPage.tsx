import React from 'react';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle, DSCardSubtitle } from '../components/design-system/DSCard';
import { DSBadge } from '../components/design-system/DSStatus';
import { GraduationCap, Award, BookOpen, Settings } from 'lucide-react';

export const LMSPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            LMS - Agent Training Academy
          </h1>
          <DSBadge variant="outline" color="slate">Future Roadmap</DSBadge>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Machine learning curriculum, tool usage validation, and semantic fine-tuning course registries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Prompt Engineering Core</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Comprehensive curriculum regarding contextual window allocation, grounding parameters, and system directives.
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Tool Call Fine-Tuning</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Training agents to precisely parse JSON arguments, respect method schemas, and safely handle failure retry loops.
          </DSCardContent>
        </DSCard>

        <DSCard variant="bordered">
          <DSCardHeader>
            <DSCardTitle className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Safety Certifications</span>
            </DSCardTitle>
          </DSCardHeader>
          <DSCardContent className="text-xs text-slate-400 leading-normal">
            Automated verification audits testing agents against adversarial prompt injections and corporate data extraction policies.
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  );
};
