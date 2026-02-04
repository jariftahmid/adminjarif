export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Vercel-e req.body kintu object hishebe thakar kotha, jodi na hoy manually parse korbe
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { title, slug, imageUrl } = body;

    if (!title || !slug) {
        return res.status(400).json({ error: "Title and Slug are required" });
    }

    // 🔥 Ei Key-ta jodi kaaj na kore, OneSignal dashboard theke "Revoke" kore noutun key generate korun
    const REST_API_KEY = "os_v2_app_darzd2dsvnazxkjan56u62l54zr4ljvvnn6erqexaeweybtzjmhzuhfnosn565am4c5ljhakpyhcqszxyugehrl6xxtaug34efmedgy";
    const APP_ID = "182391e8-72ab-419b-a920-6f7d4f697de6";

    try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${REST_API_KEY.trim()}` // Trim use kora hoyeche space remove korte
            },
            body: JSON.stringify({
                app_id: APP_ID,
                included_segments: ["Subscribed Users"], // "Total Subscriptions" theke "Subscribed Users" safe
                headings: { "en": "New Article Published! 📢" },
                contents: { "en": title },
                url: `https://boardques.vercel.app/article/${slug}`,
                chrome_web_image: imageUrl || "",
                chrome_web_icon: "https://boardques.vercel.app/favicon.png"
            })
        });

        const result = await response.json();

        if (response.ok) {
            return res.status(200).json(result);
        } else {
            // Error hole console-e detail dekhabe
            return res.status(response.status).json(result);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}