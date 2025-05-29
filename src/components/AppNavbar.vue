<template>
  <div :class="{'dark-theme': isDarkTheme}">
    <!-- Навигационная панель -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="UniGo Logo" class="logo-img" />
        <span class="logo-text">UniGo</span>
      </div>
      
      <!-- Бургер-меню для мобильных -->
      <div class="burger-menu" @click="toggleMobileMenu" :aria-expanded="isMobileMenuOpen">
        <div class="burger-line" :class="{'burger-line-1': isMobileMenuOpen}"></div>
        <div class="burger-line" :class="{'burger-line-2': isMobileMenuOpen}"></div>
        <div class="burger-line" :class="{'burger-line-3': isMobileMenuOpen}"></div>
      </div>
      
      <div class="menu" :class="{'mobile-menu-active': isMobileMenuOpen}">
        <button class="menu-item" @click="navWithClose('/booking')">
          <span class="menu-text">Бронирование</span>
        </button>
        <button class="menu-item my-trips-button" @click="navWithClose({ name: 'my-trips-page' })">
          <span class="menu-text">Мои поездки</span>
        </button>
        <button class="menu-item" @click="goToPublishTrip">
          <span class="menu-text">Опубликовать</span>
        </button>

        <!-- Кнопки входа и регистрации для мобильных -->
        <template v-if="!isAuthenticated && windowWidth <= 768">
          <button class="menu-item mobile-auth-btn" @click="navWithClose('/registration')">
            <span class="menu-text">Регистрация</span>
          </button>
          <button class="menu-item mobile-auth-btn" @click="navWithClose('/login')">
            <span class="menu-text">Вход</span>
          </button>
        </template>

        <!-- Кнопка переключения темы -->
        <button class="menu-item theme-toggle" @click="toggleTheme" aria-label="Переключить тему">
          <span v-if="isDarkTheme" class="theme-icon">☀️</span>
          <span v-else class="theme-icon">🌙</span>
          <span class="theme-text">{{ isDarkTheme  }}</span>
        </button>

        <!-- Профиль -->
        <div class="profile" ref="profile">
          <div class="profile-container" @click="toggleProfileDropdown">
            <img
              src="/pngwing.com (5).png"
              class="profile-photo"
              alt="Профиль"
            />
            <span v-if="windowWidth > 768" class="profile-name">
              {{ isAuthenticated ? 'Мой профиль' : 'Войти' }}
            </span>
          </div>
          <div v-if="isProfileDropdownVisible" class="dropdown-menu">
            <template v-if="isAuthenticated">
              <button @click="navWithClose('/personal-information')">
                Профиль
              </button>
              <button @click="navWithClose('/chat')">
                Чаты
              </button>
              <button @click="confirmLogout">
                Выход
              </button>
            </template>
            <template v-else>
              <button @click="navWithClose('/registration')">
                Регистрация
              </button>
              <button @click="navWithClose('/login')">
                Вход
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для подтверждения выхода -->
    <transition name="fade">
      <div v-if="isLogoutConfirmVisible" class="logout-modal" @click.self="cancelLogout">
        <div class="modal-content">
          <p>Вы уверены, что хотите выйти из профиля?</p>
          <div class="modal-buttons">
            <button @click="logout" class="confirm-btn">Да, выйти</button>
            <button @click="cancelLogout" class="cancel-btn">Отмена</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Уведомление при неавторизованном пользователе -->
    <transition name="slide-down">
      <div v-if="showNotification" class="notification">
        <div class="notification-content">
          <span class="notification-icon">⚠️</span>
          <span class="notification-message">Для публикации поездки необходимо авторизоваться.</span>
          <button @click="showNotification = false" class="notification-close" aria-label="Закрыть">
            &times;
          </button>
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
  created() {
    this.checkSavedTheme();
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

        this.isAuthenticated = response.status === 200;
        return this.isAuthenticated;
      } catch (error) {
        if (error.response?.status === 401) {
          Cookies.remove("token");
        }
        this.isAuthenticated = false;
        return false;
      }
    },

    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      localStorage.setItem('darkTheme', this.isDarkTheme);
      this.applyTheme();
    },
    
    applyTheme() {
      document.documentElement.classList.toggle('dark-theme', this.isDarkTheme);
    },
    
    checkSavedTheme() {
      // Проверяем сохраненную тему в localStorage
      const savedTheme = localStorage.getItem('darkTheme');
      
      // Если тема сохранена - используем ее
      if (savedTheme !== null) {
        this.isDarkTheme = savedTheme === 'true';
      } 
      // Иначе проверяем системные настройки
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.isDarkTheme = true;
      }
      
      this.applyTheme();
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
      if (!this.$refs.profile?.contains(event.target)) {
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
      // Блокируем скролл при открытом меню
      document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
      if (this.isMobileMenuOpen) {
        this.closeDropdown();
      }
    },

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    },

    handleResize() {
      this.windowWidth = window.innerWidth;
      // Закрываем мобильное меню при увеличении экрана
      if (this.windowWidth > 768) {
        this.closeMobileMenu();
      }
    },
  },
  async mounted() {
    await this.isUserAuthenticated();
    document.addEventListener("click", this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
    // Убедимся, что скролл разблокирован
    document.body.style.overflow = '';
  },
};
</script>

<style scoped>
/* Базовые стили */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: var(--navbar-bg);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
  object-fit: contain;
}

.logo-text {
  font-size: 22px;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: var(--primary-color);
  white-space: nowrap;
  transition: color 0.3s ease;
}

/* Бургер-меню */
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
  background-color: var(--primary-color);
  transition: all 0.3s ease;
  transform-origin: left center;
}

.burger-line-1 {
  transform: rotate(45deg) translate(1px, -1px);
}

.burger-line-2 {
  opacity: 0;
}

.burger-line-3 {
  transform: rotate(-45deg) translate(1px, 1px);
}

/* Основное меню */
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
  color: var(--menu-item-color);
  font-size: 15px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 5px;
  transition: all 0.3s ease;
  font-family: 'Lora', sans-serif;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-item:hover {
  background-color: var(--menu-item-hover);
  transform: translateY(-2px);
}

.menu-icon {
  font-size: 18px;
  display: inline-block;
}

.menu-text {
  display: inline-block;
}

.theme-toggle {
  font-size: 18px;
  padding: 8px 12px !important;
  min-width: auto;
  text-align: center;
}

.theme-icon {
  display: inline-block;
  margin-right: 6px;
}

.theme-text {
  display: inline-block;
}

/* Профиль */
.profile {
  position: relative;
  margin-left: 10px;
  z-index: 1003;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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

.profile-name {
  font-size: 14px;
  color: var(--text-color);
  white-space: nowrap;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--dropdown-bg);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1004;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  border: 1px solid var(--border-color);
}

.dropdown-menu button {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  color: var(--dropdown-text);
  font-family: 'Lora', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-menu button:hover {
  background-color: var(--menu-item-hover);
  color: var(--primary-color);
}

.dropdown-icon {
  font-size: 16px;
  display: inline-block;
  width: 20px;
}

.profile:hover .dropdown-menu,
.profile:focus-within .dropdown-menu,
.dropdown-menu.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

/* Модальное окно выхода */
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
  background-color: var(--modal-bg);
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
  color: var(--modal-text);
  text-align: center;
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

.confirm-btn {
  background-color: var(--primary-color);
  color: white;
}

.cancel-btn {
  background-color: var(--secondary-bg);
  color: var(--text-color);
}

.modal-content button:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

/* Уведомление */
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
  background-color: var(--error-color);
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

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* Мобильные стили */
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
    height: calc(100vh - 60px);
    background-color: var(--navbar-bg);
    flex-direction: column;
    align-items: stretch;
    padding: 15px 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    gap: 0;
    margin-right: 0;
    z-index: 999;
    overflow-y: auto;
  }
  
  .menu.mobile-menu-active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  
  .menu-item {
    width: 100%;
    padding: 16px 20px;
    text-align: left;
    border-radius: 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 16px;
    justify-content: flex-start;
  }
  
  .mobile-auth-btn {
    display: flex;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .profile {
    order: 1;
    padding: 15px 20px;
    margin-left: 0;
    width: 100%;
    border-top: 1px solid var(--border-color);
    position: static;
  }
  
  .profile-container {
    justify-content: flex-start;
  }
  
  .profile-photo {
    width: 36px;
    height: 36px;
  }
  
  .dropdown-menu {
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
    border: none;
    background-color: transparent;
  }
  
  .dropdown-menu button {
    padding: 14px 20px 14px 40px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--dropdown-bg);
  }
  
  .dropdown-menu button:last-child {
    border-bottom: none;
  }
  
  .theme-toggle {
    order: -1;
    border-bottom: 1px solid var(--border-color);
    text-align: left;
    padding: 16px 20px !important;
    font-size: 16px;
    justify-content: flex-start;
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
    padding: 12px 15px;
    font-size: 14px;
  }
  
  .profile-photo {
    width: 34px;
    height: 34px;
  }
}
</style>

<style>
/* Глобальные CSS переменные для темы */
:root {
  --primary-color: rgba(0, 66, 129, 1);
  --secondary-bg: #f0f0f0;
  --bg-color: #ffffff;
  --navbar-bg: #ffffff;
  --text-color: #333333;
  --menu-item-color: rgba(0, 66, 129, 0.9);
  --menu-item-hover: rgba(0, 66, 129, 0.1);
  --dropdown-bg: #ffffff;
  --dropdown-text: #333333;
  --modal-bg: #ffffff;
  --modal-text: #333333;
  --border-color: #f0f0f0;
  --error-color: #ff4444;
}

.dark-theme {
  --primary-color: #4a9cff;
  --secondary-bg: #3d3d3d;
  --bg-color: #121212;
  --navbar-bg: #1e1e1e;
  --text-color: #e0e0e0;
  --menu-item-color: #e0e0e0;
  --menu-item-hover: rgba(255, 255, 255, 0.1);
  --dropdown-bg: #2d2d2d;
  --dropdown-text: #e0e0e0;
  --modal-bg: #2d2d2d;
  --modal-text: #e0e0e0;
  --border-color: #3d3d3d;
  --error-color: #ff6b6b;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>