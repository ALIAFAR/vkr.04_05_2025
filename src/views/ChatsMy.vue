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
          <div class="chat-content">
            <div class="route-info">
              <span class="route">
                {{ chat.departure_location }} → {{ chat.arrival_location }}
              </span>
              <span class="trip-datetime">
                {{ formatDate(chat.departure_time) }} в {{ formatTime(chat.departure_time) }}
              </span>
            </div>
            
            <div class="chat-meta">
              <span class="last-message" v-if="chat.last_message">
                {{ truncateMessage(chat.last_message.text, 40) }}
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
          <p>У вас пока нет активных чатов</p>
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
          last_message: chat.last_message ? {
            ...chat.last_message,
            created_at: new Date(chat.last_message.created_at)
          } : null,
          unread_count: chat.unread_count || 0
        }));

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

    formatTime(date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },

    formatDate(date) {
      const options = { day: 'numeric', month: 'long' };
      return new Date(date).toLocaleDateString('ru-RU', options);
    },

    truncateMessage(text, length) {
      if (!text) return '';
      return text.length > length ? `${text.substring(0, length)}...` : text;
    }
  }
};
</script>

<style scoped>
.chat-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 30px;
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 80px;
}

.chat-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
  text-align: center;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  background-color: white;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  font-size: 1.1rem;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-item {
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-item:hover {
  background-color: #f8fafd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #d0d0d0;
}

.active-chat {
  border-left: 4px solid #3498db;
  background-color: #f5f9ff !important;
}

.chat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-datetime {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.chat-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.last-message {
  color: #636e72;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.unread-badge {
  background-color: #e74c3c;
  color: white;
  border-radius: 12px;
  min-width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0 6px;
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #7f8c8d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
  color: #95a5a6;
}

.refresh-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(41, 128, 185, 0.3);
}

@media (max-width: 768px) {
  .chat-container {
    padding: 16px;
    margin-top: 70px;
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid #eee;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .chat-item {
    padding: 14px;
  }

  .route {
    font-size: 1rem;
  }

  .trip-datetime {
    font-size: 0.8rem;
  }

  .last-message {
    font-size: 0.88rem;
    max-width: 70%;
  }
}

@media (max-width: 480px) {
  .chat-header {
    gap: 12px;
  }

  .search-input {
    padding: 10px 16px 10px 40px;
    font-size: 0.95rem;
  }

  .chat-item {
    padding: 12px;
  }

  .route {
    font-size: 0.95rem;
  }

  .trip-datetime {
    font-size: 0.75rem;
  }

  .last-message {
    font-size: 0.85rem;
  }

  .unread-badge {
    min-width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
}
</style>