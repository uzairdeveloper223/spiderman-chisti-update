/**
 * Image Upload API - Vercel Serverless Function
 * Uploads images to imgbb
 */

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { image } = req.body; // Base64 image data

        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

        if (!IMGBB_API_KEY) {
            return res.status(500).json({ error: "imgbb API key not configured" });
        }

        // Upload to imgbb
        const formData = new URLSearchParams();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', image);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return res.status(200).json({
                success: true,
                url: data.data.url,
                delete_url: data.data.delete_url
            });
        } else {
            return res.status(400).json({ error: "Failed to upload image" });
        }

    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: error.message });
    }
}
