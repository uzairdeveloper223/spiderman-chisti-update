/**
 * Spider-Man Chisti Update Server - Vercel Serverless Function
 * Checks GitHub for version updates and returns update info
 */

const GITHUB_BASE = "https://raw.githubusercontent.com/uzairdeveloper223/spiderman-chisti-update/main";
const VERSION_URL = `${GITHUB_BASE}/version.txt`;
const UP_TO_DATE_CODE = "63887";

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { version } = req.query;

    if (!version) {
        return res.status(400).json({ error: "Missing version parameter" });
    }

    try {
        // Fetch latest version from GitHub
        const versionResponse = await fetch(VERSION_URL);

        if (!versionResponse.ok) {
            return res.status(500).json({ error: "Could not fetch version from GitHub" });
        }

        const latestVersion = (await versionResponse.text()).trim();

        // Compare versions
        if (version === latestVersion) {
            // Up to date - return magic code
            return res.status(200).send(UP_TO_DATE_CODE);
        }

        // Update available - fetch changelog
        const changelogUrl = `${GITHUB_BASE}/changelog_${latestVersion}.txt`;
        let changelog = "No changelog available";

        try {
            const changelogResponse = await fetch(changelogUrl);
            if (changelogResponse.ok) {
                changelog = await changelogResponse.text();
            }
        } catch (e) {
            console.error("Error fetching changelog:", e);
        }

        // Return update info
        return res.status(200).json({
            status: "update_available",
            version: latestVersion,
            download_url: `${GITHUB_BASE}/spiderman_chisti_${latestVersion}.apk`,
            changelog: changelog.trim()
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
