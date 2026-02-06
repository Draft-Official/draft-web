'use client';

interface StepHeaderProps {
  step: number;
  title: string;
  icon: React.ElementType;
}

export function StepHeader({ step, title, icon: Icon }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#FF6600]" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">STEP {step}</p>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
    </div>
  );
}
