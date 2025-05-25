<template>
  <div :class="{'dark-theme': isDarkTheme}">
    <!-- Навигационная панель -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="UniGo Logo" class="logo-img" />
        <span class="logo-text">UniGo</span>
      </div>
      
      <!-- Бургер-меню для мобильных -->
      <div class="burger-menu" @click="toggleMobileMenu">
        <div class="burger-line" :class="{'burger-line-1': isMobileMenuOpen}"></div>
        <div class="burger-line" :class="{'burger-line-2': isMobileMenuOpen}"></div>
        <div class="burger-line" :class="{'burger-line-3': isMobileMenuOpen}"></div>
      </div>
      
      <div class="menu" :class="{'mobile-menu-active': isMobileMenuOpen}">
        <button class="menu-item" @click="navWithClose('/booking')">Бронирование</button>
        <button class="menu-item my-trips-button" @click="navWithClose({ name: 'my-trips-page' })">Мои поездки</button>
        <button class="menu-item" @click="goToPublishTrip">Опубликовать поездку</button>

        <!-- Кнопки входа и регистрации для мобильных -->
        <template v-if="!isAuthenticated && windowWidth <= 768">
          <button class="menu-item mobile-auth-btn" @click="navWithClose('/registration')">Регистрация</button>
          <button class="menu-item mobile-auth-btn" @click="navWithClose('/login')">Вход</button>
        </template>

        <!-- Кнопка переключения темы -->
        <button class="menu-item theme-toggle" @click="toggleTheme">
          <span v-if="isDarkTheme">☀️</span>
          <span v-else>🌙</span>
        </button>

        <!-- Профиль -->
        <div class="profile" ref="profile">
          <img
            src="/pngwing.com (5).png"
            class="profile-photo"
            @click="toggleProfileDropdown"
            alt="Профиль"
          />
          <div v-if="isProfileDropdownVisible" class="dropdown-menu">
            <template v-if="isAuthenticated">
              <button @click="navWithClose('/personal-information')">Профиль</button>
              <button @click="navWithClose('/chat')">Чаты</button>
              <button @click="confirmLogout">Выход</button>
            </template>
            <template v-else>
              <button @click="navWithClose('/registration')">Регистрация</button>
              <button @click="navWithClose('/login')">Вход</button>
            </template>
          </div>
        </div>
      </div>
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

    <!-- Уведомление при неавторизованном пользователе -->
    <transition name="notification">
      <div v-if="showNotification" class="notification error">
        <div class="notification-content">
          <span class="notification-icon">⚠️</span>
          <span class="notification-message">Для публикации поездки необходимо авторизоваться.</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG } from '@/config/api'

export default {
  data() {
    return {
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
      showNotification: false,
      isAuthenticated: false,
      isMobileMenuOpen: false,
      windowWidth: window.innerWidth,
      isDarkTheme: false,
    };
  },
  methods: {
    async isUserAuthenticated() {
      try {
        const token = Cookies.get("token");
        if (!token) {
          this.isAuthenticated = false;
          return false;
        }

        const response = await axios.get(API_CONFIG.BASE_URL+'/user/auth', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000
        });

        if (response.status === 200) {
          this.isAuthenticated = true;
          return true;
        }
        return false;
      } catch (error) {
        if (error.response?.status === 401) {
          Cookies.remove("token");
        }
        this.isAuthenticated = false;
        return false;
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
      this.navWithClose("/publish-trip");
    },

    navWithClose(route) {
      this.closeMobileMenu();
      this.closeDropdown();
      this.$router.push(route);
    },

    goToHome() {
      this.navWithClose("/");
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

    confirmLogout() {
      this.isLogoutConfirmVisible = true;
      this.closeDropdown();
    },

    logout() {
      Cookies.remove("token");
      this.isAuthenticated = false;
      this.isLogoutConfirmVisible = false;
      this.closeMobileMenu();
      this.$router.push("/");
    },

    cancelLogout() {
      this.isLogoutConfirmVisible = false;
    },

    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      if (this.isMobileMenuOpen) {
        this.closeDropdown();
      }
    },

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },

    handleResize() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth > 768) {
        this.closeMobileMenu();
      }
    },
    
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      // Сохраняем выбор темы в localStorage
      localStorage.setItem('darkTheme', this.isDarkTheme);
      this.applyTheme();
    },
    
    applyTheme() {
      if (this.isDarkTheme) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    },
    
    checkSavedTheme() {
      const savedTheme = localStorage.getItem('darkTheme');
      if (savedTheme !== null) {
        this.isDarkTheme = savedTheme === 'true';
      } else {
        // Проверка предпочтений системы
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme = prefersDark;
      }
      this.applyTheme();
    }
  },
  async mounted() {
    await this.isUserAuthenticated();
    document.addEventListener("click", this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize);
    this.checkSavedTheme();
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
/* Базовые стили */
body {
  font-family: 'Lora', Arial, sans-serif;
  margin: 0;
  padding-top: 60px;
  background-color: #ffffff;
  color: #333333;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Темная тема */
.dark-theme {
  background-color: #121212;
  color: #e0e0e0;
}

.dark-theme .navbar {
  background-color: #1e1e1e;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.dark-theme .logo-text {
  color: #e0e0e0;
}

.dark-theme .menu-item {
  color: #e0e0e0;
}

.dark-theme .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .dropdown-menu {
  background-color: #2d2d2d;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark-theme .dropdown-menu button {
  color: #e0e0e0;
}

.dark-theme .dropdown-menu button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.dark-theme .modal-content {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

.dark-theme .modal-content button:last-child {
  background-color: #3d3d3d;
  color: #e0e0e0;
}

.dark-theme .menu.mobile-menu-active {
  background-color: #1e1e1e;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.dark-theme .menu-item {
  border-bottom: 1px solid #3d3d3d;
}

.dark-theme .profile {
  border-top: 1px solid #3d3d3d;
}

/* Общие стили */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 90%;
  max-width: 500px;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  font-family: 'Lora', sans-serif;
  background-color: #ff4444;
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-message {
  flex-grow: 1;
  text-align: center;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  min-width: 120px;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-img {
  width: 50px;
  height: auto;
  margin-right: 10px;
}

.logo-text {
  font-size: 22px;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  white-space: nowrap;
  transition: color 0.3s ease;
}

.burger-menu {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  cursor: pointer;
  z-index: 1001;
  padding: 5px;
}

.burger-line {
  width: 100%;
  height: 3px;
  background-color: rgba(0, 66, 129, 1);
  transition: all 0.3s ease;
}

.burger-line-1 {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-line-2 {
  opacity: 0;
}

.burger-line-3 {
  transform: rotate(-45deg) translate(5px, -5px);
}

.menu {
  display: flex;
  gap: 12px;
  align-items: center;
  transition: all 0.3s ease;
  margin-right: 30px;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: rgba(0, 66, 129, 0.9);
  font-size: 15px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-family: 'Lora', sans-serif;
  font-weight: 500;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
  transform: translateY(-2px);
}

.theme-toggle {
  font-size: 18px;
  padding: 5px 10px !important;
  min-width: 40px;
  text-align: center;
}

.profile {
  position: relative;
  margin-left: 10px;
  z-index: 1003;
}

.profile-photo {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease;
  object-fit: cover;
}

.profile-photo:hover {
  transform: scale(1.1);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1004;
  display: none;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.dropdown-menu button {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  color: #333;
  font-family: 'Lora', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
  display: block;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 66, 129, 0.1);
  color: rgba(0, 66, 129, 1);
}

.profile:hover .dropdown-menu,
.profile:focus-within .dropdown-menu,
.dropdown-menu.show {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
  text-align: center;
  transition: color 0.3s ease;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-content button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
}

.modal-content button:first-child {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.modal-content button:last-child {
  background-color: #f0f0f0;
  color: #333;
}

.modal-content button:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
  .logo-text {
    font-size: 20px;
  }
  
  .menu {
    gap: 8px;
  }
  
  .menu-item {
    padding: 8px 10px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 10px 15px;
  }
  
  .burger-menu {
    display: flex;
    margin-left: auto;
  }
  
  .menu {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column;
    align-items: stretch;
    padding: 10px 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    gap: 0;
    margin-right: 0;
    z-index: 999;
    transition: all 0.3s ease, background-color 0.3s ease;
  }
  
  .menu.mobile-menu-active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  
  .menu-item {
    width: 100%;
    padding: 14px 20px;
    text-align: left;
    border-radius: 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;
  }
  
  .mobile-auth-btn {
    display: block;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .profile {
    order: 1;
    padding: 15px 20px;
    margin-left: 0;
    width: 100%;
    border-top: 1px solid #f0f0f0;
    position: static;
  }
  
  .profile-photo {
    align-self: flex-start;
    margin-bottom: 10px;
  }
  
  .mobile-menu-active .dropdown-menu {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    box-shadow: none;
    animation: none;
    margin-top: 10px;
    display: block !important;
    opacity: 1 !important;
    transform: none !important;
  }
  
  .dropdown-menu button {
    padding: 12px 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .dropdown-menu button:last-child {
    border-bottom: none;
  }
  
  .theme-toggle {
    order: -1;
    border-bottom: 1px solid #f0f0f0;
    text-align: left;
    padding: 14px 20px !important;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 10px 12px;
  }
  
  .logo-img {
    width: 42px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-content button {
    width: 100%;
  }
  
  .notification {
    top: 15px;
    padding: 10px 15px;
    font-size: 13px;
  }
  
  .profile-photo {
    width: 36px;
    height: 36px;
  }
}
</style>

<style>
/* Глобальные стили для темы */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --navbar-bg: #ffffff;
  --menu-item-color: rgba(0, 66, 129, 0.9);
  --menu-item-hover: rgba(0, 66, 129, 0.1);
  --dropdown-bg: #ffffff;
  --dropdown-text: #333333;
  --modal-bg: #ffffff;
  --modal-text: #333333;
  --border-color: #f0f0f0;
}

.dark-theme {
  --bg-color: #121212;
  --text-color: #e0e0e0;
  --navbar-bg: #1e1e1e;
  --menu-item-color: #e0e0e0;
  --menu-item-hover: rgba(255, 255, 255, 0.1);
  --dropdown-bg: #2d2d2d;
  --dropdown-text: #e0e0e0;
  --modal-bg: #2d2d2d;
  --modal-text: #e0e0e0;
  --border-color: #3d3d3d;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
</style>