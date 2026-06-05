'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Anchor, Factory, Leaf, MapPin, PackageCheck, RadioTower, Ship, Warehouse } from 'lucide-react';

type TraceabilityLog = {
  id: string | number;
  batch_id: string;
  farmer_name: string;
  tbs_weight_kg: number | string;
  pks_destination: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
};

type SupplyNode = {
  id: string;
  label: string;
  type: 'farm' | 'coop' | 'mill' | 'port' | 'buyer';
  x: number;
  y: number;
  region: string;
};

type RouteBatch = {
  id: string;
  log: TraceabilityLog;
  nodes: SupplyNode[];
  progress: number;
};

const baseNodes: SupplyNode[] = [
  { id: 'farm-riau', label: 'Kebun Riau', type: 'farm', x: 18, y: 60, region: 'Riau' },
  { id: 'coop-sumatra', label: 'Koperasi Sumatra', type: 'coop', x: 30, y: 52, region: 'Sumatra' },
  { id: 'mill-pks', label: 'PKS Validasi', type: 'mill', x: 45, y: 58, region: 'Riau' },
  { id: 'port-belawan', label: 'Pelabuhan Belawan', type: 'port', x: 58, y: 47, region: 'Medan' },
  { id: 'buyer-global', label: 'Global Buyer', type: 'buyer', x: 82, y: 35, region: 'Export Market' },
];

const fallbackLogs: TraceabilityLog[] = [
  {
    id: 'demo-001',
    batch_id: 'BATCH-2026-001',
    farmer_name: 'Koperasi Sawit Makmur',
    tbs_weight_kg: 4200,
    pks_destination: 'PKS Validasi Riau',
    blockchain_hash: '0x28d154eb8200b92c64efb208fe688a709e617256574ed6d0d533620cc1f1af9e',
    status: 'Terverifikasi',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-002',
    batch_id: 'BATCH-2026-002',
    farmer_name: 'Kelompok Tani Berkah',
    tbs_weight_kg: 3500,
    pks_destination: 'PKS PT Aura Sawit',
    blockchain_hash: '0x43cf9b778d4afd1d6d1fdcce282313a0f83b131ea10f1ed1dc9271f1a0b067a1',
    status: 'Dalam Proses',
    created_at: new Date().toISOString(),
  },
];

const nodeIcon = {
  farm: Leaf,
  coop: Warehouse,
  mill: Factory,
  port: Anchor,
  buyer: Ship,
};

function buildPath(nodes: SupplyNode[]) {
  return nodes.map((node, index) => `${index === 0 ? 'M' : 'L'} ${node.x} ${node.y}`).join(' ');
}

function getBatchPoint(nodes: SupplyNode[], progress: number) {
  const routeProgress = Math.max(0, Math.min(progress, 0.98));
  const segmentCount = nodes.length - 1;
  const segment = Math.min(Math.floor(routeProgress * segmentCount), segmentCount - 1);
  const localProgress = routeProgress * segmentCount - segment;
  const start = nodes[segment];
  const end = nodes[segment + 1];

  return {
    x: start.x + (end.x - start.x) * localProgress,
    y: start.y + (end.y - start.y) * localProgress,
  };
}

function getStatusClass(status: string) {
  if (status === 'Terverifikasi') {
    return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300';
  }

  if (status === 'Dalam Proses') {
    return 'border-lime-400/40 bg-lime-500/15 text-lime-300';
  }

  return 'border-yellow-400/40 bg-yellow-500/15 text-yellow-300';
}

export default function SupplyChainMap({ logs }: { logs: TraceabilityLog[] }) {
  const batches = useMemo<RouteBatch[]>(() => {
    const sourceLogs = logs.length > 0 ? logs : fallbackLogs;

    return sourceLogs.slice(0, 5).map((log, index) => ({
      id: String(log.id),
      log,
      nodes: baseNodes.map((node) => {
        if (node.type !== 'mill') {
          return node;
        }

        return {
          ...node,
          label: log.pks_destination || node.label,
        };
      }),
      progress: log.status === 'Terverifikasi' ? 0.86 : 0.52 + index * 0.06,
    }));
  }, [logs]);

  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id ?? '');
  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId) ?? batches[0];

  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="grid min-h-[520px] grid-cols-1 xl:grid-cols-[1fr_360px]">
        <div className="relative min-h-[520px] border-b border-emerald-900/70 bg-[#020604] xl:border-b-0 xl:border-r">
          <div className="absolute inset-0 web3-grid opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_55%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_78%_32%,rgba(132,204,22,0.11),transparent_24%)]" />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 p-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                <RadioTower size={12} />
                Live Supply Chain Map
              </div>
              <h2 className="mt-3 text-xl font-bold text-emerald-50 font-space">Indonesia Palm Flow</h2>
              <p className="mt-1 max-w-2xl text-sm text-emerald-200/55">
                Visual rute batch TBS dari kebun, koperasi, PKS, pelabuhan, sampai buyer global.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-black/35 px-4 py-3 text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Active Batch</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-50 font-space">{batches.length}</p>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-2 h-[360px] max-w-5xl px-4">
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              <path
                d="M 12 66 C 21 50, 31 47, 41 57 C 52 69, 67 47, 83 36 C 89 32, 93 33, 95 38"
                fill="none"
                stroke="rgba(16,185,129,0.07)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M 10 69 C 21 58, 28 48, 39 53 C 47 57, 55 67, 64 55 C 74 42, 84 34, 93 38"
                fill="rgba(6,78,59,0.18)"
                stroke="rgba(16,185,129,0.28)"
                strokeWidth="0.6"
              />

              {batches.map((batch, index) => (
                <g key={batch.id}>
                  <path
                    d={buildPath(batch.nodes)}
                    fill="none"
                    stroke={selectedBatch?.id === batch.id ? 'rgba(52,211,153,0.95)' : 'rgba(16,185,129,0.28)'}
                    strokeWidth={selectedBatch?.id === batch.id ? 0.7 : 0.35}
                    strokeDasharray={selectedBatch?.id === batch.id ? '0' : '1.2 1.2'}
                    strokeLinecap="round"
                  />
                  {(() => {
                    const point = getBatchPoint(batch.nodes, batch.progress);
                    return (
                      <g
                        role="button"
                        tabIndex={0}
                        aria-label={`Pilih ${batch.log.batch_id}`}
                        onClick={() => setSelectedBatchId(batch.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            setSelectedBatchId(batch.id);
                          }
                        }}
                        className="cursor-pointer outline-none"
                      >
                        <circle cx={point.x} cy={point.y + index * 1.15} r="2.8" fill="rgba(16,185,129,0.18)" />
                        <circle cx={point.x} cy={point.y + index * 1.15} r="1.1" fill="#34d399">
                          <animate attributeName="r" values="1.1;2.1;1.1" dur="2.2s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    );
                  })()}
                </g>
              ))}

              {baseNodes.map((node) => (
                <foreignObject key={node.id} x={node.x - 5} y={node.y - 5} width="10" height="10">
                  <button
                    type="button"
                    className="flex h-full w-full items-center justify-center rounded-full border border-emerald-400/35 bg-black/70 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500 hover:text-black"
                    title={node.label}
                  >
                    {(() => {
                      const Icon = nodeIcon[node.type];
                      return <Icon size={18} />;
                    })()}
                  </button>
                </foreignObject>
              ))}
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 px-5 pb-5 md:grid-cols-5">
            {baseNodes.map((node) => {
              const Icon = nodeIcon[node.type];
              return (
                <div key={node.id} className="rounded-lg border border-emerald-900/70 bg-black/35 p-3">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Icon size={15} />
                    <span className="text-[10px] font-mono uppercase tracking-wider">{node.type}</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-emerald-50">{node.label}</p>
                  <p className="text-xs text-emerald-200/45">{node.region}</p>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="bg-black/25 p-5">
          <div className="flex items-center justify-between border-b border-emerald-900/70 pb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Selected Passport</p>
              <h3 className="mt-1 text-lg font-bold text-emerald-50 font-space">{selectedBatch?.log.batch_id}</h3>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusClass(selectedBatch?.log.status ?? '')}`}>
              {selectedBatch?.log.status}
            </span>
          </div>

          {selectedBatch ? (
            <Link
              href={`/verify/${encodeURIComponent(selectedBatch.log.batch_id)}`}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400"
            >
              Open Digital Passport
            </Link>
          ) : null}

          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <MapPin size={15} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Origin</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-50">{selectedBatch?.log.farmer_name}</p>
              <p className="text-xs text-emerald-200/45">Registered farmer/cooperative node</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Volume</p>
                <p className="mt-2 text-xl font-extrabold text-emerald-50 font-space">
                  {Number(selectedBatch?.log.tbs_weight_kg ?? 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-emerald-200/45">Kg TBS</p>
              </div>
              <div className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Trust</p>
                <p className="mt-2 text-xl font-extrabold text-emerald-50 font-space">
                  {selectedBatch?.log.status === 'Terverifikasi' ? '96' : '78'}
                </p>
                <p className="text-xs text-emerald-200/45">Score</p>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <PackageCheck size={15} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Destination</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-50">{selectedBatch?.log.pks_destination}</p>
              <p className="text-xs text-emerald-200/45">
                {selectedBatch ? new Date(selectedBatch.log.created_at).toLocaleString('id-ID') : ''}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-900/70 bg-black/30 p-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Blockchain Hash</p>
              <p className="mt-2 break-all font-mono text-xs leading-relaxed text-emerald-200/70">
                {selectedBatch?.log.blockchain_hash}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {batches.map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => setSelectedBatchId(batch.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                  selectedBatch?.id === batch.id
                    ? 'border-emerald-400/50 bg-emerald-500/10'
                    : 'border-emerald-900/60 bg-black/20 hover:border-emerald-600/50'
                }`}
              >
                <span className="font-mono text-xs font-bold text-emerald-300">{batch.log.batch_id}</span>
                <span className="text-xs text-emerald-200/50">{batch.log.status}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
