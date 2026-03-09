require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.IO for real-time updates
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3001;
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8001';
const SESSION_PATH = process.env.SESSION_PATH || './sessions';

// Ensure session directory exists
if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

// Store active sessions
const sessions = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Cliente conectado ao Socket.IO:', socket.id);
  
  socket.on('join-company', (companyId) => {
    socket.join(`company-${companyId}`);
    console.log(`Socket ${socket.id} entrou na sala company-${companyId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Emit event to company room
function emitToCompany(companyId, event, data) {
  io.to(`company-${companyId}`).emit(event, data);
}

// Create WhatsApp client for a session
function createClient(sessionId) {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: sessionId,
      dataPath: SESSION_PATH
    }),
    puppeteer: {
      headless: true,
      executablePath: '/usr/lib/chromium/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions'
      ]
    },
    // Keep session alive
    restartOnAuthFail: true
  });

  return client;
}

// Initialize a new session
app.post('/session/start/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { companyId } = req.body;
  
  if (sessions[sessionId] && sessions[sessionId].status === 'ready') {
    return res.json({ 
      success: true, 
      message: 'Sessao ja esta conectada',
      status: sessions[sessionId].status,
      phoneNumber: sessions[sessionId].phoneNumber
    });
  }

  // If session exists but not ready, destroy it first
  if (sessions[sessionId]) {
    try {
      await sessions[sessionId].client.destroy();
    } catch (e) {
      console.log('Erro ao destruir sessao anterior:', e.message);
    }
    delete sessions[sessionId];
  }

  try {
    const client = createClient(sessionId);
    
    sessions[sessionId] = {
      client,
      status: 'initializing',
      qrCode: null,
      phoneNumber: null,
      companyId: companyId || 'default-company',
      lastActivity: Date.now()
    };

    // QR Code event
    client.on('qr', async (qr) => {
      console.log(`[${sessionId}] QR Code gerado`);
      sessions[sessionId].status = 'qr_ready';
      sessions[sessionId].qrCode = qr;
      sessions[sessionId].lastActivity = Date.now();
      
      // Emit via Socket.IO
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:qr', {
        sessionId,
        qrCode: await qrcode.toDataURL(qr)
      });

      // Notify FastAPI backend
      try {
        await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, {
          event: 'qr',
          sessionId,
          qrCode: qr,
          companyId: sessions[sessionId].companyId
        });
      } catch (e) {
        console.log('Erro ao notificar backend:', e.message);
      }
    });

    // Authenticated event
    client.on('authenticated', () => {
      console.log(`[${sessionId}] Autenticado com sucesso`);
      sessions[sessionId].status = 'authenticated';
      sessions[sessionId].qrCode = null;
      sessions[sessionId].lastActivity = Date.now();
      
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:authenticated', {
        sessionId
      });
    });

    // Auth failure event
    client.on('auth_failure', (msg) => {
      console.log(`[${sessionId}] Falha na autenticacao:`, msg);
      sessions[sessionId].status = 'auth_failed';
      
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:auth_failure', {
        sessionId,
        message: msg
      });
    });

    // Ready event
    client.on('ready', async () => {
      console.log(`[${sessionId}] Cliente pronto!`);
      sessions[sessionId].status = 'ready';
      sessions[sessionId].lastActivity = Date.now();
      
      // Get phone number
      const info = client.info;
      sessions[sessionId].phoneNumber = info.wid.user;
      
      // Emit via Socket.IO
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:ready', {
        sessionId,
        phoneNumber: info.wid.user
      });

      // Notify FastAPI backend
      try {
        await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, {
          event: 'ready',
          sessionId,
          phoneNumber: info.wid.user,
          companyId: sessions[sessionId].companyId
        });
      } catch (e) {
        console.log('Erro ao notificar backend:', e.message);
      }

      // Sync recent chats
      syncChats(sessionId);
    });

    // Message received event
    client.on('message', async (msg) => {
      // Ignore status broadcast messages
      if (msg.from === 'status@broadcast') return;
      
      console.log(`[${sessionId}] Mensagem recebida de ${msg.from}: ${msg.body.substring(0, 50)}`);
      sessions[sessionId].lastActivity = Date.now();

      // Get contact info
      let contactName = '';
      let contactNumber = msg.from.replace('@c.us', '').replace('@g.us', '');
      try {
        const contact = await msg.getContact();
        contactName = contact.pushname || contact.name || contactNumber;
      } catch (e) {
        contactName = contactNumber;
      }

      const messageData = {
        event: 'message',
        sessionId,
        messageId: msg.id._serialized,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp,
        isGroup: msg.from.includes('@g.us'),
        hasMedia: msg.hasMedia,
        type: msg.type,
        contactName,
        contactNumber,
        companyId: sessions[sessionId].companyId
      };

      // Emit via Socket.IO for real-time update
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:message', messageData);

      // Notify FastAPI backend
      try {
        await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, messageData);
      } catch (e) {
        console.log('Erro ao notificar backend:', e.message);
      }
    });

    // Message sent confirmation
    client.on('message_create', async (msg) => {
      if (msg.fromMe) {
        console.log(`[${sessionId}] Mensagem enviada para ${msg.to}`);
        
        emitToCompany(sessions[sessionId].companyId, 'whatsapp:message_sent', {
          sessionId,
          messageId: msg.id._serialized,
          to: msg.to,
          body: msg.body
        });
      }
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      console.log(`[${sessionId}] Desconectado: ${reason}`);
      sessions[sessionId].status = 'disconnected';
      
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:disconnected', {
        sessionId,
        reason
      });

      // Notify FastAPI backend
      try {
        await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, {
          event: 'disconnected',
          sessionId,
          reason,
          companyId: sessions[sessionId].companyId
        });
      } catch (e) {
        console.log('Erro ao notificar backend:', e.message);
      }

      // Try to reconnect after 5 seconds
      setTimeout(async () => {
        if (sessions[sessionId] && sessions[sessionId].status === 'disconnected') {
          console.log(`[${sessionId}] Tentando reconectar...`);
          try {
            await client.initialize();
          } catch (e) {
            console.log(`[${sessionId}] Erro ao reconectar:`, e.message);
          }
        }
      }, 5000);
    });

    // State change
    client.on('change_state', (state) => {
      console.log(`[${sessionId}] Estado mudou para: ${state}`);
      emitToCompany(sessions[sessionId].companyId, 'whatsapp:state_change', {
        sessionId,
        state
      });
    });

    // Initialize client
    await client.initialize();

    res.json({ 
      success: true, 
      message: 'Sessao iniciada, aguardando QR Code',
      sessionId 
    });

  } catch (error) {
    console.error(`Erro ao iniciar sessao ${sessionId}:`, error);
    delete sessions[sessionId];
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Sync chats from WhatsApp
async function syncChats(sessionId) {
  const session = sessions[sessionId];
  if (!session || session.status !== 'ready') return;

  try {
    console.log(`[${sessionId}] Sincronizando chats...`);
    const chats = await session.client.getChats();
    
    // Get last 20 non-group chats with messages
    const recentChats = chats
      .filter(chat => !chat.isGroup && chat.id._serialized !== 'status@broadcast')
      .slice(0, 20);

    for (const chat of recentChats) {
      try {
        const contact = await chat.getContact();
        const messages = await chat.fetchMessages({ limit: 10 });
        
        const chatData = {
          event: 'chat_sync',
          sessionId,
          chatId: chat.id._serialized,
          contactName: contact.pushname || contact.name || chat.name,
          contactNumber: chat.id.user,
          unreadCount: chat.unreadCount,
          lastMessage: chat.lastMessage ? {
            body: chat.lastMessage.body,
            timestamp: chat.lastMessage.timestamp,
            fromMe: chat.lastMessage.fromMe
          } : null,
          messages: messages.map(m => ({
            id: m.id._serialized,
            body: m.body,
            timestamp: m.timestamp,
            fromMe: m.fromMe,
            type: m.type
          })),
          companyId: session.companyId
        };

        // Send to backend for storage
        try {
          await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, chatData);
        } catch (e) {
          console.log('Erro ao sincronizar chat:', e.message);
        }

        // Emit via Socket.IO
        emitToCompany(session.companyId, 'whatsapp:chat_sync', chatData);

      } catch (e) {
        console.log(`Erro ao processar chat:`, e.message);
      }
    }

    console.log(`[${sessionId}] ${recentChats.length} chats sincronizados`);
  } catch (error) {
    console.error(`[${sessionId}] Erro ao sincronizar chats:`, error.message);
  }
}

// Get session status
app.get('/session/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  
  if (!session) {
    return res.json({ 
      success: false, 
      status: 'not_found' 
    });
  }

  res.json({
    success: true,
    sessionId,
    status: session.status,
    phoneNumber: session.phoneNumber,
    hasQrCode: !!session.qrCode,
    companyId: session.companyId,
    lastActivity: session.lastActivity
  });
});

// Get QR Code as image
app.get('/session/qr/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  
  if (!session || !session.qrCode) {
    return res.status(404).json({ 
      success: false, 
      message: 'QR Code nao disponivel' 
    });
  }

  try {
    const qrImage = await qrcode.toDataURL(session.qrCode);
    res.json({ 
      success: true, 
      qrCode: qrImage 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send message with retry logic for LID errors
app.post('/message/send', async (req, res) => {
  const { sessionId, to, message } = req.body;
  
  if (!sessionId || !to || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'sessionId, to e message sao obrigatorios' 
    });
  }

  const session = sessions[sessionId];
  
  if (!session || session.status !== 'ready') {
    return res.status(400).json({ 
      success: false, 
      message: 'Sessao nao esta pronta',
      status: session?.status 
    });
  }

  try {
    // Format phone number - remove all non-numeric chars and add @c.us
    let chatId = to;
    if (!chatId.includes('@')) {
      // Remove non-numeric characters (including +)
      chatId = chatId.replace(/[^0-9]/g, '');
      // Add country code if missing (Brazil)
      if (chatId.length <= 11 && !chatId.startsWith('55')) {
        chatId = '55' + chatId;
      }
      chatId = chatId + '@c.us';
    }

    console.log(`[${sessionId}] Enviando para: ${chatId}`);

    // Send directly without getNumberId (more reliable)
    const result = await session.client.sendMessage(chatId, message);
    
    console.log(`[${sessionId}] Mensagem enviada com sucesso para ${chatId}`);
    session.lastActivity = Date.now();
    
    res.json({ 
      success: true, 
      messageId: result.id._serialized,
      to: chatId
    });

  } catch (error) {
    console.error(`[${sessionId}] Erro ao enviar mensagem:`, error.message);
    
    // Better error message
    let errorMsg = error.message;
    if (errorMsg.includes('No LID') || errorMsg.includes('invalid wid')) {
      errorMsg = 'Numero nao encontrado no WhatsApp ou formato invalido';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMsg
    });
  }
});

// Get all chats
app.get('/chats/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { limit = 50 } = req.query;
  const session = sessions[sessionId];
  
  if (!session || session.status !== 'ready') {
    return res.status(400).json({ 
      success: false, 
      message: 'Sessao nao esta pronta' 
    });
  }

  try {
    const chats = await session.client.getChats();
    const chatList = await Promise.all(
      chats
        .filter(chat => chat.id._serialized !== 'status@broadcast')
        .slice(0, parseInt(limit))
        .map(async (chat) => {
          let contactName = chat.name;
          try {
            const contact = await chat.getContact();
            contactName = contact.pushname || contact.name || chat.name;
          } catch (e) {}
          
          return {
            id: chat.id._serialized,
            name: contactName,
            number: chat.id.user,
            isGroup: chat.isGroup,
            unreadCount: chat.unreadCount,
            timestamp: chat.timestamp,
            lastMessage: chat.lastMessage?.body
          };
        })
    );

    res.json({ 
      success: true, 
      chats: chatList 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get chat messages
app.get('/chats/:sessionId/:chatId/messages', async (req, res) => {
  const { sessionId, chatId } = req.params;
  const { limit = 50 } = req.query;
  const session = sessions[sessionId];
  
  if (!session || session.status !== 'ready') {
    return res.status(400).json({ 
      success: false, 
      message: 'Sessao nao esta pronta' 
    });
  }

  try {
    const chat = await session.client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: parseInt(limit) });
    
    const messageList = messages.map(msg => ({
      id: msg.id._serialized,
      body: msg.body,
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      type: msg.type,
      hasMedia: msg.hasMedia
    }));

    res.json({ 
      success: true, 
      messages: messageList 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Logout session
app.post('/session/logout/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  
  if (!session) {
    return res.status(404).json({ 
      success: false, 
      message: 'Sessao nao encontrada' 
    });
  }

  try {
    await session.client.logout();
    await session.client.destroy();
    delete sessions[sessionId];

    res.json({ 
      success: true, 
      message: 'Sessao encerrada' 
    });

  } catch (error) {
    // Force delete even if logout fails
    delete sessions[sessionId];
    res.json({ 
      success: true, 
      message: 'Sessao encerrada (forcado)' 
    });
  }
});

// List all sessions
app.get('/sessions', (req, res) => {
  const sessionList = Object.keys(sessions).map(id => ({
    sessionId: id,
    status: sessions[id].status,
    phoneNumber: sessions[id].phoneNumber,
    companyId: sessions[id].companyId,
    lastActivity: sessions[id].lastActivity
  }));

  res.json({ 
    success: true, 
    sessions: sessionList 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeSessions: Object.keys(sessions).length,
    sessions: Object.keys(sessions).map(id => ({
      id,
      status: sessions[id].status
    })),
    timestamp: new Date().toISOString()
  });
});

// Reconnect session endpoint
app.post('/session/reconnect/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];
  
  if (!session) {
    return res.status(404).json({ 
      success: false, 
      message: 'Sessao nao encontrada' 
    });
  }

  try {
    if (session.status === 'ready') {
      return res.json({ 
        success: true, 
        message: 'Sessao ja esta conectada' 
      });
    }

    await session.client.initialize();
    res.json({ 
      success: true, 
      message: 'Reconexao iniciada' 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Keep sessions alive
setInterval(() => {
  const now = Date.now();
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    // Ping sessions that are ready to keep them alive
    if (session.status === 'ready' && session.client) {
      session.client.getState().then(state => {
        console.log(`[${sessionId}] Estado atual: ${state}`);
        session.lastActivity = now;
      }).catch(e => {
        console.log(`[${sessionId}] Erro ao verificar estado:`, e.message);
      });
    }
  });
}, 30000); // Every 30 seconds

// Auto-restore sessions on startup
async function restoreSessions() {
  console.log('Verificando sessoes para restaurar...');
  
  try {
    const sessionDirs = fs.readdirSync(SESSION_PATH).filter(dir => dir.startsWith('session-'));
    
    for (const dir of sessionDirs) {
      const sessionId = dir.replace('session-', '');
      console.log(`Tentando restaurar sessao: ${sessionId}`);
      
      try {
        const client = createClient(sessionId);
        
        sessions[sessionId] = {
          client,
          status: 'restoring',
          qrCode: null,
          phoneNumber: null,
          companyId: 'default-company',
          lastActivity: Date.now()
        };

        // Setup event handlers
        client.on('qr', async (qr) => {
          console.log(`[${sessionId}] QR Code necessario para restaurar`);
          sessions[sessionId].status = 'qr_ready';
          sessions[sessionId].qrCode = qr;
        });

        client.on('authenticated', () => {
          console.log(`[${sessionId}] Restaurado e autenticado`);
          sessions[sessionId].status = 'authenticated';
          sessions[sessionId].qrCode = null;
        });

        client.on('ready', async () => {
          console.log(`[${sessionId}] Sessao restaurada e pronta!`);
          sessions[sessionId].status = 'ready';
          const info = client.info;
          sessions[sessionId].phoneNumber = info.wid.user;
          
          // Notify backend
          try {
            await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, {
              event: 'ready',
              sessionId,
              phoneNumber: info.wid.user,
              companyId: sessions[sessionId].companyId
            });
          } catch (e) {
            console.log('Erro ao notificar backend:', e.message);
          }
        });

        client.on('message', async (msg) => {
          if (msg.from === 'status@broadcast') return;
          
          let contactName = '';
          let contactNumber = msg.from.replace('@c.us', '').replace('@g.us', '').replace('@lid', '');
          try {
            const contact = await msg.getContact();
            contactName = contact.pushname || contact.name || contactNumber;
          } catch (e) {
            contactName = contactNumber;
          }

          try {
            await axios.post(`${FASTAPI_URL}/api/webhooks/whatsapp-unofficial`, {
              event: 'message',
              sessionId,
              messageId: msg.id._serialized,
              from: msg.from,
              to: msg.to,
              body: msg.body,
              timestamp: msg.timestamp,
              isGroup: msg.from.includes('@g.us'),
              hasMedia: msg.hasMedia,
              type: msg.type,
              contactName,
              contactNumber,
              companyId: sessions[sessionId].companyId
            });
          } catch (e) {
            console.log('Erro ao notificar backend:', e.message);
          }
          
          emitToCompany(sessions[sessionId].companyId, 'whatsapp:message', {
            sessionId,
            from: msg.from,
            body: msg.body,
            contactName
          });
        });

        client.on('disconnected', (reason) => {
          console.log(`[${sessionId}] Desconectado: ${reason}`);
          sessions[sessionId].status = 'disconnected';
        });

        // Initialize
        await client.initialize();
        
        // Wait a bit before next session
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (e) {
        console.log(`Erro ao restaurar sessao ${sessionId}:`, e.message);
        delete sessions[sessionId];
      }
    }
    
    console.log('Restauracao de sessoes concluida');
  } catch (e) {
    console.log('Erro ao verificar sessoes:', e.message);
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`WhatsApp Service rodando na porta ${PORT}`);
  console.log(`FastAPI URL: ${FASTAPI_URL}`);
  console.log(`Socket.IO habilitado para comunicacao em tempo real`);
  
  // Restore sessions after 5 seconds
  setTimeout(restoreSessions, 5000);
});
