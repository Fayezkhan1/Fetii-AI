import { useEffect } from 'react'

function N8nChatWidget({ onMessageReceived }) {
  console.log('🎯 N8N CHAT WIDGET LOADING!')
  console.log('📞 onMessageReceived callback:', typeof onMessageReceived)
  
  useEffect(() => {
    console.log('🔥 N8N CHAT WIDGET USEEFFECT RUNNING!')
    // Load normalize CSS
    const normalizeLink = document.createElement('link')
    normalizeLink.href = 'https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.min.css'
    normalizeLink.rel = 'stylesheet'
    document.head.appendChild(normalizeLink)

    // Load n8n chat CSS
    const chatLink = document.createElement('link')
    chatLink.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css'
    chatLink.rel = 'stylesheet'
    document.head.appendChild(chatLink)

    // Load and initialize the n8n chat widget
    const script = document.createElement('script')
    script.type = 'module'
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      
      const chat = createChat({
        mode: 'window',
        webhookUrl: 'https://abdulmannan34695.app.n8n.cloud/webhook/1203a737-5c17-4c8e-9730-37dc59e8f34e/chat',
        showWelcomeScreen: false,
        loadPreviousSession: false,
        webhookConfig: {
          headers: {
            'Content-Type': 'application/json',
            'X-Instance-Id': '5c03a30c37683f0cce158d1624c4545432736710298667ae3bf3ee07e668bc12',
          }
        },
        allowFileUploads: false,
        initialMessages: [
          "What would you like to know about Austin ride data?"
        ],
        enableStreaming: false,
      });

      // Listen for messages to intercept responses
      if (chat && chat.on) {
        chat.on('message', (message) => {
          if (message.type === 'bot' && window.handleChatMessage) {
            window.handleChatMessage(message.content);
          }
        });
      }
    `
    
    document.head.appendChild(script)

    // Set up global message handler
    window.handleChatMessage = (content) => {
      console.log('🎯 GLOBAL MESSAGE HANDLER TRIGGERED!')
      console.log('📨 Content received:', content)
      console.log('📞 onMessageReceived exists:', !!onMessageReceived)
      
      if (onMessageReceived) {
        console.log('✅ Calling onMessageReceived...')
        onMessageReceived(content);
      } else {
        console.log('❌ No onMessageReceived callback!')
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(normalizeLink)) {
        document.head.removeChild(normalizeLink)
      }
      if (document.head.contains(chatLink)) {
        document.head.removeChild(chatLink)
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
      delete window.handleChatMessage;
    }
  }, [onMessageReceived])

  // Return null since n8n chat creates its own UI
  return null
}

export default N8nChatWidget