import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  children?: React.ReactNode;
  term?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, children, term }) => {
  return (
    <span
      className="inline-flex items-center gap-1 cursor-help group"
      data-tooltip-id="seo-tooltip"
      data-tooltip-content={content}
      tabIndex={0}
    >
      {children ? (
        <span className="border-b border-dotted border-slate-400 group-hover:border-indigo-600 transition-colors">
          {children}
        </span>
      ) : term ? (
        <span className="border-b border-dotted border-slate-400 group-hover:border-indigo-600 transition-colors font-medium">
          {term}
        </span>
      ) : null}
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
    </span>
  );
};
