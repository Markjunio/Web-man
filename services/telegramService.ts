/**
 * Sends transaction or checkout data to a Telegram bot.
 * Configured with the user's active bot credentials.
 */
export const sendTelegramNotification = async (data: any) => {
  const BOT_TOKEN = '8000421502:AAGkDp1Tsm20VY2owL7P7uYw3LBlWhrxPQQ';
  const CHAT_ID = '5046522791';
  
  let message = '';

  if (data.type === 'CHECKOUT') {
    message = `
🚀 *NEW ORDER RECEIVED*
-------------------------------
👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
📞 *Phone:* ${data.phone}
💳 *Method:* ${data.paymentMethod}
💰 *Total:* $${data.total}
📦 *Items:* ${data.items}
-------------------------------
_Status: Awaiting Support Contact_
    `;
  } else {
    message = `
🚀 *NEW QUANTUM FLASH INITIATED*
-------------------------------
📦 *Product:* ${data.product}
🔑 *License:* \`${data.license}\`
💰 *Amount:* ${data.amount}
🏦 *Wallet:* \`${data.wallet}\`
🕒 *Time:* ${new Date().toLocaleString()}
-------------------------------
_Status: Processing in Dimensional Tunnel..._
    `;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    if (!response.ok) {
      const errData = await response.json();
      console.error('Telegram API error:', errData);
    } else {
      console.log('Telegram sync complete.');
    }
  } catch (e) {
    console.error('Telegram notification failed. Check network or tokens.', e);
  }
};