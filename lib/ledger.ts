import crypto from 'crypto';
import { query } from '@/lib/db';

export type LedgerActor = {
  adminId?: string | null;
  roleId?: string | null;
  name?: string | null;
};

export type LedgerEventRecord = {
  event_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_admin_id: string | null;
  actor_role_id: string | null;
  actor_name: string;
  payload: Record<string, unknown>;
  previous_hash: string | null;
  event_hash: string;
  created_at: string | Date;
};

export async function ensureLedgerEventsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ledger_events (
      event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor_admin_id UUID,
      actor_role_id TEXT,
      actor_name TEXT NOT NULL DEFAULT 'System',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      previous_hash TEXT,
      event_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_ledger_events_entity_created_at
    ON ledger_events(entity_type, entity_id, created_at DESC)
  `);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function createEventHash(input: {
  entityType: string;
  entityId: string;
  action: string;
  actorName: string;
  payload: Record<string, unknown>;
  previousHash: string | null;
}) {
  return crypto
    .createHash('sha256')
    .update(stableStringify(input))
    .digest('hex');
}

export async function appendLedgerEvent({
  entityType,
  entityId,
  action,
  actor,
  payload = {},
}: {
  entityType: string;
  entityId: string;
  action: string;
  actor?: LedgerActor;
  payload?: Record<string, unknown>;
}) {
  await ensureLedgerEventsTable();

  const previous = await query<{ event_hash: string }>(
    `SELECT event_hash
     FROM ledger_events
     WHERE entity_type = $1 AND entity_id = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [entityType, entityId],
  );
  const previousHash = previous.rows[0]?.event_hash || null;
  const actorName = actor?.name || 'System';
  const eventHash = createEventHash({
    entityType,
    entityId,
    action,
    actorName,
    payload,
    previousHash,
  });

  const result = await query<LedgerEventRecord>(
    `INSERT INTO ledger_events (
      entity_type,
      entity_id,
      action,
      actor_admin_id,
      actor_role_id,
      actor_name,
      payload,
      previous_hash,
      event_hash
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
    RETURNING *`,
    [
      entityType,
      entityId,
      action,
      actor?.adminId || null,
      actor?.roleId || null,
      actorName,
      JSON.stringify(payload),
      previousHash,
      eventHash,
    ],
  );

  return result.rows[0];
}
