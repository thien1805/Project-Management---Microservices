const pool = require('../config/db');

const toPositiveIntegerArray = (value, fieldName) => {
  if (value === undefined) return [];

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array when provided`);
  }

  const parsed = value.map((item) => Number(item));
  if (parsed.some((item) => !Number.isInteger(item) || item <= 0)) {
    throw new Error(`${fieldName} must contain only positive integers`);
  }

  return parsed;
};

const createNotification = async (payload) => {
  const {
    event_type,
    title,
    message,
    recipient_ids,
    metadata,
    source_service,
    source_reference,
  } = payload;

  if (!event_type || typeof event_type !== 'string') {
    throw new Error('event_type is required and must be a string');
  }

  if (!title || typeof title !== 'string') {
    throw new Error('title is required and must be a string');
  }

  if (!message || typeof message !== 'string') {
    throw new Error('message is required and must be a string');
  }

  const recipientIds = toPositiveIntegerArray(recipient_ids, 'recipient_ids');
  const normalizedMetadata = metadata && typeof metadata === 'object' ? metadata : {};

  const result = await pool.query(
    `INSERT INTO notification.notifications
      (event_type, title, message, recipient_ids, metadata, source_service, source_reference)
     VALUES ($1, $2, $3, $4::BIGINT[], $5::JSONB, $6, $7)
     RETURNING id, event_type, title, message, recipient_ids, metadata, source_service, source_reference, created_at`,
    [
      event_type,
      title,
      message,
      recipientIds,
      JSON.stringify(normalizedMetadata),
      source_service || 'unknown',
      source_reference || null,
    ]
  );

  return result.rows[0];
};

const listNotifications = async (query) => {
  const { event_type, source_service, recipient_id, limit } = query;
  const values = [];
  const conditions = [];

  if (event_type) {
    values.push(event_type);
    conditions.push(`event_type = $${values.length}`);
  }

  if (source_service) {
    values.push(source_service);
    conditions.push(`source_service = $${values.length}`);
  }

  if (recipient_id !== undefined) {
    const parsedRecipientId = Number(recipient_id);
    if (!Number.isInteger(parsedRecipientId) || parsedRecipientId <= 0) {
      throw new Error('recipient_id must be a positive integer');
    }

    values.push(parsedRecipientId);
    conditions.push(`$${values.length} = ANY(recipient_ids)`);
  }

  const parsedLimit = Number(limit);
  const hasLimit = Number.isInteger(parsedLimit) && parsedLimit > 0;
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  let queryText = `
    SELECT id, event_type, title, message, recipient_ids, metadata, source_service, source_reference, created_at
    FROM notification.notifications
    ${whereClause}
    ORDER BY created_at DESC
  `;

  if (hasLimit) {
    values.push(parsedLimit);
    queryText += ` LIMIT $${values.length}`;
  }

  const result = await pool.query(queryText, values);
  return result.rows;
};

module.exports = {
  createNotification,
  listNotifications,
};
