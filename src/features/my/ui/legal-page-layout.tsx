'use client';

import { SubPageHeader } from './sub-page-header';

interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SubPageHeader title={title} />
      <article className="px-4 py-6 text-sm text-slate-700 leading-relaxed space-y-6">
        {children}
      </article>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-foreground pt-2">{children}</h2>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-foreground pt-1">{children}</h3>;
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function OrderedList({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal pl-5 space-y-1">{children}</ol>;
}

function UnorderedList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1">{children}</ul>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="py-2 px-3 text-left font-semibold text-foreground bg-slate-50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EffectiveDate({ date }: { date: string }) {
  return (
    <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
      이 약관은 {date}부터 시행합니다.
    </p>
  );
}

export { SectionTitle, SubTitle, Paragraph, OrderedList, UnorderedList, Table, EffectiveDate };
