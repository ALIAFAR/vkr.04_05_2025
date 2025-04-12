<template>
  <div>
    <!-- Навигационная панель для оператора -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="Operator Logo" class="logo-img" />
        UniGo Панель оператора
      </div>
      <div class="menu">
        <button class="menu-item" @click="goToDataUpload">Загрузка данных</button>
        <button class="menu-item active">Уведомления</button>
        <button class="menu-item" @click="goToUsers">Пользователи</button>
        <button class="menu-item" @click="goToCars">Автомобили</button>

        <!-- Выход -->
        <div class="profile">
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
    </div>

    <!-- Модальное окно для подтверждения выхода -->
    <div v-if="isLogoutConfirmVisible" class="logout-modal">
      <div class="modal-content">
        <p>Вы уверены, что хотите выйти из профиля?</p>
        <button @click="logout">Да</button>
        <button @click="cancelLogout">Нет</button>
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
      notifications: [], // Уведомления будут загружаться с сервера
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
    };
  },
  methods: {
    // Загрузка уведомлений с сервера
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
        //alert('Не удалось загрузить уведомления.');
      }
    },
    // Отправка ответа на уведомление
    async sendReply(index) {
      const notification = this.notifications[index];
      if (notification.replyMessage.trim()) {
        try {
          await axios.post(`/api/notifications/${notification.id}/reply`, {
            message: notification.replyMessage,
          });
          alert('Ответ отправлен.');
          notification.replyMessage = ''; // Очищаем поле ввода
          notification.showReplyInput = false; // Скрываем поле ввода
        } catch (error) {
          console.error('Ошибка при отправке ответа:', error);
          alert('Не удалось отправить ответ.');
        }
      } else {
        alert('Введите сообщение перед отправкой.');
      }
    },
    // Отправка жалобы на пользователя
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
    // Блокировка пользователя
    async blockUser(index) {
      const notification = this.notifications[index];
      try {
        await axios.post(`/api/users/${notification.userId}/block`);
        this.notifications.splice(index, 1); // Удаляем уведомление
        alert('Пользователь заблокирован.');
      } catch (error) {
        console.error('Ошибка при блокировке пользователя:', error);
        alert('Не удалось заблокировать пользователя.');
      }
    },
    // Навигация
    goToHome() {
      this.$router.push('/operator-panel');
    },
    goToDataUpload() {
      this.$router.push('/operator-panel');
    },
    goToNotifications() {
      this.$router.push('/notifications');
    },
    goToUsers() {
      this.$router.push('/user-verification');
    },
    goToCars() {
      this.$router.push('/car-verification');
    },
    toggleProfileDropdown() {
      this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
    },
    confirmLogout() {
      this.isLogoutConfirmVisible = true;
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
  },
  mounted() {
    this.fetchNotifications(); // Загружаем уведомления при монтировании компонента
  },
};
</script>

<style scoped>
/* Стили для навигационной панели */
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
  margin-right: 80px;
  font-size: 36px;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  cursor: pointer;
}

.logo-img {
  width: 100px;
  height: auto;
  margin-right: 10px;
}

.menu {
  display: flex;
  gap: 20px;
  margin-right: 40px;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: rgba(0, 66, 129, 0.8);
  font-size: 16px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.menu-item.active {
  font-weight: bold;
  text-decoration: underline;
}

/* Стили для профиля */
.profile {
  position: relative;
  margin-left: auto;
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
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Стили для модального окна */
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
  z-index: 1001;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content button {
  margin: 10px;
  padding: 10px 20px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-content button:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

/* Стили для секции уведомлений */
.notifications-section {
  margin-top: 100px;
  padding: 20px;
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
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  transition: background-color 0.3s ease;
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

/* Стили для поля ввода ответа */
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
</style>