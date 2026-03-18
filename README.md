# ⚽ Football Code Changer (ERP)

An AI-powered web platform for editing your football game tactics and files on the fly. 

### 🤖 Features
- **Maverick AI Assistant**: Powered by **Anthropic (Claude 3.5 Sonnet)** to help you write and refine code.
- **In-Browser Editor**: Full Monaco Editor experience with syntax highlighting.
- **Self-Contained**: The game files are located right in the `/game` folder.
- **Secure AI Proxy**: Your AI keys are handled by the server (never exposed to the browser).

### 🚀 Local Quick Start
1. Ensure you have Python installed.
2. Open your terminal in this directory.
3. Run the server:
   ```bash
   python server.py
   ```
4. Open [http://localhost:8080](http://localhost:8080) in your browser.

### 🌎 Cloud Deployment (GitHub + Render/Railway)
1. Push this entire repository to your GitHub.
2. Connect it to a hosting service like **Render** or **Railway**.
3. Set your **Start Command** to `python server.py`.
4. Define your `ANTHROPIC_API_KEY` in the service's environment variables.

### 🛡️ Security
User login is managed via the `USERS` dictionary in `server.py`. 
Default admin: `admin` / `321`.
Default member: `sarthak` / `admin123`.

*Built for the Football Gang.* ⚽💥
