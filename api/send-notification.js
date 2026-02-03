// api/notify.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // সার্ভার সাইডে কী (Key) রাখা নিরাপদ
    const REST_API_KEY = "os_v2_app_qgi6hc5el5cs5n5ylfxjo4mufqgpy2ttp6au7cnemjmmitzgidoib46k42nch5pxij5hr4ktw5hf3md57a2rpvwad5nhqilcerqgmkq";

    try {
        const response = await fetch("https://onesignal.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });
        const result = await response.json();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
