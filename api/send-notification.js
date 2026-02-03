// api/send-notification.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'os_v2_app_qgi6hc5el5cs5n5ylfxjo4mufqgpy2ttp6au7cnemjmmitzgidoib46k42nch5pxij5hr4ktw5hf3md57a2rpvwad5nhqilcerqgmkq' // এখানে আপনার কী দিন
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
