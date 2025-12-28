# Spider-Man Chisti Update Server

## Setup
```bash
cd server
python3 update_server.py
```

## API Endpoint
```
GET /check?version={current_version}
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

## Example version.txt
```
1.0.1
```

## Example changelog_1.0.1.txt
```
- New swinging mechanics
- Better animations
- Bug fixes
```
