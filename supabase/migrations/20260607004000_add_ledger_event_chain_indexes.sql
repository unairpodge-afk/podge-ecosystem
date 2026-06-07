CREATE INDEX IF NOT EXISTS idx_ledger_events_entity_created_at
ON ledger_events(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_events_event_hash
ON ledger_events(event_hash);
