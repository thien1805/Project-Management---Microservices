CREATE SCHEMA IF NOT EXISTS notification;

CREATE TABLE IF NOT EXISTS notification.notifications (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_ids BIGINT[] NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_service VARCHAR(100) NOT NULL DEFAULT 'unknown',
    source_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_event_type
    ON notification.notifications (event_type);

CREATE INDEX IF NOT EXISTS idx_notifications_source_service
    ON notification.notifications (source_service);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notification.notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_ids_gin
    ON notification.notifications USING GIN (recipient_ids);
