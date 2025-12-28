/**
 * Reports API - Vercel Serverless Function
 * Handles bug reports using Neon DB and imgbb for images
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case "GET":
                return await handleGet(req, res);
            case "POST":
                return await handlePost(req, res);
            case "PUT":
                return await handleUpdate(req, res);
            default:
                return res.status(405).json({ error: "Method not allowed" });
        }
    } catch (error) {
        console.error("Reports API error:", error);
        return res.status(500).json({ error: error.message });
    }
}

// Get reports (all for admin, or by android_id for user)
async function handleGet(req, res) {
    const { android_id, admin } = req.query;

    if (admin === process.env.ADMIN_KEY) {
        // Admin: get all reports
        const reports = await sql`
      SELECT * FROM reports ORDER BY created_at DESC
    `;
        return res.status(200).json(reports);
    }

    if (!android_id) {
        return res.status(400).json({ error: "Missing android_id" });
    }

    // User: get their reports
    const reports = await sql`
    SELECT id, message, image_url, status, created_at 
    FROM reports 
    WHERE android_id = ${android_id}
    ORDER BY created_at DESC
  `;
    return res.status(200).json(reports);
}

// Create new report
async function handlePost(req, res) {
    const { android_id, message, image_url } = req.body;

    if (!android_id || !message) {
        return res.status(400).json({ error: "Missing android_id or message" });
    }

    if (message.length > 444) {
        return res.status(400).json({ error: "Message exceeds 444 character limit" });
    }

    const result = await sql`
    INSERT INTO reports (android_id, message, image_url, status, created_at)
    VALUES (${android_id}, ${message}, ${image_url || null}, 'pending', NOW())
    RETURNING id
  `;

    return res.status(201).json({
        success: true,
        id: result[0].id,
        message: "Report submitted successfully"
    });
}

// Update report status (admin only)
async function handleUpdate(req, res) {
    const { id, status, admin_key } = req.body;

    if (admin_key !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    if (!id || !status) {
        return res.status(400).json({ error: "Missing id or status" });
    }

    if (!['pending', 'resolved'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    await sql`
    UPDATE reports SET status = ${status} WHERE id = ${id}
  `;

    return res.status(200).json({ success: true });
}
