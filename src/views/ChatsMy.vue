<template>
  <div class="chat-page">
    <AppNavbar />
    <div class="chat-container">
      <div class="chat-header">
        <h1 class="section-title">Мои чаты</h1>
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Поиск чатов..." 
            v-model="searchQuery"
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <div class="chat-list">
        <div 
          v-for="chat in filteredChats" 
          :key="chat.id" 
          class="chat-item"
          :class="{ 'active-chat': activeChatId === chat.id }"
          @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            <img 
              :src="getChatAvatar(chat)" 
              alt="Аватар чата" 
              class="avatar-img"
              @error="handleImageError"
            >
          </div>
          
          <div class="chat-content">
            <div class="chat-info">
              <span class="route">
                {{ chat.departure_location }} → {{ chat.arrival_location }}
              </span>
              <span class="chat-time">
                {{ formatDateTime(chat.departure_time) }}
              </span>
            </div>
            
            <div class="chat-meta">
              <span class="last-message" v-if="chat.last_message">
                {{ truncateMessage(chat.last_message.text, 30) }}
              </span>
              <span 
                v-if="chat.unread_count > 0" 
                class="unread-badge"
              >
                {{ chat.unread_count }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredChats.length === 0" class="empty-state">
          <p>Чатов не найдено</p>
          <button class="refresh-btn" @click="loadChats">
            Обновить список
          </button>
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
      searchQuery: '',
      activeChatId: null,
      isLoading: false,
      error: null
    };
  },
  computed: {
    filteredChats() {
      const query = this.searchQuery.toLowerCase();
      return this.chats.filter(chat => 
        chat.departure_location.toLowerCase().includes(query) ||
        chat.arrival_location.toLowerCase().includes(query) ||
        (chat.last_message && chat.last_message.text.toLowerCase().includes(query))
      );
    }
  },
  created() {
    this.loadChats();
  },
  methods: {
    async loadChats() {
      try {
        this.isLoading = true;
        this.error = null;
        
        const response = await axios.get('https://unigo.onrender.com/api/chat/get', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        this.chats = response.data.map(chat => ({
          ...chat,
          departure_time: new Date(chat.departure_time),
          last_message: chat.last_message || null,
          unread_count: chat.unread_count || 0
        }));

        // Получаем ID пользователя
        const userResponse = await axios.get(
          'https://unigo.onrender.com/api/user/get-id',
          { headers: { 'Authorization': `Bearer ${this.token}` } }
        );
        Cookies.set('userId', userResponse.data.user_id);

      } catch (error) {
        console.error("Ошибка при загрузке чатов:", error);
        this.error = "Не удалось загрузить чаты";
      } finally {
        this.isLoading = false;
      }
    },

    selectChat(chat) {
      this.activeChatId = chat.id;
      this.$router.push(`/chat/${chat.id}`);
    },

    formatDateTime(date) {
      if (!(date instanceof Date)) date = new Date(date);
      
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Вчера в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return date.toLocaleDateString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
      }
    },

    truncateMessage(text, length) {
      return text.length > length ? `${text.substring(0, length)}...` : text;
    },

    getChatAvatar(chat) {
      return chat.avatar_url || '/default-avatar.png';
    },

    handleImageError(e) {
      e.target.src = '/default-avatar.png';
    }
  }
};
</script>

<style scoped>
.chat-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  margin-top: 80px;
}

.chat-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-item:hover {
  background-color: #f8fafd;
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.active-chat {
  border-left: 4px solid #3498db;
  background-color: #f0f7ff !important;
}

.chat-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.route {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
}

.chat-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  white-space: nowrap;
  margin-left: 10px;
}

.chat-meta {
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
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0 5px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.empty-state p {
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.refresh-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #2980b9;
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
  
  .avatar-img {
    width: 45px;
    height: 45px;
  }
}
</style>