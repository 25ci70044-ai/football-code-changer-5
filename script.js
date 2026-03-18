// ============================================================
//  Football Gang ERP — Pure Client-Side (No Server Required)
// ============================================================

// ── Hardcoded credentials ────────────────────────────────────
const USERS = {
    'sarthak': { password: 'admin123', role: 'Manager' },
    'bhaswin': { password: 'bhaswin123', role: 'Manager' },
    'admin':   { password: '321',      role: 'Coach' },
};

// ── Pre-installed Football Game files ────────────────────────
const PREINSTALLED_FILES = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Football Legends ⚽️</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .header { text-align: center; padding: 20px; color: white; background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%); }
        .selection-bar { position: absolute; bottom: 20%; left: 50%; transform: translateX(-50%); display: flex; gap: 20px; pointer-events: auto; }
        .card { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 20px 30px; color: white; cursor: pointer; backdrop-filter: blur(5px); transition: all 0.3s ease; font-weight: bold; border-radius: 8px; text-transform: uppercase; }
        .card:hover { background: #238636; transform: translateY(-10px); box-shadow: 0 10px 20px rgba(0,255,0,0.2); }
        .kickoff-btn { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); padding: 15px 40px; font-size: 1.2rem; font-weight: 800; background: linear-gradient(135deg, #2ea043, #238636); color: white; border: none; border-radius: 50px; cursor: pointer; pointer-events: auto; transition: transform 0.2s; }
        .kickoff-btn:hover { transform: translateX(-50%) scale(1.05); background: #2ea043; }
    </style>
</head>
<body>
    <div id="ui-layer">
        <div class="header">
            <h1 id="player-name">SELECT YOUR LEGEND</h1>
            <p id="player-stats">Click a card to view 3D Preview</p>
        </div>
        <div class="selection-bar">
            <div class="card" onclick="selectPlayer('Ronaldo')">CR7</div>
            <div class="card" onclick="selectPlayer('Messi')">MESSI</div>
            <div class="card" onclick="selectPlayer('Neymar')">NEYMAR</div>
            <div class="card" onclick="selectPlayer('Ronaldinho')">RONALDINHO</div>
        </div>
        <button class="kickoff-btn" onclick="playGame()">START MATCH</button>
    </div>
    <canvas id="game-canvas"></canvas>
    <script src="main.js"></script>
</body>
</html>`,

    'style.css': `body { margin: 0; overflow: hidden; background: #000; font-family: 'Segoe UI', sans-serif; }
#ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.menu-content { pointer-events: auto; padding: 50px; color: white; }
.selection-panel { position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%); display: flex; gap: 15px; }
.player-card { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); padding: 20px; width: 120px; text-align: center; cursor: pointer; backdrop-filter: blur(10px); transition: 0.3s; }
.player-card:hover { background: #00ff00; color: black; transform: translateY(-10px); }
#player-name-display { position: absolute; top: 20%; width: 100%; text-align: center; font-size: 3rem; font-weight: bold; text-transform: uppercase; letter-spacing: 5px; }
#play-now-btn { position: absolute; bottom: 2%; right: 5%; padding: 15px 40px; background: #00ff00; border: none; font-weight: bold; cursor: pointer; }`,

    'main.js': `// Football Game Main Script
function selectPlayer(name) {
    const el = document.getElementById('player-name');
    if (el) { el.textContent = name.toUpperCase(); }
}
function playGame() {
    const name = document.getElementById('player-name').textContent;
    alert('Game starting with: ' + name + ' ⚽️');
}
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#238636';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
        ctx.font = '24px Outfit, sans-serif';
        ctx.fillStyle = '#238636';
        ctx.textAlign = 'center';
        ctx.fillText('3D ENGINE LOADING...', canvas.width/2, canvas.height/2);
    }
});`,

    'start_game.bat': `@echo off
title Football Legends - 3D Game Server
echo ===================================================
echo       FOOTBALL LEGENDS: STARTING SYSTEM...
echo ===================================================
echo [1/2] Launching Chrome/Default Browser...
start http://localhost:8000
echo [2/2] Starting Python Server...
echo NOTE: Keep this window open while playing!
python -m http.server 8000
pause`,
};

// ── In-memory file store ─────────────────────────────────────
let fileStore = {};
let filesList = [];
let activeFile = null;
let editor;

// ─────────────────────────────────────────────────────────────
// Pre-installed file loader
// ─────────────────────────────────────────────────────────────
function _loadPreinstalledFiles() {
    for (const [name, content] of Object.entries(PREINSTALLED_FILES)) {
        if (!(name in fileStore)) {
            fileStore[name] = content;
            if (!filesList.includes(name)) filesList.push(name);
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Toast helper
// ─────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ─────────────────────────────────────────────────────────────
// Monaco Editor init
// ─────────────────────────────────────────────────────────────
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: '',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        roundedSelection: false,
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
        saveActiveFile();
    });

    _restoreSession();
    renderFileList();
});

// ─────────────────────────────────────────────────────────────
// Session persistence (localStorage)
// ─────────────────────────────────────────────────────────────
function _saveSession() {
    try {
        localStorage.setItem('fg_fileStore', JSON.stringify(fileStore));
        localStorage.setItem('fg_filesList', JSON.stringify(filesList));
    } catch (e) { /* quota exceeded */ }
}

function _restoreSession() {
    try {
        const fs = localStorage.getItem('fg_fileStore');
        const fl = localStorage.getItem('fg_filesList');
        if (fs) fileStore = JSON.parse(fs);
        if (fl) filesList = JSON.parse(fl);
    } catch (e) { fileStore = {}; filesList = []; }
    // Always ensure pre-installed files are present
    _loadPreinstalledFiles();
}

// ─────────────────────────────────────────────────────────────
// File helpers
// ─────────────────────────────────────────────────────────────
function getFileLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = { js: 'javascript', html: 'html', css: 'css', json: 'json', md: 'markdown', py: 'python', txt: 'plaintext', bat: 'bat' };
    return map[ext] || 'plaintext';
}

function renderFileList() {
    const ul = document.getElementById('file-list');
    ul.innerHTML = '';

    if (filesList.length === 0) {
        ul.innerHTML = `
            <li class="file-item" style="color:var(--text-muted); flex-direction:column; align-items:flex-start; gap:8px; padding:15px;">
                <span>No files loaded yet.</span>
                <button class="primary" onclick="importFiles()" style="font-size:0.8rem; padding:6px 12px;">📂 Import Files</button>
            </li>`;
        return;
    }

    filesList.forEach(file => {
        const li = document.createElement('li');
        li.className = 'file-item' + (activeFile === file ? ' active' : '');
        li.innerHTML = `
            <svg class="icon" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H3.75z"></path></svg>
            ${file}
        `;
        li.onclick = () => openFile(file);
        ul.appendChild(li);
    });

    // Import / Download buttons at the bottom
    const actions = document.createElement('li');
    actions.className = 'file-item';
    actions.style.cssText = 'flex-direction:column; align-items:stretch; gap:6px; padding:12px; margin-top:8px; border-top:1px solid var(--border);';
    actions.innerHTML = `
        <button class="primary" onclick="importFiles()" style="font-size:0.8rem; padding:6px 10px;">📂 Add / Replace Files</button>
        <button onclick="downloadAllFiles()" style="font-size:0.8rem; padding:6px 10px; background:transparent; border:1px solid var(--border); color:var(--text-main); border-radius:6px; cursor:pointer;">💾 Download All</button>
    `;
    ul.appendChild(actions);
}

// ─────────────────────────────────────────────────────────────
// Import files from local disk
// ─────────────────────────────────────────────────────────────
function importFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.js,.html,.css,.json,.md,.txt,.py,.ts,.jsx,.tsx,.xml,.yaml,.yml,.bat';
    input.onchange = async () => {
        for (const file of input.files) {
            const text = await file.text();
            fileStore[file.name] = text;
            if (!filesList.includes(file.name)) filesList.push(file.name);
        }
        _saveSession();
        renderFileList();
        showToast(`Imported ${input.files.length} file(s) ✅`);
    };
    input.click();
}

// ─────────────────────────────────────────────────────────────
// Open a file into the editor
// ─────────────────────────────────────────────────────────────
function openFile(filename) {
    if (!(filename in fileStore)) {
        showToast('File content not found.', 'error');
        return;
    }
    activeFile = filename;
    renderFileList();

    document.getElementById('editor-placeholder').style.display = 'none';
    document.getElementById('editor-tabs').style.display = 'flex';
    document.getElementById('active-tab-title').querySelector('span').textContent = filename;
    document.getElementById('btn-save').disabled = false;

    monaco.editor.setModelLanguage(editor.getModel(), getFileLanguage(filename));
    editor.setValue(fileStore[filename]);
}

// ─────────────────────────────────────────────────────────────
// Save active file → memory + localStorage + download
// ─────────────────────────────────────────────────────────────
function saveActiveFile() {
    if (!activeFile) return;

    const content = editor.getValue();
    fileStore[activeFile] = content;
    _saveSession();

    // Sync to server if available
    fetch(`/api/file?path=${encodeURIComponent(activeFile)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
    }).catch(err => console.log("Server sync offline skip..."));

    _downloadFile(activeFile, content);
    showToast(`Saved & downloaded: ${activeFile} ✨`);

    const btn = document.getElementById('btn-save');
    btn.textContent = 'Saved ✓';
    setTimeout(() => { btn.textContent = 'Save Tactics'; }, 1500);
}

function _downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ─────────────────────────────────────────────────────────────
// Download ALL files
// ─────────────────────────────────────────────────────────────
function downloadAllFiles() {
    if (filesList.length === 0) { showToast('No files to download.', 'error'); return; }
    
    // Redirect to server-side ZIP download which is more professional
    showToast(`Preparing ZIP package... 📦`);
    setTimeout(() => {
        window.location.href = '/api/download-zip';
    }, 800);
}

// ─────────────────────────────────────────────────────────────
// Login — client-side only
// ─────────────────────────────────────────────────────────────
function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const btn = document.querySelector('#login-screen button');

    if (!user || !pass) {
        showToast('Please enter both username and password', 'error');
        return;
    }

    btn.textContent = 'Entering...';
    btn.disabled = true;

    setTimeout(() => {
        const record = USERS[user.toLowerCase()];
        if (record && record.password === pass) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-header').style.display = 'flex';
            document.getElementById('user-display').textContent = `${user} (${record.role})`;
            showToast(`Welcome back, ${user}! ⚽`);
        } else {
            showToast('Access Denied: Wrong credentials', 'error');
            btn.textContent = 'Enter Clubhouse';
            btn.disabled = false;
        }
    }, 400);
}

// ─────────────────────────────────────────────────────────────
// Run Program — previews the loaded HTML game file
// ─────────────────────────────────────────────────────────────
function runProgram() {
    showTab('run');
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────
function logout() {
    showToast('Logging out... 👋');
    setTimeout(() => { window.location.reload(); }, 600);
}

// ─────────────────────────────────────────────────────────────
// Tab switcher
// ─────────────────────────────────────────────────────────────
function showTab(tabName) {
    const editorEl = document.getElementById('monaco-editor');
    const placeholderEl = document.getElementById('editor-placeholder');
    const tabsEl = document.getElementById('editor-tabs');

    if (tabName === 'roster') {
        editorEl.style.display = 'none';
        tabsEl.style.display = 'none';
        placeholderEl.style.cssText = 'display:flex; align-items:center; justify-content:center; padding:15px;';
        placeholderEl.innerHTML = `
            <h3>Gang Members</h3>
            <table class="gang-table">
                <thead><tr><th>Member</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>Bhaswin</td><td>Striker</td><td><span class="status-badge status-active">Active</span></td></tr>
                    <tr><td>Admin</td><td>Coach</td><td><span class="status-badge status-active">Active</span></td></tr>
                </tbody>
            </table>
        `;
    } else if (tabName === 'run') {
        editorEl.style.display = 'none';
        tabsEl.style.display = 'none';
        placeholderEl.style.cssText = 'display:flex; align-items:stretch; justify-content:flex-start; padding:0;';

        // Prefer active HTML file, else first HTML file in list
        let previewContent = '';
        const htmlFile = filesList.find(f => f.endsWith('.html'));
        if (activeFile && activeFile.endsWith('.html') && fileStore[activeFile]) {
            previewContent = fileStore[activeFile];
        } else if (htmlFile && fileStore[htmlFile]) {
            previewContent = fileStore[htmlFile];
        }

        let iframeSrc = 'about:blank';
        if (previewContent) {
            const blob = new Blob([previewContent], { type: 'text/html' });
            iframeSrc = URL.createObjectURL(blob);
        }

        placeholderEl.innerHTML = `
            <div style="width:100%; height:100%; display:flex; flex-direction:column;">
                <div style="padding:10px 20px; background:#161b22; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; z-index:100;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:800; color:#58a6ff;">LIVE GAME PREVIEW</span>
                        <div style="width:8px; height:8px; background:#3fb950; border-radius:50%; box-shadow:0 0 8px #3fb950;"></div>
                    </div>
                    <button class="primary" onclick="runProgram()" style="padding:5px 12px; font-size:0.8rem; background:#238636;">Reload 🔄</button>
                </div>
                ${previewContent
                ? `<iframe src="${iframeSrc}" style="flex-grow:1; border:none; background:#f0f0f0;"></iframe>`
                : `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:16px; color:var(--text-muted);">
                           <p style="font-size:1.1rem;">No HTML game file loaded yet.</p>
                           <button class="primary" onclick="importFiles()">📂 Import your game HTML</button>
                       </div>`
            }
            </div>
        `;
    } else {
        editorEl.style.display = 'block';
        placeholderEl.style.cssText = 'display:flex; align-items:center; justify-content:center; padding:15px;';
        if (activeFile) {
            tabsEl.style.display = 'flex';
            placeholderEl.style.display = 'none';
        } else {
            tabsEl.style.display = 'none';
            placeholderEl.innerHTML = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <p>Select a file from the sidebar to start editing</p>
            `;
        }
    }
}

// ─────────────────────────────────────────────────────────────
// MAVERICK AI — Anthropic-powered code assistant
// ─────────────────────────────────────────────────────────────

// Pre-installed Maverick AI API configuration (Server-proxied)
const MAVERICK_CONFIG = {
    model: 'claude-3-5-sonnet-20241022',
    endpoint: '/api/ai',
};

let maverickPanelOpen = false;
let pendingAICode = null;
let maverickChatHistory = [];

// ── Toggle panel open/close ──────────────────────────────────
function toggleMaverickAI() {
    const panel   = document.getElementById('maverick-panel');
    const overlay = document.getElementById('maverick-overlay');
    const btn     = document.getElementById('btn-maverick');
    maverickPanelOpen = !maverickPanelOpen;
    if (maverickPanelOpen) {
        panel.classList.add('open');
        overlay.classList.add('visible');
        btn.classList.add('active');
        _updateMaverickFileLabel();
    } else {
        panel.classList.remove('open');
        overlay.classList.remove('visible');
        btn.classList.remove('active');
    }
}

function _updateMaverickFileLabel() {
    const el = document.getElementById('maverick-file-label');
    if (activeFile) {
        el.textContent = `📄 Editing: ${activeFile}`;
        el.style.color = '#a78bfa';
    } else {
        el.textContent = '📄 No file open — open a file to enable AI editing';
        el.style.color = '#4a3870';
    }
}

// ── Send user message to Maverick AI ─────────────────────────
async function sendToMaverick() {
    const inputEl  = document.getElementById('maverick-input');
    const statusEl = document.getElementById('maverick-status');
    const sendBtn  = document.getElementById('maverick-send-btn');
    const userMsg  = inputEl.value.trim();

    if (!userMsg) return;

    if (!activeFile) {
        _appendMaverickMsg('ai', '⚠️ Please open a file in the editor first so I know what code to modify!');
        return;
    }

    const currentCode = editor ? editor.getValue() : (fileStore[activeFile] || '');
    _appendMaverickMsg('user', userMsg);
    inputEl.value = '';
    statusEl.textContent = '';
    sendBtn.disabled = true;
    sendBtn.textContent = '⏳ Thinking…';

    const typingId = _showTypingIndicator();

    const systemPrompt = `You are Maverick AI, a skilled coding assistant inside the Football Gang ERP code editor.

The user is editing a file called "${activeFile}". When given an instruction, respond with the COMPLETE updated file content wrapped in a single markdown code block.

Rules:
- Always return the FULL file content inside a single \`\`\` code block.
- After the code block you may add a brief explanation (1-3 sentences).
- Do not include multiple code blocks.
- Preserve all existing working functionality unless explicitly asked to remove it.`;

    const messages = [
        ...maverickChatHistory,
        { role: 'user', content: `Current file:\n\`\`\`\n${currentCode}\n\`\`\`\n\nInstruction: ${userMsg}` }
    ];

    try {
        const response = await fetch(MAVERICK_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MAVERICK_CONFIG.model,
                system: systemPrompt,
                messages,
                temperature: 0.3,
                max_tokens: 4096,
            }),
        });

        _removeTypingIndicator(typingId);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || errData.message || `HTTP ${response.status}`);
        }

        const data  = await response.json();
        // Anthropic response is content: [{text: "...", type: "text"}]
        const reply = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || '';

        const codeMatch     = reply.match(/```[\w]*\n?([\s\S]*?)```/);
        const extractedCode = codeMatch ? codeMatch[1].trim() : null;
        const explanation   = reply.replace(/```[\s\S]*?```/g, '').trim() || 'Done! Here\'s the updated code.';

        maverickChatHistory.push({ role: 'user', content: `Instruction: ${userMsg}` });
        maverickChatHistory.push({ role: 'assistant', content: reply });
        if (maverickChatHistory.length > 20) maverickChatHistory = maverickChatHistory.slice(-16);

        if (extractedCode) {
            pendingAICode = { filename: activeFile, code: extractedCode };
            _appendMaverickMsg('ai', explanation, true);
        } else {
            _appendMaverickMsg('ai', reply || 'I encountered an issue. Please try again.');
        }
    } catch (err) {
        _removeTypingIndicator(typingId);
        console.error('Maverick AI error:', err);
        let msg = `❌ Error: ${err.message}`;
        if (err.message.includes('401') || err.message.includes('Unauthorized')) msg = '❌ API key issue. Please check the configuration.';
        else if (err.message.includes('429')) msg = '⏳ Rate limited. Please wait a moment and try again.';
        _appendMaverickMsg('ai', msg);
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '✨ Ask AI';
    }
}

// ── Chat bubble helpers ───────────────────────────────────────
function _appendMaverickMsg(role, text, showApplyBtn = false) {
    const container = document.getElementById('maverick-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `maverick-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'maverick-avatar';
    avatar.textContent = role === 'ai' ? 'M' : '⚽';

    const bubble = document.createElement('div');
    bubble.className = 'maverick-bubble';

    const html = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    bubble.innerHTML = html;

    if (showApplyBtn && pendingAICode) {
        const btn = document.createElement('button');
        btn.className = 'maverick-apply-btn';
        btn.textContent = '✅ Preview & Apply Changes';
        btn.onclick = openApplyModal;
        bubble.appendChild(document.createElement('br'));
        bubble.appendChild(btn);
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function _showTypingIndicator() {
    const container = document.getElementById('maverick-messages');
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'maverick-msg ai maverick-typing';
    msgDiv.id = id;
    const avatar = document.createElement('div');
    avatar.className = 'maverick-avatar';
    avatar.textContent = 'M';
    const bubble = document.createElement('div');
    bubble.className = 'maverick-bubble';
    bubble.innerHTML = '<div class="maverick-dot"></div><div class="maverick-dot"></div><div class="maverick-dot"></div>';
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    return id;
}

function _removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ── Apply modal ───────────────────────────────────────────────
function openApplyModal() {
    if (!pendingAICode) return;
    document.getElementById('apply-modal-desc').textContent =
        `File: ${pendingAICode.filename} — ${pendingAICode.code.split('\n').length} lines`;
    document.getElementById('apply-modal-preview').textContent = pendingAICode.code;
    document.getElementById('apply-modal').style.display = 'flex';
}

function closeApplyModal() {
    document.getElementById('apply-modal').style.display = 'none';
}

function applyMaverickChanges() {
    if (!pendingAICode) return;
    const { filename, code } = pendingAICode;
    fileStore[filename] = code;
    _saveSession();

    // Sync AI changes back to the server
    fetch(`/api/file?path=${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code })
    }).catch(err => console.log("Server sync offline skip..."));

    if (editor && activeFile === filename) {
        editor.setValue(code);
    } else {
        openFile(filename);
    }
    showToast('🤖 Maverick AI changes applied! ✨');
    closeApplyModal();
    pendingAICode = null;
}

// ── Keyboard shortcut: Enter to send (Shift+Enter = newline) ──
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('maverick-input');
    if (textarea) {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendToMaverick();
            }
        });
    }
});

// ── Sync file label when a file is opened ───────────────────
const _origOpenFile = openFile;
window.openFile = function(filename) {
    _origOpenFile(filename);
    if (maverickPanelOpen) _updateMaverickFileLabel();
};
