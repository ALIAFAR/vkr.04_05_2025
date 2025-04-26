<template>
  <div class="chat-page">
    <AppNavbar />
    <div class="chat-header">
      <h2>{{ chat.name }}</h2>
      <p>Поездка: {{ chat.trip }}</p>
      <p>Дата: {{ chat.date }}</p>
    </div>
    <div class="chat-messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.sender === 'Вы' ? 'message-you' : 'message-other']"
      >
        <div class="message-avatar">
          <img
            :src="message.sender === 'Вы' ? '/pngwing.com (5).png' : '/pngwing.com (5).png'"
            alt="Avatar"
          />
        </div>
        <div class="message-content">
          <span class="message-sender">{{ message.sender }}</span>
          <span class="message-text">{{ message.text }}</span>
          <span class="message-time">{{ message.time }}</span>
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

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      chat: {},
      messages: [],
      newMessage: "",
    };
  },
  created() {
    const chatId = this.$route.params.id;
    this.loadChat(chatId);
    this.loadMessages(chatId);
  },
  methods: {
    async loadChat(chatId) {
      try {
        const response = await axios.get(`/api/chats/${chatId}`);
        this.chat = response.data;
      } catch (error) {
        console.error("Ошибка при загрузке данных о чате:", error);
      }
    },
    async loadMessages(chatId) {
      try {
        const response = await axios.get(`/api/chats/${chatId}/messages`);
        this.messages = response.data;
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
      }
    },
    async sendMessage() {
      if (this.newMessage.trim()) {
        try {
          const chatId = this.$route.params.id;
          const response = await axios.post(`/api/chats/${chatId}/messages`, {
            text: this.newMessage,
          });

          if (response.data.success) {
            const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            this.messages.push({ sender: "Вы", text: this.newMessage, time: currentTime });
            this.newMessage = "";
            
            // Прокрутка вниз после отправки сообщения
            this.$nextTick(() => {
              const messagesContainer = document.querySelector('.chat-messages');
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
          } else {
            console.error("Ошибка при отправке сообщения:", response.data.message);
          }
        } catch (error) {
          console.error("Ошибка при отправке сообщения:", error);
          if (error.response) {
            console.error("Ответ сервера:", error.response.data);
          }
        }
      }
    }
  }
};
</script>

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