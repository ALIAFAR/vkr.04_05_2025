<template>
  <div>
    <!-- Навигационная панель -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="UniGo Logo" class="logo-img" />
        UniGo
      </div>
      <div class="menu">
        <button class="menu-item" @click="goToBookings">Бронирование</button>
        <button @click="goToMyTrips" class="menu-item my-trips-button">Мои поездки</button>
        <button class="menu-item" @click="goToPublishTrip">Опубликовать поездку</button>

        <!-- Профиль -->
        <div class="profile" ref="profile">
          <img
            src="/pngwing.com (5).png"
            class="profile-photo"
            @click="toggleProfileDropdown"
            alt="Профиль"
          />
          <div v-if="isProfileDropdownVisible" class="dropdown-menu">
            <!-- Пункты меню для авторизованных пользователей -->
            <template v-if="isAuthenticated">
              <button @click="goToProfile">Профиль</button>
              <button @click="goToChats">Чаты</button>
              <button @click="confirmLogout">Выход</button>
            </template>
            <!-- Пункты меню для неавторизованных пользователей -->
            <template v-else>
              <button @click="goToRegister">Регистрация</button>
              <button @click="goToLogin">Вход</button>
            </template>
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

    <!-- Уведомление при неавторизованном пользователе -->
    <div v-if="showNotification" class="notification error">
      Для публикации поездки необходимо авторизоваться.
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie"; // Импортируем библиотеку для работы с кукисами

export default {
  data() {
    return {
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
      showNotification: false,
      isAuthenticated: false, // Состояние авторизации
    };
  },
  methods: {
    async isUserAuthenticated() {
      try {
        // Получаем токен из кукисов
        const token = Cookies.get("token");

        // Если токена нет, пользователь не авторизован
        if (!token) {
          this.isAuthenticated = false;
          return false;
        }

        // Отправляем запрос на сервер для проверки авторизованности
        const response = await axios.get("http://localhost:5000/api/user/auth", {
          headers: {
            Authorization: `Bearer ${token}`, // Передаем токен в заголовке
          },
        });

        console.log("Данные пользователя:", response.data);

        // Если запрос успешен, пользователь авторизован
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        // Обработка ошибок
        if (error.response?.status === 401) {
          console.error("Ошибка 401: Пользователь не авторизован");
          this.isAuthenticated = false;
          return false;
        } else {
          console.error("Другая ошибка:", error.response?.data?.message || error.message);
          this.isAuthenticated = false;
          return false;
        }
      }
    },

    async goToPublishTrip() {
      const isAuthenticated = await this.isUserAuthenticated();
      if (!isAuthenticated) {
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
          this.$router.push("/login");
        }, 3000);
        return;
      }

      this.$router.push("/publish-trip");
    },

    goToHome() {
      this.$router.push("/");
    },
    toggleProfileDropdown() {
      this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
    },
    closeDropdown() {
      this.isProfileDropdownVisible = false;
    },
    handleOutsideClick(event) {
      const profile = this.$refs.profile;
      if (profile && !profile.contains(event.target)) {
        this.closeDropdown();
      }
    },
    goToMyTrips() {
      this.$router.push({ name: "my-trips-page" });
    },
    goToBookings() {
      this.$router.push("/booking");
    },
    goToProfile() {
      this.$router.push("/personal-information");
    },
    goToChats() {
      this.$router.push("/chat");
    },
    goToLogin() {
      this.$router.push("/login");
    },
    goToRegister() {
      this.$router.push("/registration");
    },
    confirmLogout() {
      this.isLogoutConfirmVisible = true;
    },
    logout() {
      Cookies.remove("token");
      this.isAuthenticated = false; // Обновляем состояние авторизации
      this.isLogoutConfirmVisible = false;
      this.$router.push("/");
    },
    cancelLogout() {
      this.isLogoutConfirmVisible = false;
    },
  },
  async mounted() {
    // Проверяем авторизацию при монтировании компонента
    await this.isUserAuthenticated();
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>

<style scoped>
/* Стили для уведомления */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  visibility: visible;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

.notification.error {
  background-color: rgba(255, 0, 0, 0.61);
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.616);
}

body {
  font-family: Arial, sans-serif;
  background-image: url("/public/фон.jpg") no-repeat center center fixed;
  background-size: cover;
  margin: 0;
  padding-top: 80px; /* Пространство для панели */
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
  margin-right: 80px;
  font-size: 36px; /* Увеличенный размер шрифта */
  font-family: 'Poppins', sans-serif; /* Пример красивого шрифта */
  font-weight: bold; /* Сделать шрифт жирным */
  color: rgba(0, 66, 129, 1); /* Цвет шрифта */
  cursor: pointer; /* Добавить указатель курсора для логотипа */
}

/* Подключение шрифта Lora */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;700&display=swap');

.logo-img {
  width: 100px; /* Увеличьте ширину логотипа */
  height: auto; /* Сохраняет пропорции изображения */
  margin-right: 10px; /* Отступ между логотипом и текстом */
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
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Убедитесь, что z-index достаточно высок */
  visibility: visible; /* Убедитесь, что уведомление видно */
  opacity: 1; /* Убедитесь, что уведомление не скрыто */
  transition: opacity 0.3s ease-in-out; /* Плавное исчезновение */
}

.notification.error {
  background-color: rgba(255, 0, 0, 0.61);
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.616);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgba(0, 66, 129, 0.8);
  color: black;
  box-shadow: 0px 4px 6px rgba(0, 66, 129, 0.8);
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
}

.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Убедитесь, что z-index достаточно высок */
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
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
</style>
