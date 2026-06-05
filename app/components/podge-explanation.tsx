'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, CheckCircle2, Globe2, Languages, Leaf, Network, ShieldCheck } from 'lucide-react';

type Language = 'id' | 'en';

const content = {
  id: {
    eyebrow: 'Tentang Ekosistem',
    title: 'PODGE menjahit tata kelola sawit dari kebun sampai pembiayaan hijau.',
    description:
      'PODGE Ecosystem adalah platform digital untuk membantu pelaku industri sawit membuktikan asal-usul TBS, memantau kepatuhan ESG, dan membuka akses pendanaan berkelanjutan dengan data yang mudah diaudit.',
    languageLabel: 'Bahasa',
    primaryCta: 'Lihat Traceability',
    secondaryCta: 'Buka Green Sukuk',
    pillars: [
      {
        title: 'Ketertelusuran TBS',
        description:
          'Setiap batch dicatat sebagai jejak digital: sumber kebun, koperasi, berat, status verifikasi, dan bukti pendukung.',
        icon: Network,
      },
      {
        title: 'Kepatuhan ESG',
        description:
          'Data sertifikasi, prinsip NDPE, dan evaluasi kepatuhan disatukan agar koperasi dan pabrik lebih siap menghadapi audit.',
        icon: ShieldCheck,
      },
      {
        title: 'Nilai Ekonomi',
        description:
          'Data rantai pasok diterjemahkan menjadi insight volume, dampak ekonomi, dan peluang pembiayaan ramah lingkungan.',
        icon: BarChart3,
      },
    ],
    flowTitle: 'Cara kerja singkat',
    flow: [
      'Petani atau koperasi mencatat batch TBS dan bukti panen.',
      'Pabrik serta evaluator memverifikasi status pasok dan kepatuhan.',
      'Dashboard menampilkan traceability, risiko, dan peluang green financing.',
    ],
    outcomeTitle: 'Hasil yang dituju',
    outcomes: ['Pasar global lebih percaya', 'Audit lebih cepat', 'Pembiayaan hijau lebih terukur'],
  },
  en: {
    eyebrow: 'About The Ecosystem',
    title: 'PODGE connects palm oil governance from farm origin to green finance.',
    description:
      'PODGE Ecosystem is a digital platform that helps palm oil stakeholders prove FFB origin, monitor ESG compliance, and unlock sustainable financing through auditable data.',
    languageLabel: 'Language',
    primaryCta: 'View Traceability',
    secondaryCta: 'Open Green Sukuk',
    pillars: [
      {
        title: 'FFB Traceability',
        description:
          'Every batch becomes a digital trail: farm source, cooperative, weight, verification status, and supporting evidence.',
        icon: Network,
      },
      {
        title: 'ESG Compliance',
        description:
          'Certification data, NDPE principles, and compliance reviews are unified so cooperatives and mills are audit-ready.',
        icon: ShieldCheck,
      },
      {
        title: 'Economic Value',
        description:
          'Supply-chain data turns into volume insight, economic impact visibility, and measurable green financing opportunities.',
        icon: BarChart3,
      },
    ],
    flowTitle: 'How it works',
    flow: [
      'Farmers or cooperatives register FFB batches and harvest evidence.',
      'Mills and evaluators verify supply status and compliance posture.',
      'Dashboards show traceability, risk signals, and green financing opportunities.',
    ],
    outcomeTitle: 'Target outcomes',
    outcomes: ['Stronger global market trust', 'Faster audit readiness', 'More measurable green finance'],
  },
} satisfies Record<Language, {
  eyebrow: string;
  title: string;
  description: string;
  languageLabel: string;
  primaryCta: string;
  secondaryCta: string;
  pillars: {
    title: string;
    description: string;
    icon: typeof Network;
  }[];
  flowTitle: string;
  flow: string[];
  outcomeTitle: string;
  outcomes: string[];
}>;

export default function PodgeExplanation() {
  const [language, setLanguage] = useState<Language>('id');
  const copy = content[language];

  return (
    <section className="relative z-10 border-t border-emerald-900/30 bg-[#06110b]/80 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
              <Leaf size={14} />
              <span>{copy.eyebrow}</span>
            </div>
            <h2 className="font-space text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-100/65 sm:text-base">
              {copy.description}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 rounded-lg border border-emerald-800/60 bg-black/30 p-2 sm:w-auto">
            <div className="flex items-center gap-2 px-2 text-[11px] font-mono uppercase tracking-widest text-emerald-400/80">
              <Languages size={14} />
              <span>{copy.languageLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {([
                ['id', 'Indonesia'],
                ['en', 'English'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                    language === value
                      ? 'bg-emerald-500 text-black shadow-[0_0_18px_rgba(16,185,129,0.28)]'
                      : 'text-emerald-100/75 hover:bg-emerald-950/70 hover:text-white'
                  }`}
                  aria-pressed={language === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {copy.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="glass-panel rounded-lg p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <Icon size={21} />
                </div>
                <h3 className="font-space text-lg font-bold text-emerald-50">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-100/60">{pillar.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-emerald-900/55 bg-black/25 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-200">
              <Globe2 size={18} />
              <span>{copy.flowTitle}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {copy.flow.map((step, index) => (
                <div key={step} className="rounded-lg border border-emerald-900/45 bg-emerald-950/25 p-4">
                  <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-xs font-extrabold text-black">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-emerald-50/80">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-900/55 bg-black/25 p-5">
            <h3 className="font-space text-lg font-bold text-emerald-50">{copy.outcomeTitle}</h3>
            <div className="mt-4 space-y-3">
              {copy.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-3 text-sm text-emerald-100/75">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={17} />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/governance/traceability"
                className="rounded-lg bg-emerald-500 px-4 py-3 text-center text-sm font-bold text-black transition hover:bg-emerald-400"
              >
                {copy.primaryCta}
              </Link>
              <Link
                href="/value-creation/green-sukuk"
                className="rounded-lg border border-emerald-700/70 px-4 py-3 text-center text-sm font-bold text-emerald-50 transition hover:bg-emerald-950/60"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
