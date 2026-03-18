import os
import zipfile
import io
import json
import urllib.parse
import base64
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Define your gang members
USERS = {
    "sarthak": "admin123",
    "bhaswin": "bhaswin123",
    "admin": "321"
}

PORT = int(os.environ.get("PORT", 8080))
# Use relative path for portability
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FOOTBALL_DIR = os.path.join(BASE_DIR, "game")




class CodeChangerHandler(SimpleHTTPRequestHandler):
    def end_with_json(self, status, data):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        # Allow CORS if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # If accessing the root, serve the game
        if path == "/" or path == "/index.html":
            full_path = os.path.join(FOOTBALL_DIR, 'index.html')
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open(full_path, 'rb') as f:
                self.wfile.write(f.read())
            return

        # Explicitly serve game files without /game/ prefix (optional, for convenience)
        if path.startswith('/game/'):
            rel_path = path[6:] # remove '/game/'
            if not rel_path or rel_path == '/':
                rel_path = 'index.html'
            
            full_path = os.path.join(FOOTBALL_DIR, rel_path.replace('/', os.sep))
        elif path in ['/main.js', '/game.js']:
             full_path = os.path.join(FOOTBALL_DIR, 'main.js')
        elif path == '/style.css' and 'referer' in self.headers and '/game/' in self.headers['referer']:
             # This is a bit hacky to distinguish between editor and game style.css
             # Better to rename the game's style.css or the editor's
             full_path = os.path.join(FOOTBALL_DIR, 'style.css')
        else:
             full_path = None

        if full_path and os.path.exists(full_path) and os.path.isfile(full_path):
                ext = os.path.splitext(full_path)[1].lower()
                content_types = {
                    '.html': 'text/html', '.js': 'application/javascript', 
                    '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', 
                    '.jpeg': 'image/jpeg', '.gif': 'image/gif'
                }
                content_type = content_types.get(ext, 'text/plain')
                
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(full_path, 'rb') as f:
                    self.wfile.write(f.read())
                return

        # Handle the editor
        if path == "/editor":
            full_path = os.path.join(BASE_DIR, 'index.html')
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open(full_path, 'rb') as f:
                self.wfile.write(f.read())
            return

        if path == '/api/files':
            files_list = []
            binary_exts = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.zip', '.exe'}
            for root, dirs, files in os.walk(FOOTBALL_DIR):
                for f in files:
                    ext = os.path.splitext(f)[1].lower()
                    if ext in binary_exts:
                        continue
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, FOOTBALL_DIR)
                    files_list.append(rel_path.replace('\\', '/'))
            self.end_with_json(200, files_list)
            
        elif path == '/api/file':
            query = urllib.parse.parse_qs(parsed_path.query)
            if 'path' in query:
                rel_path = query['path'][0]
                full_path = os.path.join(FOOTBALL_DIR, rel_path.replace('/', os.sep))
                try:
                    try:
                        with open(full_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except UnicodeDecodeError:
                        with open(full_path, 'r', encoding='latin-1') as f:
                            content = f.read()
                    self.end_with_json(200, {'content': content})
                except Exception as e:
                    self.end_with_json(500, {'error': str(e)})
            else:
                self.end_with_json(400, {'error': 'Missing path query parameter'})
                
        elif path == '/api/download-zip':
            try:
                memory_file = io.BytesIO()
                with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
                    for root, dirs, files in os.walk(FOOTBALL_DIR):
                        for file in files:
                            file_path = os.path.join(root, file)
                            rel_path = os.path.relpath(file_path, FOOTBALL_DIR)
                            zf.write(file_path, rel_path)
                    
                    readme_content = """# Football Game

Your code changes have been successfully downloaded!

To modify the game's code again in the future, please open the Code Changer Website by running the python server in the terminal:
python server.py
"""
                    zf.writestr('README.md', readme_content)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/zip')
                self.send_header('Content-Disposition', 'attachment; filename="Football_Game_Changed.zip"')
                self.end_headers()
                self.wfile.write(memory_file.getvalue())
            except Exception as e:
                self.end_with_json(500, {'error': str(e)})
        else:
            return super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/login':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            username = data.get('username')
            password = data.get('password')
            
            if username in USERS and USERS[username] == password:
                role = "Manager"
                display_name = "SARTHAK" if username == "admin" else username
                self.end_with_json(200, {'status': 'success', 'user': display_name, 'role': role})
            else:
                self.end_with_json(401, {'error': 'Invalid credentials'})
                
        elif path == '/api/file':
            query = urllib.parse.parse_qs(parsed_path.query)
            if 'path' in query:
                rel_path = query['path'][0]
                full_path = os.path.join(FOOTBALL_DIR, rel_path.replace('/', os.sep))
                
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                try:
                    body = json.loads(post_data.decode('utf-8'))
                    content = body.get('content', '')
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.end_with_json(200, {'status': 'success'})
                except Exception as e:
                    self.end_with_json(500, {'error': str(e)})
            else:
                self.end_with_json(400, {'error': 'Missing path query parameter'})
                
        elif path == '/api/ai':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            import urllib.request
            try:
                # Use the user's Gemini Key
                api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAB1yiaZJGYsthdwqVezeWAP6pARvVLK04")
                
                # Parse Maverick's original request (Anthropic format)
                data = json.loads(post_data.decode('utf-8'))
                system_msg = data.get('system', '')
                messages = data.get('messages', [])
                user_msg = messages[-1]['content'] if messages else ""
                
                # Convert to Gemini prompt
                prompt = f"{system_msg}\n\nUser Instruction: {user_msg}"
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                payload = json.dumps({
                    "contents": [{"parts": [{"text": prompt}]}]
                }).encode('utf-8')
                
                req = urllib.request.Request(
                    url,
                    data=payload,
                    headers={'Content-Type': 'application/json'},
                    method='POST'
                )
                
                with urllib.request.urlopen(req) as response:
                    res_json = json.loads(response.read().decode('utf-8'))
                    ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                    
                    # Return in the format Maverick AI expects
                    self.end_with_json(200, {
                        "content": [{"type": "text", "text": ai_text}]
                    })
            except Exception as e:
                error_msg = str(e)
                if hasattr(e, 'read'):
                    try: error_msg = e.read().decode('utf-8')
                    except: pass
                self.end_with_json(500, {'error': error_msg})
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    print(f"==================================================")
    print(f"FOOTBALL GAME WEB EDITOR STARTED")
    print(f"Open this link in your browser: http://localhost:{PORT}")
    print(f"==================================================")
    print("Press Ctrl+C to stop the server.")

    try:
        with HTTPServer(('', PORT), CodeChangerHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped.")
