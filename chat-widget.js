/**
 * Chat Widget - Real-time support with Telegram bridge
 * Connects to WebSocket server in bot.js
 */
(function() {
    const WS_URL = (() => {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = location.hostname;
        // If local, use port 8080; if accessed via Pinggy/tunnel, use default port (no explicit port)
        const port = (host === 'localhost' || host === '127.0.0.1') ? ':8080' : '';
        return `${proto}//${host}${port}`;
    })();

    let ws = null;
    let sessionId = null;
    let isOpen = false;
    let unreadCount = 0;
    let typingTimer = null;
    let currentTypingText = '';
    let operatorTypingTimer = null;
    let chatContext = 'general'; // 'general' or 'install'
    let isConnected = false;

    function createWidget() {
        if (window.isAccessDenied) return;
        
        const operatorName = ((typeof clientSettings !== 'undefined' ? clientSettings : {}) && (typeof clientSettings !== 'undefined' ? clientSettings : {}).supportName) ? (typeof clientSettings !== 'undefined' ? clientSettings : {}).supportName : 'Техническая поддержка';
        const operatorPhoto = ((typeof clientSettings !== 'undefined' ? clientSettings : {}) && (typeof clientSettings !== 'undefined' ? clientSettings : {}).supportPhoto) ? (typeof clientSettings !== 'undefined' ? clientSettings : {}).supportPhoto : 'https://ui-avatars.com/api/?name=Support&background=0077ff&color=fff';

        const html = `
        <!-- Chat Bubble Button -->
        <button class="chat-fab" id="chatFabBtn" onclick="window.openChat('general')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
            </svg>
            <span class="chat-fab-badge" id="chatFabBadge">0</span>
        </button>

        <!-- Chat Window -->
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div class="chat-avatar">
                    <img src="${operatorPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                </div>
                <div class="chat-header-info">
                    <div class="chat-header-name">${operatorName}</div>
                    <div class="chat-header-status" id="chatStatus">Обычно отвечаем за несколько минут</div>
                </div>
                <button class="chat-close-btn" onclick="window.closeChat()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            


            <div class="chat-messages" id="chatMessages">
                <div class="chat-system-msg">Напишите ваш вопрос — мы ответим в ближайшее время.</div>
            </div>
            <div class="chat-live-preview" id="chatLivePreview"></div>
            <div class="chat-typing" id="chatTypingIndicator">
                <div class="chat-bubble-avatar" style="background:#555;">А</div>
                <div class="chat-typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
            <div class="chat-input-area">
                <textarea class="chat-input" id="chatInput" placeholder="Написать сообщение..." rows="1"></textarea>
                <button class="chat-send-btn" id="chatSendBtn" onclick="window.sendChatMessage()">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
            <div class="chat-input-area" style="border-top: none; padding-top: 0; padding-bottom: 12px;">
                <input type="file" id="chatFileInput" accept="image/*" style="display:none;" onchange="window.sendChatPhoto(this)">
                <label for="chatFileInput" style="cursor:pointer; display:flex; align-items:center; color:#0077ff; font-size:14px; gap:5px;">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path></svg>
                    Прикрепить фото
                </label>
            </div>
        </div>
        `;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'chat-widget.css?v=2';
        document.head.appendChild(link);

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // Auto-resize textarea
        const input = document.getElementById('chatInput');
        input.addEventListener('input', onInputChange);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.sendChatMessage();
            }
        });
    }

    function connectWS() {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            // Start or rejoin session
            const savedSession = localStorage.getItem('chatSession_' + chatContext);
            if (savedSession) {
                sessionId = savedSession;
                ws.send(JSON.stringify({ type: 'rejoin', sessionId }));
            } else {
                const workerId = new URLSearchParams(window.location.search).get('worker') || 'null';
                ws.send(JSON.stringify({ type: 'start', context: chatContext, userInfo: getUserInfo(), workerId: workerId }));
            }
        };

        ws.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);
            handleServerMessage(msg);
        };

        ws.onclose = () => {
            // Reconnect after 3 seconds if chat is open
            if (isOpen) {
                setTimeout(connectWS, 3000);
                updateStatus('Переподключение...');
            }
        };

        ws.onerror = () => { ws = null; };
    }

    function handleServerMessage(msg) {
        switch (msg.type) {
            case 'session_created':
                sessionId = msg.sessionId;
                localStorage.setItem('chatSession_' + chatContext, sessionId);
                break;

            case 'history': {
                // Restore message history on reconnect
                const msgs = document.getElementById('chatMessages');
                if (msgs && msg.messages && msg.messages.length > 0) {
                    msgs.innerHTML = ''; // clear the "write your question" message
                    msg.messages.forEach(m => {
                        const t = m.time ? new Date(m.time).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'}) : '';
                        appendMessage(m.text, m.from === 'user' ? 'user' : 'operator', t);
                    });
                }
                break;
            }

            case 'operator_reply':
                hideTypingIndicator();
                appendMessage(msg.text, 'operator', msg.time);
                if (!isOpen) {
                    unreadCount++;
                    updateBadge();
                }
                break;

            case 'operator_typing':
                showTypingIndicator();
                break;

            case 'operator_stop_typing':
                hideTypingIndicator();
                break;

            case 'operator_connected':
                isConnected = true;
                const statusEl = document.getElementById('chatStatus');
                if (statusEl) {
                    statusEl.textContent = 'Арсений Лавров • Онлайн';
                    statusEl.className = 'chat-header-status connected';
                }
                
                break;

            case 'system_msg':
                appendSystemMessage(msg.text);
                break;

            case 'chat_deleted':
                // Admin reset this dialog
                localStorage.removeItem('chatSession_' + chatContext);
                sessionId = null;
                const msgsEl = document.getElementById('chatMessages');
                if (msgsEl) msgsEl.innerHTML = '<div class="chat-system-msg">Диалог был сброшен. Напишите новый вопрос.</div>';
                const st = document.getElementById('chatStatus');
                if (st) { st.textContent = 'Ожидание подключения...'; st.className = 'chat-header-status'; }
                // Start fresh session
                ws = null;
                connectWS();
                break;
        }
    }

    function getUserInfo() {
        if (window.Telegram && window.Telegram.WebApp) {
            const u = window.Telegram.WebApp.initDataUnsafe?.user;
            if (u) {
                const name = ((u.first_name || '') + ' ' + (u.last_name || '')).trim();
                return { name, username: u.username || null, id: u.id };
            }
        }
        return { name: 'Гость', username: null, id: null };
    }

    function onInputChange(e) {
        const input = e.target;
        // Auto resize
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';

        const text = input.value.trim();

        // Send live typing preview to server
        if (ws && ws.readyState === WebSocket.OPEN && sessionId && text) {
            clearTimeout(typingTimer);
            currentTypingText = text;
            ws.send(JSON.stringify({ type: 'typing_preview', sessionId, text }));

            // Stop typing signal after 3 seconds of inactivity
            typingTimer = setTimeout(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'stop_typing', sessionId, text: currentTypingText }));
                }
            }, 3000);
        }
    }

    function appendMessage(text, from, time) {
        const msgs = document.getElementById('chatMessages');
        if (!msgs) return;

        const timeStr = time || new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const isUser = from === 'user';

        const row = document.createElement('div');
        row.className = `chat-bubble-row ${isUser ? 'from-user' : ''}`;
        row.innerHTML = `
            ${!isUser ? `<img src="${(typeof clientSettings !== 'undefined' ? clientSettings : {})?.supportPhoto || ''}" class="chat-bubble-avatar" style="object-fit:cover; display:${(typeof clientSettings !== 'undefined' ? clientSettings : {})?.supportPhoto ? 'block' : 'none'};" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/><div class="chat-bubble-avatar fallback-avatar" style="background:#007bff; display:${(typeof clientSettings !== 'undefined' ? clientSettings : {})?.supportPhoto ? 'none' : 'flex'}">${(typeof clientSettings !== 'undefined' ? clientSettings : {})?.supportName ? (typeof clientSettings !== 'undefined' ? clientSettings : {}).supportName.charAt(0) : 'А'}</div>` : ''}
            <div class="chat-bubble ${isUser ? 'from-user' : 'from-operator'}">
                ${escapeHtml(text)}
                <div class="chat-bubble-time">${timeStr}</div>
            </div>
        `;
        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function appendSystemMessage(text) {
        const msgs = document.getElementById('chatMessages');
        if (!msgs) return;
        const el = document.createElement('div');
        el.className = 'chat-system-msg';
        el.textContent = text;
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTypingIndicator() {
        const el = document.getElementById('chatTypingIndicator');
        if (el) el.classList.add('show');
        clearTimeout(operatorTypingTimer);
        operatorTypingTimer = setTimeout(hideTypingIndicator, 5000);
        const msgs = document.getElementById('chatMessages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTypingIndicator() {
        const el = document.getElementById('chatTypingIndicator');
        if (el) el.classList.remove('show');
    }

    function updateStatus(text) {
        const el = document.getElementById('chatStatus');
        if (el) el.textContent = text;
    }

    function updateBadge() {
        const badge = document.getElementById('chatFabBadge');
        if (!badge) return;
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    // Public API
    window.openChat = function(context) {
        chatContext = context || 'general';
        isOpen = true;
        unreadCount = 0;
        updateBadge();

        const win = document.getElementById('chatWindow');
        if (win) win.classList.add('open');

        // Update context label
        

        connectWS();
        setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
    };

    window.closeChat = function() {
        isOpen = false;
        const win = document.getElementById('chatWindow');
        if (win) win.classList.remove('open');
    };

    window.sendChatMessage = function() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connectWS();
            setTimeout(() => window.sendChatMessage(), 1000);
            return;
        }

        // Clear typing timer
        clearTimeout(typingTimer);

        ws.send(JSON.stringify({ type: 'message', sessionId, text, context: chatContext }));
        appendMessage(text, 'user');
        input.value = '';
        input.style.height = 'auto';
    };

    window.sendChatPhoto = function(inputElement) {
        if (!inputElement.files || inputElement.files.length === 0) return;
        const file = inputElement.files[0];
        
        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите фото.');
            return;
        }
        
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            connectWS();
            setTimeout(() => window.sendChatPhoto(inputElement), 1000);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result;
            ws.send(JSON.stringify({ type: 'photo', sessionId, context: chatContext, photoBase64: base64Data }));
            appendMessage('📷 Фото отправлено', 'user');
            inputElement.value = ''; // clear
        };
        reader.readAsDataURL(file);
    };

    // Init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
