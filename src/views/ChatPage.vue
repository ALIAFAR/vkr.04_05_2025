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
        <span>Отправить</span>
        <i class="fas fa-paper-plane"></i>
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
      chat: {}, // Данные о чате
      messages: [], // Сообщения в чате
      newMessage: "", // Новое сообщение
    };
  },
  created() {
    // Получаем ID чата из параметров маршрута
    const chatId = this.$route.params.id;
    // Загружаем данные о чате
    this.loadChat(chatId);
    // Загружаем сообщения для конкретного чата
    this.loadMessages(chatId);
  },
  methods: {
    async loadChat(chatId) {
      try {
        // Загружаем данные о чате с сервера
        const response = await axios.get(`/api/chats/${chatId}`);
        this.chat = response.data; // Сохраняем данные о чате
      } catch (error) {
        console.error("Ошибка при загрузке данных о чате:", error);
      }
    },
    async loadMessages(chatId) {
      try {
        // Загружаем сообщения для конкретного чата
        const response = await axios.get(`/api/chats/${chatId}/messages`);
        this.messages = response.data; // Сохраняем сообщения
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
      }
    },
    async sendMessage() {
  if (this.newMessage.trim()) {
    try {
      // Отправляем новое сообщение на сервер
      const chatId = this.$route.params.id;
      const response = await axios.post(`/api/chats/${chatId}/messages`, {
        text: this.newMessage,
      });

      // Проверяем успешность ответа
      if (response.data.success) {
        // Добавляем новое сообщение в список
        const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        this.messages.push({ sender: "Вы", text: this.newMessage, time: currentTime });

        this.newMessage = ""; // Очищаем поле ввода
      } else {
        console.error("Ошибка при отправке сообщения:", response.data.message);
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);

      // Если сервер возвращает ошибку, выводим её сообщение
      if (error.response) {
        console.error("Ответ сервера:", error.response.data);
      }
    }
  }
}}
};
</script>

  <style scoped>
  .chat-page {
    max-width: 600px;
    margin: 120px auto 0;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .chat-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .chat-header h2 {
    font-size: 24px;
    color: #333;
  }
  
  .chat-header p {
    font-size: 16px;
    color: #666;
  }
  
  .chat-messages {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    background-color: #fff;
    margin-bottom: 20px;
  }
  
  .message {
    display: flex;
    margin-bottom: 15px;
  }
  
  .message-avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  
  .message-content {
    margin-left: 10px;
    max-width: 70%;
  }
  
  .message-sender {
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 5px;
  }
  
  .message-text {
    background-color: #e9ecef;
    padding: 10px;
    border-radius: 10px;
    display: inline-block;
  }
  
  .message-time {
    font-size: 12px;
    color: #666;
    display: block;
    margin-top: 5px;
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
    gap: 10px;
  }
  
  .chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .chat-input button {
    padding: 10px 20px;
    background-color: rgba(0, 66, 129, 1);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .chat-input button:hover {
    background-color: rgba(0, 66, 129, 1);
  }
  
  .chat-input button i {
    font-size: 16px;
  }
  </style>