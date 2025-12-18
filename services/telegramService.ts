
/**
 * Sends transaction data to a Telegram bot.
 * Replace with your actual BOT_TOKEN and CHAT_ID.
 */
export const sendTelegramNotification = async (data: {
  product: string;
  wallet: string;
  amount: string;
  license: string;
}) => {
  // Placeholder credentials - User should replace these in their env
  const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
  const CHAT_ID = 'YOUR_CHAT_ID_HERE';
  
  const message = `
🚀 *NEW QUANTUM FLASH INITIATED*
-------------------------------
📦 *Product:* ${data.product}
🔑 *License:* \`${data.license}\`
💰 *Amount:* ${data.amount} USDT
🏦 *Wallet:* \`${data.wallet}\`
🕒 *Time:* ${new Date().toLocaleString()}
-------------------------------
_Status: Processing in Dimensional Tunnel..._
  `;

  try {
    // Note: This fetch will fail if tokens aren't provided, but we wrap it to not break the UI flow
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log('Telegram sync complete.');
  } catch (e) {
    console.error('Telegram notification failed. Check tokens.', e);
  }
};
