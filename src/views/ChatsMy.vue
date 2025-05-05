<template>
  <div class="chat-page">
    <AppNavbar />
    <div class="chat-container">
      <div class="chat-header">
        <h1 class="section-title">Мои сообщения</h1>
        <div class="unread-count" v-if="unreadCount > 0">
          {{ unreadCount }} непрочитанных
        </div>
      </div>
      
      <div class="chat-list">
        <div
          v-for="chat in chats"
          :key="chat.id"
          class="chat-item"
          :class="{ 'has-unread': chat.unread_count > 0 }"
          @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            <img :src="getAvatar(chat)" alt="Аватар" class="avatar-image">
          </div>
          <div class="chat-content">
            <div class="chat-top-row">
              <span class="route">{{ formatRoute(chat) }}</span>
              <span class="chat-time">{{ formatTime(chat.departure_time) }}</span>
            </div>
            <div class="chat-bottom-row">
              <span class="last-message" v-if="chat.last_message">
                {{ truncateMessage(chat.last_message) }}
              </span>
              <span v-if="chat.unread_count > 0" class="unread-badge">
                {{ chat.unread_count }}
              </span>
            </div>
          </div>
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
      token: Cookies.get('token') || '',
      unreadCount: 0
    };
  },
  created() {
    this.loadChats();
  },
  methods: {
    async loadChats() {
      try {
        const response = await axios.get(
          'https://unigo.onrender.com/api/chat/get',
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

        // Подсчет непрочитанных сообщений
        this.unreadCount = this.chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);

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
      });
    },
    formatTime(date) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatRoute(chat) {
      return `${chat.departure_location} → ${chat.arrival_location}`;
    },
    truncateMessage(message, length = 30) {
      return message.length > length 
        ? message.substring(0, length) + '...' 
        : message;
    },
    getAvatar(chat) {
      // Здесь можно добавить логику для получения аватара собеседника
      return chat.avatarUrl || '/default-avatar.jpg';
    }
  }
};
</script>

<style scoped>
.chat-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  margin-top: 80px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.unread-count {
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.chat-item.has-unread {
  border-left: 4px solid #3498db;
  background-color: #f8fafd;
}

.chat-avatar {
  margin-right: 15px;
}

.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dfe6e9;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-top-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.route {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.chat-time {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.chat-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  color: #636e72;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.unread-badge {
  background-color: #3498db;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 15px;
    margin-top: 70px;
    border-radius: 0;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .chat-item {
    padding: 12px;
  }
  
  .avatar-image {
    width: 45px;
    height: 45px;
  }
}
</style>