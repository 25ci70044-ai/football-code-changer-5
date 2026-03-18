import os
import json
import requests
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        # Get the Gemini Key from Vercel Environment Variables
        # Get your free key at: https://aistudio.google.com/app/apikey
        api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyAB1yiaZJGYsthdwqVezeWAP6pARvVLK04")
        
        if not api_key:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing GEMINI_API_KEY. Please add it to Vercel Environment Variables."}).encode())
            return

        # Prepare the prompt for Gemini
        system_msg = data.get('system', '')
        messages = data.get('messages', [])
        user_msg = messages[-1]['content'] if messages else ""
        
        # Combine system prompt with user instruction
        prompt = f"{system_msg}\n\nUser Instruction: {user_msg}"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
            res_json = response.json()
            
            # Extract content from Gemini response
            if 'candidates' in res_json and len(res_json['candidates']) > 0:
                ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
                
                # Send back in the format Maverick AI expects
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "content": [{"type": "text", "text": ai_text}]
                }).encode())
            else:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No content generated from Gemini", "details": res_json}).encode())
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
