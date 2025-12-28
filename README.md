# Spider-Man Chisti Update Server (Vercel)

## Deploy to Vercel

```bash
cd server
npm install -g vercel  # if not installed
vercel login
vercel --prod
```

## API Endpoint

After deployment, your URL will be:
```
https://your-project.vercel.app/api/check?version=1.0.0
```

Or use the short route:
```
https://your-project.vercel.app/check?version=1.0.0
```

## Responses

### Up to date:
```
63887
```

### Update available:
```json
{
  "status": "update_available",
  "version": "1.0.1",
  "download_url": "https://raw.githubusercontent.com/uzairdeveloper223/spiderman-chisti-update/main/spiderman_chisti_1.0.1.apk",
  "changelog": "- Fixed bugs\n- Added features"
}
```

## GitHub Repository Structure

Create repo: `uzairdeveloper223/spiderman-chisti-update`

Files needed:
- `version.txt` - Just the version number (e.g., `1.0.1`)
- `changelog_1.0.1.txt` - Changelog for that version
- `spiderman_chisti_1.0.1.apk` - The APK file

## Update Game Code

After deploying, update the game's `update_manager.gd`:

```gdscript
const UPDATE_SERVER_URL = "https://your-project.vercel.app/api/check"
```

## Local Development

```bash
cd server
vercel dev
```

Then test: `http://localhost:3000/api/check?version=1.0.0`
