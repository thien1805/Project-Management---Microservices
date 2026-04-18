const { notifications, nextId } = require('../store/inMemoryStore');

const createNotification = (payload) => {
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

  if (recipient_ids && !Array.isArray(recipient_ids)) {
    throw new Error('recipient_ids must be an array when provided');
  }

  const record = {
    id: nextId(),
    event_type,
    title,
    message,
    recipient_ids: recipient_ids || [],
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
    source_service: source_service || 'unknown',
    source_reference: source_reference || null,
    created_at: new Date().toISOString(),
  };

  notifications.unshift(record);
  return record;
};

const listNotifications = (query) => {
  const { event_type, source_service, recipient_id, limit } = query;

  let result = notifications;

  if (event_type) {
    result = result.filter((item) => item.event_type === event_type);
  }

  if (source_service) {
    result = result.filter((item) => item.source_service === source_service);
  }

  if (recipient_id) {
    const parsedRecipientId = Number(recipient_id);
    result = result.filter((item) => item.recipient_ids.includes(parsedRecipientId));
  }

  const parsedLimit = Number(limit);
  if (parsedLimit > 0) {
    return result.slice(0, parsedLimit);
  }

  return result;
};

module.exports = {
  createNotification,
  listNotifications,
};
