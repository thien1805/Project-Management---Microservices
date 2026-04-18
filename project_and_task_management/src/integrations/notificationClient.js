const NOTIFICATION_URL =
  process.env.NOTIFICATION_URL || 'http://localhost:3002/api/notifications';
const NOTIFICATION_ENABLED = process.env.NOTIFICATION_ENABLED !== 'false';

const sendNotification = async (payload) => {
  if (!NOTIFICATION_ENABLED) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(NOTIFICATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Notification service rejected payload:', text);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Cannot send notification:', error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  sendNotification,
};
