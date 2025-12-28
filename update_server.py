#!/usr/bin/env python3
"""
Spider-Man Chisti Update Server
Checks GitHub for version updates and returns update info
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request
import json
import ssl

# GitHub raw URLs
GITHUB_BASE = "https://raw.githubusercontent.com/uzairdeveloper223/spiderman-chisti-update/main"
VERSION_URL = f"{GITHUB_BASE}/version.txt"
CHANGELOG_URL_TEMPLATE = f"{GITHUB_BASE}/changelog_{{version}}.txt"
APK_URL_TEMPLATE = f"{GITHUB_BASE}/spiderman_chisti_{{version}}.apk"

# Magic number for "up to date"
UP_TO_DATE_CODE = "63887"

class UpdateHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path == "/check":
            self.handle_check(parsed)
        else:
            self.send_error(404, "Not Found")
    
    def handle_check(self, parsed):
        # Get version from query params
        params = parse_qs(parsed.query)
        client_version = params.get("version", [None])[0]
        
        if not client_version:
            self.send_error(400, "Missing version parameter")
            return
        
        try:
            # Fetch latest version from GitHub
            latest_version = self.fetch_github_version()
            
            if latest_version is None:
                self.send_error(500, "Could not fetch version from GitHub")
                return
            
            # Compare versions
            if client_version == latest_version:
                # Up to date - return magic code
                self.send_response(200)
                self.send_header("Content-Type", "text/plain")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(UP_TO_DATE_CODE.encode())
            else:
                # Update available - fetch changelog and return JSON
                changelog = self.fetch_changelog(latest_version)
                
                response = {
                    "status": "update_available",
                    "version": latest_version,
                    "download_url": APK_URL_TEMPLATE.format(version=latest_version),
                    "changelog": changelog
                }
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
        except Exception as e:
            self.send_error(500, str(e))
    
    def fetch_github_version(self):
        """Fetch version.txt from GitHub"""
        try:
            # Create SSL context that doesn't verify (for some systems)
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            with urllib.request.urlopen(VERSION_URL, context=ctx, timeout=10) as response:
                return response.read().decode().strip()
        except Exception as e:
            print(f"Error fetching version: {e}")
            return None
    
    def fetch_changelog(self, version):
        """Fetch changelog_{version}.txt from GitHub"""
        try:
            url = CHANGELOG_URL_TEMPLATE.format(version=version)
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            with urllib.request.urlopen(url, context=ctx, timeout=10) as response:
                return response.read().decode().strip()
        except Exception as e:
            print(f"Error fetching changelog: {e}")
            return "No changelog available"

def run_server(port=8080):
    server = HTTPServer(("0.0.0.0", port), UpdateHandler)
    print(f"Update server running on port {port}")
    print(f"Test: http://localhost:{port}/check?version=1.0.0")
    server.serve_forever()

if __name__ == "__main__":
    run_server()
