<template>
  <AppNavbar />
  <div class="chat-container">
    <h1 class="section-title">Мои чаты</h1>
    <div class="chat-list">
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="chat-item"
        @click="selectChat(chat)"
      >
        <div class="chat-route">
          <span class="route">{{ chat.departure_location }} → {{ chat.arrival_location }}</span>
        </div>
        <div class="chat-details">
          <span class="departure-time">{{ formatDate(chat.departure_time) }}</span>
          <span class="trip-id">Поездка #{{ chat.trip_id }}</span>
        </div>
      </div>
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
      chats: [],
      token: Cookies.get('token') || ''
    };
  },
  created() {
    this.loadChats();
  },
  methods: {
    async loadChats() {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/chat/get',
          {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          }
        );

        this.chats = response.data.map(chat => ({
          ...chat,
          departure_time: new Date(chat.departure_time)
        }));

        console.log("chat.passenger_id",response.data[0].passenger_id)
        const response1 = await axios.get(
          'http://localhost:5000/api/user/get-id',
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          }
        );
        
        const userId = response1.data.user_id;
        console.log("My id",userId)
        Cookies.set('userId', userId)

      } catch (error) {
        console.error("Ошибка при загрузке чатов:", error);
      }
    },
    selectChat(chat) {
      this.$router.push(`/chat/${chat.id}`);
    },
    formatDate(date) {
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.chat-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-item {
  padding: 15px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.chat-route {
  font-weight: 500;
  margin-bottom: 5px;
  color: #222;
}

.chat-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.departure-time {
  color: #444;
}

.trip-id {
  background: #e0e0e0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>