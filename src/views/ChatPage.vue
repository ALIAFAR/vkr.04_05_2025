<template>
  <div class="chat-page">
    <AppNavbar />
    <div class="chat-header">
      <h2>{{ chat.name }}</h2>
      <p>Поездка: {{ chat.trip }}</p>
      <p>Дата: {{ chat.date }}</p>
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
          />
        </div>
        <div class="message-content">
          <span class="message-sender">{{ message.senderName }}</span>
          <span class="message-text">{{ message.content }}</span>
          <span class="message-time">{{ formatTime(message.sent_at) }}</span>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Введите сообщение..."
      />
      <button @click="sendMessage">
        <span class="send-text">Отправить</span>
        <i class="fas fa-paper-plane send-icon"></i>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from 'js-cookie';

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
      currentUserId: null, // ID текущего пользователя из хранилища/Vuex
      companionId: null // ID собеседника
    };
  },
  async created() {
    this.currentUserId = parseInt(Cookies.get('userId') || 1); // сначала получаем ID
    const chatId = this.$route.params.id;
    await this.loadChat(chatId);
    await this.loadMessages(chatId);
    this.initWebSocket(chatId);
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
          `https://unigo.onrender.com/api/chat/${chatId}`,
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get("token")}`
            }
          }
        )
        this.chat = response.data;
        console.log("this.chat.driver_id",this.chat.driver_id)
        console.log("this.chat.passenger_id",this.chat.passenger_id)
        // Определяем ID собеседника
        this.companionId = this.chat.passenger_id === this.currentUserId 
          ? this.chat.driver_id 
          : this.chat.passenger_id;
      } catch (error) {
        console.error("Ошибка при загрузке данных о чате:", error);
      }
    },
    async loadMessages(chatId) {
      try {
        const response = await axios.get(`https://unigo.onrender.com/api/chat/${chatId}/messages`);
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
      // Определяем протокол (ws или wss)
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Формируем URL для WebSocket соединения
      const wsUrl = `${wsProtocol}//${window.location.hostname}:5000/`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket соединение установлено');
        // Авторизуемся (отправляем user_id)
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
          
          // Оптимистичное обновление UI
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
        }
      });
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

<!-- Стили остаются без изменений -->

<style scoped>
.chat-page {
  max-width: 600px;
  margin: 60px auto 0;
  padding: 15px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  text-align: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.chat-header h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 5px;
}

.chat-header p {
  font-size: 14px;
  color: #666;
  margin: 3px 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 15px;
  border-radius: 8px;
  -webkit-overflow-scrolling: touch; /* Для плавной прокрутки на iOS */
}

.message {
  display: flex;
  margin-bottom: 12px;
}

.message-avatar img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  margin-left: 8px;
  max-width: 75%;
}

.message-sender {
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 3px;
  font-size: 14px;
}

.message-text {
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 12px;
  display: inline-block;
  font-size: 15px;
  word-break: break-word;
}

.message-time {
  font-size: 11px;
  color: #666;
  display: block;
  margin-top: 3px;
}

.message-you .message-content {
  margin-left: auto;
  text-align: right;
}

.message-you .message-text {
  background-color: rgba(0, 66, 129, 1);
  color: #fff;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  background-color: #fff;
  border-radius: 8px;
}

.chat-input input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 15px;
}

.chat-input button {
  padding: 0 15px;
  background-color: rgba(0, 66, 129, 1);
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px; /* Минимальный размер для удобного нажатия */
}

.chat-input button:hover {
  background-color: rgba(0, 66, 129, 0.9);
}

.send-text {
  display: none;
}

.send-icon {
  font-size: 18px;
}

/* Адаптация для экранов шире 480px */
@media (min-width: 480px) {
  .chat-page {
    margin-top: 80px;
    padding: 20px;
    height: calc(100vh - 80px);
  }
  
  .send-text {
    display: inline;
    margin-right: 5px;
  }
  
  .message-avatar img {
    width: 40px;
    height: 40px;
  }
  
  .message-content {
    max-width: 70%;
  }
}

/* Адаптация для очень маленьких экранов */
@media (max-width: 360px) {
  .chat-header h2 {
    font-size: 18px;
  }
  
  .chat-header p {
    font-size: 13px;
  }
  
  .message-text {
    padding: 6px 10px;
    font-size: 14px;
  }
  
  .chat-input input {
    padding: 8px 10px;
  }
}
</style>