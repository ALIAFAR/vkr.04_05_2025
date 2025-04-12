<template>
  <AppNavbar />
  <div class="chat-container">
    <h1 class="section-title">Чаты</h1>
    <div class="chat-list">
      <div
        v-for="(chat, index) in chats"
        :key="index"
        class="chat-item"
        @click="selectChat(chat)"
      >
        <span class="chat-name">{{ chat.name }}</span>
        <span class="chat-trip">Поездка: {{ chat.trip }}</span>
        <span class="chat-date">Дата: {{ chat.date }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppNavbar from "@/components/AppNavbar.vue";
import VueCookies from "vue-cookies";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      chats: [], // Список чатов
    };
  },
  created() {
    // Загружаем список чатов при создании компонента
    this.loadChats();
  },
  methods: {
    async loadChats() {
      try {
        // Загружаем список чатов с сервера
        const response = await axios.get('/api/chats');
        this.chats = response.data; // Сохраняем список чатов
      } catch (error) {
        console.error("Ошибка при загрузке списка чатов:", error);
      }
    },
    async selectChat(chat) {
      try {
        // Сохраняем выбранный чат в куки
        VueCookies.set("selectedChat", chat.id, "1h"); // Кука действительна 1 час

        // Опционально: отправляем запрос на сервер для сохранения выбранного чата
        await axios.post(`/api/chats/${chat.id}/select`);

        // Переходим к конкретному чату
        this.$router.push(`/chat/${chat.id}`);
      } catch (error) {
        console.error("Ошибка при выборе чата:", error);
      }
    },
  },
  mounted() {
    // Проверяем, есть ли сохранённый чат в куках
    const selectedChatId = VueCookies.get("selectedChat");
    if (selectedChatId) {
      console.log("Сохранённый чат из куки:", selectedChatId);
    }
  },
};
</script>

<style scoped>
.chat-container {
  text-align: center;
  padding: 50px 20px;
  max-width: 600px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-item {
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.chat-item:hover {
  background-color: #f0f0f0;
}

.chat-name {
  font-size: 18px;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.chat-trip {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.chat-date {
  font-size: 14px;
  color: #666;
}
</style>