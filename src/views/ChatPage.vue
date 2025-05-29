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
    <div v-if="isLoadingChat" class="loading-state">
      <span class="loading-icon">⏳</span>
      <p>Загрузка чата...</p>
    </div>
    <div v-else-if="errorLoadingChat" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>Не удалось загрузить чат. Попробуйте снова.</p>
      <button class="retry-button" @click="loadChat($route.params.id)" aria-label="Попробовать снова">
        Попробовать снова
      </button>
    </div>
    <div v-else class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.isCurrentUser ? 'message-you' : 'message-other']"
      >
        <div class="message-avatar">
          <img
            :src="message.isCurrentUser ? userAvatar : companionAvatar"
            alt="Avatar"
            :aria-label="message.isCurrentUser ? 'Ваш аватар' : 'Аватар собеседника'"
            @error="handleImageError"
          />
        </div>
        <div class="message-content">
          <span class="message-sender">{{ message.senderName }}</span>
          <span class="message-text">{{ message.content }}</span>
          <span class="message-time">{{ formatTime(message.sent_at) }}</span>
          <span v-if="message.isSending" class="message-status">Отправка...</span>
        </div>
      </div>
    </div>
    <button
      v-if="showScrollButton"
      class="scroll-bottom-btn"
      @click="scrollToBottom"
      aria-label="Прокрутить вниз"
    >
      <span class="scroll-icon">⬇</span>
    </button>
    <div class="chat-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Введите сообщение..."
        aria-label="Введите сообщение"
        :disabled="isSendingMessage"
      />
      <button
        @click="sendMessage"
        :disabled="isSendingMessage || !newMessage.trim()"
        aria-label="Отправить сообщение"
        class="action-button send"
      >
        <span v-if="isSendingMessage" class="loading-icon">⏳</span>
        <span v-else class="send-text">Отправить</span>
        <span class="send-icon">➤</span>
      </button>
      <button
        class="action-button clear-input"
        @click="clearInput"
        aria-label="Очистить поле ввода"
        :disabled="!newMessage.trim()"
      >
        Очистить
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from 'js-cookie';
import { API_CONFIG } from '@/config/api';
import { debounce } from 'lodash';

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
      isLoadingChat: false,
      errorLoadingChat: false,
      isSendingMessage: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectDelay: 3000,
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
      this.socket.close(1000, 'Component unmounted');
    }
  },
  methods: {
    async loadChat(chatId) {
      try {
        this.isLoadingChat = true;
        this.errorLoadingChat = false;
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/chat/${chatId}`,
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
        this.errorLoadingChat = true;
        this.$toast.error('Не удалось загрузить данные чата.');
      } finally {
        this.isLoadingChat = false;
      }
    },
    async loadMessages(chatId) {
      try {
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/chat/${chatId}/messages`,
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get("token")}`
            }
          }
        );
        this.messages = response.data.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender_id === this.currentUserId,
          senderName: msg.sender_id === this.currentUserId ? 'Вы' : 'Собеседник'
        }));
        this.$nextTick(() => this.scrollToBottom());
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
        this.$toast.error('Не удалось загрузить сообщения.');
      }
    },
    initWebSocket(chatId) {
      const connect = () => {
        try {
          this.socket = new WebSocket(`${API_CONFIG.WS_URL}/chat/${chatId}`);

          this.socket.onopen = () => {
            console.log('WebSocket соединение установлено');
            this.reconnectAttempts = 0;
            this.socket.send(JSON.stringify({
              type: 'auth',
              token: Cookies.get('token'),
              user_id: this.currentUserId
            }));
            this.$toast.success('Подключение к чату установлено.');
          };

          this.socket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              if (message.type === 'message') {
                this.handleNewMessage(message);
              }
            } catch (error) {
              console.error('Ошибка обработки WebSocket сообщения:', error);
              this.$toast.error('Ошибка обработки сообщения.');
            }
          };

          this.socket.onclose = (event) => {
            console.log('WebSocket соединение закрыто:', event);
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
              const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
              setTimeout(() => {
                console.log(`Попытка переподключения ${this.reconnectAttempts + 1}...`);
                this.reconnectAttempts++;
                connect();
              }, delay);
            } else if (event.code !== 1000) {
              console.error('Достигнуто максимальное количество попыток переподключения.');
              this.$toast.error('Не удалось подключиться к чату. Используется резервный режим.');
            }
          };

          this.socket.onerror = (error) => {
            console.error('WebSocket ошибка:', error);
          };
        } catch (error) {
          console.error('Ошибка инициализации WebSocket:', error);
          this.$toast.error('Ошибка подключения к чату.');
        }
      };

      connect();
    },
    handleNewMessage(message) {
      this.messages.push({
        ...message,
        isCurrentUser: message.sender_id === this.currentUserId,
        senderName: message.sender_id === this.currentUserId ? 'Вы' : 'Собеседник',
        isSending: false
      });
      this.$nextTick(() => this.scrollToBottom());
    },
    sendMessage: debounce(async function () {
      if (!this.newMessage.trim()) {
        this.$toast.warning('Сообщение не может быть пустым.');
        return;
      }

      this.isSendingMessage = true;
      const messageData = {
        type: 'message',
        chat_id: parseInt(this.$route.params.id),
        sender_id: this.currentUserId,
        content: this.newMessage,
        sent_at: new Date().toISOString()
      };

      try {
        // Optimistic update
        this.messages.push({
          ...messageData,
          isCurrentUser: true,
          senderName: 'Вы',
          isSending: true
        });
        this.newMessage = "";
        this.$nextTick(() => this.scrollToBottom());

        // Try WebSocket
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify(messageData));
        } else {
          // Fallback to HTTP
          await axios.post(
            `${API_CONFIG.BASE_URL}/chat/${this.$route.params.id}/messages`,
            {
              content: messageData.content,
              sender_id: messageData.sender_id
            },
            {
              headers: {
                'Authorization': `Bearer ${Cookies.get("token")}`
              }
            }
          );
        }

        // Update message status
        this.messages = this.messages.map(msg =>
          msg.sent_at === messageData.sent_at && msg.isSending
            ? { ...msg, isSending: false }
            : msg
        );
        this.$toast.success('Сообщение отправлено.');
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        this.$toast.error('Не удалось отправить сообщение.');
        // Revert optimistic update on failure
        this.messages = this.messages.filter(
          msg => !(msg.sent_at === messageData.sent_at && msg.isSending)
        );
      } finally {
        this.isSendingMessage = false;
      }
    }, 300),
    clearInput() {
      this.newMessage = "";
      this.$toast.info('Поле ввода очищено.');
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
      if (!timestamp) return 'Не указано';
      const date = new Date(timestamp);
      return isNaN(date.getTime())
        ? 'Неверное время'
        : date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/40?text=Avatar';
    }
  }
};
</script>

<style scoped>
/* Базовые стили */
:root {
  --bg-color: #ffffff;
  --text-color: #1a202c;
  --container-bg: #f9fafb;
  --border-color: #e2e8f0;
  --accent-color: #004281;
  --accent-hover: #003366;
  --secondary-color: #6b7280;
  --message-you-bg: #004281;
  --message-you-text: #ffffff;
  --message-other-bg: #e5e7eb;
  --message-other-text: #1a202c;
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
  --success-color: #10b981;
  --success-hover: #059669;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  --message-you-text: #ffffff;
  --message-other-bg: #334155;
  --message-other-text: #e2e8f0;
  --danger-color: #f87171;
  --danger-hover: #ef4444;
  --success-color: #34d399;
  --success-hover: #10b981;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.chat-page {
  max-width: 640px;
  margin: 80px auto 0;
  padding: 24px;
  background-color: var(--bg-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  min-height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.chat-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);
}

.chat-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 12px;
  line-height: 1.2;
}

.trip-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--secondary-color);
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--container-bg);
  border-radius: 10px;
  margin-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.4s ease-out;
}

.message-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.message-content {
  margin-left: 12px;
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-sender {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-color);
}

.message-text {
  background-color: var(--message-other-bg);
  color: var(--message-other-text);
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 1rem;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.message-you .message-content {
  margin-left: auto;
  margin-right: 12px;
  text-align: right;
}

.message-you .message-text {
  background-color: var(--message-you-bg);
  color: var(--message-you-text);
  border-radius: 16px 16px 4px 16px;
}

.message-other .message-text {
  border-radius: 16px 16px 16px 4px;
}

.message-time {
  font-size: 0.8rem;
  color: var(--secondary-color);
  margin-top: 4px;
  font-weight: 400;
}

.message-status {
  font-size: 0.8rem;
  color: var(--secondary-color);
  font-style: italic;
  margin-top: 4px;
}

.scroll-bottom-btn {
  position: fixed;
  bottom: 90px;
  right: 32px;
  background-color: var(--accent-color);
  color: var(--message-you-text);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.scroll-bottom-btn:hover,
.scroll-bottom-btn:focus-visible {
  background-color: var(--accent-hover);
  transform: scale(1.1);
}

.scroll-bottom-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.scroll-icon {
  font-size: 1.5rem;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: var(--container-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.chat-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: all 0.2s ease;
}

.chat-input input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.chat-input input:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.action-button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.action-button.send {
  background-color: var(--accent-color);
  color: var(--message-you-text);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.action-button.send:disabled {
  background-color: var(--secondary-color);
  color: var(--text-color);
  cursor: not-allowed;
  box-shadow: none;
}

.action-button.send:hover:not(:disabled),
.action-button.send:focus-visible:not(:disabled) {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-button.send:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.action-button.clear-input {
  background-color: var(--danger-color);
  color: var(--message-you-text);
  border: 1px solid var(--danger-color);
  font-weight: 700;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.action-button.clear-input:hover:not(:disabled),
.action-button.clear-input:focus-visible:not(:disabled) {
  background-color: var(--danger-hover);
  border-color: var(--danger-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-button.clear-input:disabled {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  color: var(--text-color);
  cursor: not-allowed;
  box-shadow: none;
}

.send-text {
  display: none;
}

.send-icon {
  font-size: 1.2rem;
}

.loading-state, .error-state {
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border: 2px dashed var(--border-color);
  margin-bottom: 24px;
  background-color: var(--container-bg);
}

.loading-icon, .error-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.loading-state p, .error-state p {
  font-size: 1.1rem;
  font-weight: 500;
}

.retry-button {
  padding: 12px 24px;
  background-color: var(--accent-color);
  color: var(--message-you-text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.retry-button:hover,
.retry-button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.retry-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 480px) {
  .chat-page {
    margin-top: 96px;
    padding: 32px;
    min-height: calc(100vh - 128px);
  }
  
  .chat-header h2 {
    font-size: 2rem;
  }
  
  .trip-info {
    flex-direction: row;
    gap: 20px;
    justify-content: center;
    font-size: 1rem;
  }
  
  .send-text {
    display: inline;
  }
  
  .message-avatar img {
    width: 48px;
    height: 48px;
  }
  
  .message-content {
    max-width: 70%;
  }
}

@media (max-width: 360px) {
  .chat-page {
    padding: 16px;
    margin-top: 64px;
  }
  
  .chat-header h2 {
    font-size: 1.5rem;
  }
  
  .trip-info {
    font-size: 0.85rem;
    gap: 6px;
  }
  
  .message-text {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
  
  .chat-input input {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
  
  .action-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .scroll-bottom-btn {
    bottom: 80px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}
</style>