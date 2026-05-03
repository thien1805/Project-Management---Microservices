const pool = require('./db');

const initializeNotificationSchema = async () => {
  await pool.query('CREATE SCHEMA IF NOT EXISTS notification');

  await pool.query(`
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
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_event_type ON notification.notifications (event_type)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_source_service ON notification.notifications (source_service)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notification.notifications (created_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_recipient_ids_gin ON notification.notifications USING GIN (recipient_ids)`);
};

module.exports = {
  initializeNotificationSchema,
};