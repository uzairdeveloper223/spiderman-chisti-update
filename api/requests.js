/**
 * Requests API - Vercel Serverless Function
 * Handles feature requests using Neon DB and imgbb for images
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
        console.error("Requests API error:", error);
        return res.status(500).json({ error: error.message });
    }
}

// Get requests (all for admin, or by android_id for user)
async function handleGet(req, res) {
    const { android_id, admin } = req.query;

    if (admin === process.env.ADMIN_KEY) {
        // Admin: get all requests
        const requests = await sql`
      SELECT * FROM requests ORDER BY created_at DESC
    `;
        return res.status(200).json(requests);
    }

    if (!android_id) {
        return res.status(400).json({ error: "Missing android_id" });
    }

    // User: get their requests
    const requests = await sql`
    SELECT id, message, image_url, status, created_at 
    FROM requests 
    WHERE android_id = ${android_id}
    ORDER BY created_at DESC
  `;
    return res.status(200).json(requests);
}

// Create new request
async function handlePost(req, res) {
    const { android_id, message, image_url } = req.body;

    if (!android_id || !message) {
        return res.status(400).json({ error: "Missing android_id or message" });
    }

    if (message.length > 444) {
        return res.status(400).json({ error: "Message exceeds 444 character limit" });
    }

    // Check if user has a pending request
    const pending = await sql`
    SELECT id FROM requests 
    WHERE android_id = ${android_id} AND status = 'pending'
    LIMIT 1
  `;

    if (pending.length > 0) {
        return res.status(400).json({
            error: "You already have a pending request. Wait for it to be accepted or denied."
        });
    }

    const result = await sql`
    INSERT INTO requests (android_id, message, image_url, status, created_at)
    VALUES (${android_id}, ${message}, ${image_url || null}, 'pending', NOW())
    RETURNING id
  `;

    return res.status(201).json({
        success: true,
        id: result[0].id,
        message: "Request submitted successfully"
    });
}

// Update request status (admin only)
async function handleUpdate(req, res) {
    const { id, status, admin_key } = req.body;

    if (admin_key !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    if (!id || !status) {
        return res.status(400).json({ error: "Missing id or status" });
    }

    if (!['pending', 'accepted', 'denied'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    await sql`
    UPDATE requests SET status = ${status} WHERE id = ${id}
  `;

    return res.status(200).json({ success: true });
}
