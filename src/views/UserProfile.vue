<template>
  <div class="profile-container">
    <!-- Картинка профиля или аватар -->
    <img
      src="https://via.placeholder.com/50"
      alt="Profile"
      @click="toggleDropdown"
      class="profile-avatar"
    />

    <!-- Выпадающее меню профиля -->
    <div v-if="dropdownVisible" class="profile-dropdown">
      <ul>
        <li v-if="isAuthenticated">
          <router-link to="/profile" @click="closeDropdown"
            >Мой профиль</router-link
          >
        </li>
        <li v-if="!isAuthenticated">
          <router-link to="/login" @click="closeDropdown">Войти</router-link>
        </li>
        <li v-if="!isAuthenticated">
          <router-link to="/registration" @click="closeDropdown"
            >Регистрация</router-link
          >
        </li>
        <li v-if="isAuthenticated" @click="logout">Выйти</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dropdownVisible: false, // Состояние видимости меню
      isAuthenticated: false, // Проверка аутентификации
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible; // Переключить видимость меню
    },
    closeDropdown() {
      this.dropdownVisible = false; // Закрыть меню при выборе
    },
    logout() {
      localStorage.removeItem("authToken");
      this.isAuthenticated = false;
      this.$router.push("/login");
    },
    checkAuthStatus() {
      this.isAuthenticated = !!localStorage.getItem("authToken");
    },
  },
  mounted() {
    // Убедитесь, что проверка статуса аутентификации происходит при монтировании компонента
    this.isAuthenticated = !!localStorage.getItem("authToken");
    window.addEventListener("storage", this.checkAuthStatus);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.checkAuthStatus);
  },
};
</script>

<style scoped>
.profile-container {
  position: relative;
}

.profile-avatar {
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.profile-dropdown {
  position: absolute;
  top: 60px;
  right: 0;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  width: 150px;
  padding: 10px 0;
  display: block; /* Добавлено для отладки */
}

.profile-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.profile-dropdown li {
  padding: 10px;
  text-align: center;
}

.profile-dropdown li:hover {
  background-color: #f1f1f1;
}
</style>
