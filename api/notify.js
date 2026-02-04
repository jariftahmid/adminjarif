export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Body parsing check
    const { title, slug, imageUrl } = req.body;
    if (!title || !slug) {
        return res.status(400).json({ error: "Missing title or slug" });
    }

    const REST_API_KEY = "os_v2_app_darzd2dsvnazxkjan56u62l54zr4ljvvnn6erqexaeweybtzjmhzuhfnosn565am4c5ljhakpyhcqszxyugehrl6xxtaug34efmedgy";
    const APP_ID = "182391e8-72ab-419b-a920-6f7d4f697de6";

    try {
        // OneSignal API Call
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: APP_ID,
                included_segments: ["Total Subscriptions"],
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
            // OneSignal theke error asle seta pass korbe
            return res.status(response.status).json(result);
        }
    } catch (error) {
        console.error("Vercel Server Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}