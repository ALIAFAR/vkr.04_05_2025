<template>
  <div>
    <!-- Навигационная панель для оператора -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="Operator Logo" class="logo-img" />
        <span class="logo-text">UniGo</span>
        <span class="logo-text-mobile"> Панель оператора</span>
      </div>
      <div class="menu">
        <button class="menu-item" @click="goToDataUpload">Загрузка данных</button>
        <button class="menu-item active">Уведомления</button>
        <button class="menu-item" @click="goToUsers">Пользователи</button>
        <button class="menu-item" @click="goToCars">Автомобили</button>

        <!-- Выход -->
        <div class="profile" ref="profile">
          <img
            src="/pngwing.com (5).png"
            class="profile-photo"
            @click="toggleProfileDropdown"
            alt="Профиль"
          />
          <div v-if="isProfileDropdownVisible" class="dropdown-menu">
            <button @click="confirmLogout">Выход</button>
          </div>
        </div>
      </div>
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        ☰
      </button>
    </div>

    <!-- Мобильное меню -->
    <div v-if="isMobileMenuVisible" class="mobile-menu">
      <button class="mobile-menu-item" @click="goToDataUpload">Загрузка данных</button>
      <button class="mobile-menu-item active">Уведомления</button>
      <button class="mobile-menu-item" @click="goToUsers">Пользователи</button>
      <button class="mobile-menu-item" @click="goToCars">Автомобили</button>
      <button class="mobile-menu-item logout-btn" @click="confirmLogout">Выход</button>
    </div>

    <!-- Модальное окно для подтверждения выхода -->
    <div v-if="isLogoutConfirmVisible" class="logout-modal">
      <div class="modal-content">
        <p>Вы уверены, что хотите выйти из профиля?</p>
        <div class="modal-buttons">
          <button @click="logout">Да</button>
          <button @click="cancelLogout">Нет</button>
        </div>
      </div>
    </div>

    <!-- Секция для уведомлений -->
    <div class="notifications-section">
      <h2>Уведомления</h2>
      <ul v-if="notifications.length > 0">
        <li v-for="(notification, index) in notifications" :key="index" class="notification-item">
          <div class="notification-content">
            <p><strong>Пользователь:</strong> {{ notification.userName }}</p>
            <p><strong>Поездка:</strong> {{ notification.trip }}</p>
            <p><strong>Водитель:</strong> {{ notification.driver }}</p>
            <p><strong>Сообщение:</strong> {{ notification.message }}</p>
            <p><strong>Время:</strong> {{ notification.time }}</p>
          </div>
          <div class="notification-actions">
            <!-- Кнопка "Ответить" -->
            <button @click="toggleReplyInput(index)" class="action-button">Ответить</button>
            <!-- Кнопка "Пожаловаться" -->
            <button @click="reportUser(index)" class="action-button">Пожаловаться</button>
            <!-- Кнопка "Заблокировать" -->
            <button @click="blockUser(index)" class="action-button block-button">
              Заблокировать
            </button>
          </div>
          <!-- Поле ввода для ответа -->
          <div v-if="notification.showReplyInput" class="reply-input">
            <textarea
              v-model="notification.replyMessage"
              placeholder="Введите ваш ответ..."
              rows="3"
            ></textarea>
            <button @click="sendReply(index)" class="send-reply-button">Отправить</button>
          </div>
        </li>
      </ul>
      <p v-else>Уведомлений нет.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      notifications: [],
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
      isMobileMenuVisible: false,
      windowWidth: window.innerWidth,
    };
  },
  methods: {
    async fetchNotifications() {
      try {
        const response = await axios.get('/api/notifications');
        this.notifications = response.data.map((notification) => ({
          ...notification,
          showReplyInput: false,
          replyMessage: '',
        }));
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error);
      }
    },
    async sendReply(index) {
      const notification = this.notifications[index];
      if (notification.replyMessage.trim()) {
        try {
          await axios.post(`/api/notifications/${notification.id}/reply`, {
            message: notification.replyMessage,
          });
          alert('Ответ отправлен.');
          notification.replyMessage = '';
          notification.showReplyInput = false;
        } catch (error) {
          console.error('Ошибка при отправке ответа:', error);
          alert('Не удалось отправить ответ.');
        }
      } else {
        alert('Введите сообщение перед отправкой.');
      }
    },
    async reportUser(index) {
      const notification = this.notifications[index];
      try {
        await axios.post(`/api/notifications/${notification.id}/report`);
        alert('Жалоба отправлена.');
      } catch (error) {
        console.error('Ошибка при отправке жалобы:', error);
        alert('Не удалось отправить жалобу.');
      }
    },
    async blockUser(index) {
      const notification = this.notifications[index];
      try {
        await axios.post(`/api/users/${notification.userId}/block`);
        this.notifications.splice(index, 1);
        alert('Пользователь заблокирован.');
      } catch (error) {
        console.error('Ошибка при блокировке пользователя:', error);
        alert('Не удалось заблокировать пользователя.');
      }
    },
    goToHome() {
      this.$router.push('/operator-panel');
    },
    goToDataUpload() {
      this.isMobileMenuVisible = false;
      this.$router.push('/operator-panel');
    },
    goToNotifications() {
      this.isMobileMenuVisible = false;
    },
    goToUsers() {
      this.isMobileMenuVisible = false;
      this.$router.push('/user-verification');
    },
    goToCars() {
      this.isMobileMenuVisible = false;
      this.$router.push('/car-verification');
    },
    toggleProfileDropdown() {
      this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
    },
    toggleMobileMenu() {
      this.isMobileMenuVisible = !this.isMobileMenuVisible;
    },
    handleOutsideClick(event) {
      const profile = this.$refs.profile;
      if (profile && !profile.contains(event.target)) {
        this.isProfileDropdownVisible = false;
      }
      
      if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.mobile-menu')) {
        this.isMobileMenuVisible = false;
      }
    },
    confirmLogout() {
      this.isLogoutConfirmVisible = true;
      this.isProfileDropdownVisible = false;
      this.isMobileMenuVisible = false;
    },
    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      this.isLogoutConfirmVisible = false;
      this.$router.push('/');
    },
    cancelLogout() {
      this.isLogoutConfirmVisible = false;
    },
    toggleReplyInput(index) {
      this.notifications[index].showReplyInput = !this.notifications[index].showReplyInput;
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth > 768) {
        this.isMobileMenuVisible = false;
      }
    }
  },
  mounted() {
    this.fetchNotifications();
    document.addEventListener("click", this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
/* Общие стили */
* {
  box-sizing: border-box;
}

/* Навигационная панель */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  cursor: pointer;
}

.logo-img {
  width: 60px;
  height: auto;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
}

.menu {
  display: flex;
  gap: 15px;
  align-items: center;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: rgba(0, 66, 129, 0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.menu-item.active {
  font-weight: bold;
  text-decoration: underline;
}

/* Профиль */
.profile {
  position: relative;
  margin-left: 15px;
}

.profile-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  min-width: 120px;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px 15px;
  width: 100%;
  text-align: left;
  color: rgba(0, 66, 129, 0.8);
  cursor: pointer;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Мобильное меню */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(0, 66, 129, 1);
  padding: 5px 10px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background-color: white;
  z-index: 999;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  flex-direction: column;
}

.mobile-menu-item {
  padding: 15px 20px;
  border: none;
  background: none;
  text-align: left;
  color: rgba(0, 66, 129, 0.8);
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.mobile-menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.mobile-menu-item.active {
  font-weight: bold;
  text-decoration: underline;
}

.logout-btn {
  color: #ff4d4d;
}

/* Модальное окно выхода */
.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 90%;
  width: 400px;
}

.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-content button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-width: 80px;
}

.modal-content button:first-child {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.modal-content button:first-child:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

.modal-content button:last-child {
  background-color: #f0f0f0;
  color: #333;
}

.modal-content button:last-child:hover {
  background-color: #e0e0e0;
}

/* Секция уведомлений */
.notifications-section {
  margin-top: 100px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.notification-item {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.notification-content p {
  margin: 5px 0;
}

.notification-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

.action-button:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

.block-button {
  background-color: #ff4d4d;
}

.block-button:hover {
  background-color: #cc0000;
}

.reply-input {
  margin-top: 10px;
}

.reply-input textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: vertical;
}

.send-reply-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-reply-button:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

/* Адаптивные стили */
@media (max-width: 992px) {
  .logo-text {
    font-size: 16px;
  }
  
  .menu-item {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .logo-text {
    font-size: 14px;
  }
  
  .notifications-section {
    padding: 15px;
  }
  
  .notification-item {
    padding: 15px;
  }
  
  .action-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  .navbar {
    padding: 10px;
  }
  
  .notifications-section {
    margin-top: 80px;
    padding: 10px;
  }
  
  .notification-content p {
    font-size: 14px;
  }
  
  .notification-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-button {
    width: 100%;
  }
  
  .modal-content {
    width: 90%;
    padding: 15px;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-content button {
    width: 100%;
  }
}
</style>