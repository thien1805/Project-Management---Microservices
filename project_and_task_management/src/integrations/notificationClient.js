const NOTIFICATION_URL =
  process.env.NOTIFICATION_URL ||
  process.env.PROJECT_NOTIFICATION_URL ||
  'http://localhost:3002/api/notifications';

const rawNotificationEnabled =
  process.env.NOTIFICATION_ENABLED ?? process.env.PROJECT_NOTIFICATION_ENABLED;
const NOTIFICATION_ENABLED = String(rawNotificationEnabled ?? 'true').toLowerCase() !== 'false';

const normalizeNotificationUrl = (url) => {
  const normalizedUrl = new URL(url);
  if (!normalizedUrl.pathname.endsWith('/')) {
    normalizedUrl.pathname = `${normalizedUrl.pathname}/`;
  }
  return normalizedUrl.toString();
};

console.log('[Notification Client] NOTIFICATION_ENABLED:', NOTIFICATION_ENABLED);
console.log('[Notification Client] NOTIFICATION_URL:', normalizeNotificationUrl(NOTIFICATION_URL));

const sendNotification = async (payload) => {
  if (!NOTIFICATION_ENABLED) {
    console.log('[Notification Client] Notifications disabled, skipping');
    return null;
  }

  const targetUrl = normalizeNotificationUrl(NOTIFICATION_URL);

  console.log('[Notification Client] Sending notification to:', targetUrl);
  console.log('[Notification Client] Payload:', JSON.stringify(payload, null, 2));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Notification Client] Notification service rejected:', response.status, text);
      return null;
    }

    console.log('[Notification Client] Notification sent successfully');
    return await response.json();
  } catch (error) {
    console.error('[Notification Client] Cannot send notification:', error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  sendNotification,
};
