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
            aria-label="Поиск чатов"
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
          role="button"
          tabindex="0"
          @keydown.enter="selectChat(chat)"
        >
          <div class="chat-content">
            <div class="chat-avatar">
              <span class="avatar-icon">🚗</span>
            </div>
            <div class="chat-details">
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
        </div>

        <div v-if="filteredChats.length === 0" class="empty-state">
          <span class="empty-icon">💬</span>
          <p>У вас пока нет активных чатов</p>
          <button class="refresh-btn" @click="loadChats" aria-label="Обновить список чатов">
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
import { API_CONFIG } from '@/config/api'

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
        
        const response = await axios.get(API_CONFIG.BASE_URL +'/chat/get', {
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
          API_CONFIG.BASE_URL +'/user/get-id',
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
/* Базовые стили */
.chat-page {
  background-color: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 40px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Переменные для темы, синхронизированные с AppNavbar */
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --container-bg: #ffffff;
  --border-color: #e5e7eb;
  --accent-color: #004281;
  --accent-hover: #003366;
  --secondary-color: #6b7280;
}

.dark-theme {
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
  --container-bg: #1e293b;
  --border-color: #475569;
  --accent-color: #60a5fa;
  --accent-hover: #3b82f6;
  --secondary-color: #94a3b8;
}

.chat-container {
  max-width: 800px;
  margin: 80px auto 0;
  padding: 24px;
  background: var(--container-bg);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.chat-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
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
  padding: 12px 20px 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: var(--container-bg);
  color: var(--text-color);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: var(--bg-color);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-color);
  font-size: 1rem;
  pointer-events: none;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-item {
  padding: 16px;
  background: var(--container-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-item:hover {
  background-color: var(--menu-item-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--accent-color);
}

.chat-item:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.active-chat {
  border-left: 4px solid var(--accent-color);
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.chat-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 1.25rem;
}

.chat-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-datetime {
  font-size: 0.85rem;
  color: var(--secondary-color);
  font-weight: 500;
}

.chat-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.last-message {
  color: var(--secondary-color);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 75%;
}

.unread-badge {
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0 6px;
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.refresh-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.refresh-btn:hover,
.refresh-btn:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.refresh-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 16px;
    margin-top: 70px;
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid var(--border-color);
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .chat-item {
    padding: 14px;
  }

  .chat-avatar {
    width: 36px;
    height: 36px;
  }

  .route {
    font-size: 1rem;
  }

  .trip-datetime {
    font-size: 0.8rem;
  }

  .last-message {
    font-size: 0.85rem;
    max-width: 70%;
  }

  .unread-badge {
    min-width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .chat-header {
    gap: 12px;
  }

  .search-input {
    padding: 10px 16px 10px 36px;
    font-size: 0.9rem;
  }

  .search-icon {
    left: 10px;
  }

  .chat-item {
    padding: 12px;
  }

  .chat-avatar {
    width: 32px;
    height: 32px;
  }

  .route {
    font-size: 0.95rem;
  }

  .trip-datetime {
    font-size: 0.75rem;
  }

  .last-message {
    font-size: 0.8rem;
  }

  .unread-badge {
    min-width: 18px;
    height: 18px;
    font-size: 0.65rem;
  }

  .empty-state {
    padding: 40px 16px;
  }

  .empty-icon {
    font-size: 2rem;
  }
}
</style>