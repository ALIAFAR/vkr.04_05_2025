<template>
  <div class="chat-page">
    <AppNavbar />
    <div class="chat-header">
      <h2>{{ chat.name }}</h2>
      <div class="trip-info">
        <span>Поездка: {{ chat.trip }}</span>
        <span>Дата: {{ chat.date }}</span>
      </div>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.isCurrentUser ? 'message-you' : 'message-other']"
      >
        <div class="message-avatar">
          <img
            :src="message.isCurrentUser ? userAvatar : companionAvatar"
            alt="Avatar"
            :aria-label="message.isCurrentUser ? 'Your avatar' : 'Companion avatar'"
          />
        </div>
        <div class="message-content">
          <span class="message-sender">{{ message.senderName }}</span>
          <span class="message-text">{{ message.content }}</span>
          <span class="message-time">{{ formatTime(message.sent_at) }}</span>
        </div>
      </div>
    </div>
    <button
      v-if="showScrollButton"
      class="scroll-bottom-btn"
      @click="scrollToBottom"
      aria-label="Scroll to bottom"
    >
      <span class="scroll-icon">⬇</span>
    </button>
    <div class="chat-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Введите сообщение..."
        aria-label="Введите сообщение"
      />
      <button @click="sendMessage" aria-label="Отправить сообщение">
        <span class="send-text">Отправить</span>
        <span class="send-icon">➤</span>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from 'js-cookie';
import { API_CONFIG } from '@/config/api'

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      chat: {},
      messages: [],
      newMessage: "",
      socket: null,
      userAvatar: '/pngwing.com (5).png',
      companionAvatar: '/pngwing.com (5).png',
      currentUserId: null,
      companionId: null,
      showScrollButton: false,
    };
  },
  async created() {
    this.currentUserId = parseInt(Cookies.get('userId') || 1);
    const chatId = this.$route.params.id;
    await this.loadChat(chatId);
    await this.loadMessages(chatId);
    this.initWebSocket(chatId);
    this.setupScrollListener();
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
  },
  methods: {
    async loadChat(chatId) {
      try {
        const response = await axios.get(
          API_CONFIG.BASE_URL +`/chat/${chatId}`,
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get("token")}`
            }
          }
        );
        this.chat = response.data;
        this.companionId = this.chat.passenger_id === this.currentUserId 
          ? this.chat.driver_id 
          : this.chat.passenger_id;
      } catch (error) {
        console.error("Ошибка при загрузке данных о чате:", error);
      }
    },
    async loadMessages(chatId) {
      try {
        const response = await axios.get(API_CONFIG.BASE_URL +`/chat/${chatId}/messages`);
        this.messages = response.data.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender_id === this.currentUserId,
          senderName: msg.sender_id === this.currentUserId ? 'Вы' : 'Собеседник'
        }));
        this.scrollToBottom();
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
      }
    },
    initWebSocket() {
      this.socket = new WebSocket(API_CONFIG.WS_URL);

      this.socket.onopen = () => {
        console.log('WebSocket соединение установлено');
        this.socket.send(JSON.stringify({
          type: 'auth',
          user_id: this.currentUserId
        }));
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
          this.handleNewMessage(message);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket соединение закрыто');
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
      };
    },
    handleNewMessage(message) {
      this.messages.push({
        ...message,
        isCurrentUser: message.sender_id === this.currentUserId,
        senderName: message.sender_id === this.currentUserId ? 'Вы' : 'Собеседник'
      });
      this.scrollToBottom();
    },
    async sendMessage() {
      if (this.newMessage.trim() && this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          const messageData = {
            type: 'message',
            chat_id: this.$route.params.id,
            sender_id: this.currentUserId,
            content: this.newMessage
          };

          this.socket.send(JSON.stringify(messageData));
          
          this.messages.push({
            content: this.newMessage,
            sender_id: this.currentUserId,
            isCurrentUser: true,
            senderName: 'Вы',
            sent_at: new Date().toISOString()
          });
          
          this.newMessage = "";
          this.scrollToBottom();
        } catch (error) {
          console.error("Ошибка при отправке сообщения:", error);
        }
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
          this.showScrollButton = false;
        }
      });
    },
    setupScrollListener() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.addEventListener('scroll', () => {
          const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
          this.showScrollButton = !isAtBottom;
        });
      }
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
/* Базовые стили */
.chat-page {
  max-width: 600px;
  margin: 80px auto 0;
  padding: 20px;
  background-color: var(--bg-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Переменные для темы, синхронизированные с AppNavbar и ChatPage */
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --container-bg: #ffffff;
  --border-color: #e5e7eb;
  --accent-color: #004281;
  --accent-hover: #003366;
  --secondary-color: #6b7280;
  --message-you-bg: #004281;
  --message-other-bg: #e5e7eb;
}

.dark-theme {
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
  --container-bg: #1e293b;
  --border-color: #475569;
  --accent-color: #60a5fa;
  --accent-hover: #3b82f6;
  --secondary-color: #94a3b8;
  --message-you-bg: #60a5fa;
  --message-other-bg: #334155;
}

.chat-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.chat-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px;
}

.trip-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--container-bg);
  border-radius: 10px;
  margin-bottom: 16px;
  -webkit-overflow-scrolling: touch;
}

.message {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

.message-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  margin-left: 12px;
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-sender {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}

.message-text {
  background-color: var(--message-other-bg);
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--text-color);
  word-break: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-time {
  font-size: 0.75rem;
  color: var(--secondary-color);
  margin-top: 2px;
}

.message-you .message-content {
  margin-left: auto;
  margin-right: 12px;
  text-align: right;
}

.message-you .message-text {
  background-color: var(--message-you-bg);
  color: white;
}

.scroll-bottom-btn {
  position: absolute;
  bottom: 80px;
  right: 24px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.scroll-bottom-btn:hover,
.scroll-bottom-btn:focus-visible {
  background-color: var(--accent-hover);
  transform: scale(1.05);
}

.scroll-bottom-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.scroll-icon {
  font-size: 1.25rem;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: var(--container-bg);
  border-radius: 10px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.chat-input input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: all 0.2s ease;
}

.chat-input input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chat-input button {
  padding: 10px 16px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-input button:hover,
.chat-input button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.chat-input button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.send-text {
  display: none;
}

.send-icon {
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 480px) {
  .chat-page {
    margin-top: 80px;
    padding: 24px;
    min-height: calc(100vh - 80px);
  }
  
  .chat-header h2 {
    font-size: 1.75rem;
  }
  
  .trip-info {
    flex-direction: row;
    gap: 16px;
    justify-content: center;
  }
  
  .send-text {
    display: inline;
  }
  
  .message-avatar img {
    width: 40px;
    height: 40px;
  }
  
  .message-content {
    max-width: 65%;
  }
}

@media (max-width: 360px) {
  .chat-page {
    padding: 16px;
  }
  
  .chat-header h2 {
    font-size: 1.25rem;
  }
  
  .trip-info {
    font-size: 0.85rem;
  }
  
  .message-text {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .chat-input input {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .chat-input button {
    padding: 8px 12px;
  }
}
</style>