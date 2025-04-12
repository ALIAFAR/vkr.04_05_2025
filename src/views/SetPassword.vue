<template>
  <AppNavbar />
  <div class="login-container">
    <div class="form-container">
      <h1>Создание постоянного пароля</h1>
      <form @submit.prevent="handleSetPassword">
        <div class="input-group">
          <label for="newPassword">Новый пароль</label>
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            required
            placeholder="Введите новый пароль"
            :class="{ 'input-error': newPassword && !isValidNewPassword }"
          />
          <p v-if="newPassword && !isValidNewPassword" class="error-text">
            Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (!@#$%^&*).
          </p>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Подтвердите пароль"
            :class="{ 'input-error': confirmPassword && !isValidConfirmPassword }"
          />
          <p v-if="confirmPassword && !isValidConfirmPassword" class="error-text">
            Пароли не совпадают
          </p>
        </div>

        <button type="submit" :disabled="isLoading || isSubmitting" class="btn-login">
          {{ isLoading ? 'Загрузка...' : 'Сохранить пароль' }}
        </button>

        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from "js-cookie"; // Импортируем библиотеку для работы с кукисами

export default {
  components: {
    AppNavbar,
  },
  
  data() {
    return {
      newPassword: "",
      confirmPassword: "",
      error: "",
      isLoading: false,
      isSubmitting: false,
    };
  },
  computed: {
    isValidNewPassword() {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordPattern.test(this.newPassword);
    },
    isValidConfirmPassword() {
      return this.newPassword === this.confirmPassword;
    },
  },
  methods: {
    async handleSetPassword() {
      if (this.isSubmitting) return;

      if (!this.isValidNewPassword) {
        this.error = "Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (!@#$%^&*).";
        return;
      }

      if (!this.isValidConfirmPassword) {
        this.error = "Пароли не совпадают";
        return;
      }

      this.isLoading = true;
      this.isSubmitting = true;
      this.error = "";

      try {
        // Сохраняем пароль в куки
        Cookies.set("newPassword", this.newPassword, { expires: 1 }); // Куки будет храниться 1 день

        /*this.$notify({
          title: 'Успех',
          message: 'Пароль успешно изменен!',
          type: 'success'
        });*/

        // Перенаправляем на страницу ввода данных
        this.$router.push("/user-details");
      } catch (error) {
        this.error = "Ошибка при сохранении пароля";
      } finally {
        this.isLoading = false;
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  background: url("/public/фон.jpg") no-repeat center center fixed;
  background-size: cover;
  font-family: Arial, sans-serif;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Центрирование по вертикали */
  align-items: center; /* Центрирование по горизонтали */
  height: 100%; /* Растягиваем контейнер на всю высоту экрана */
  background-color: rgba(244, 244, 249, 0.8); /* Прозрачный фон */
  max-width: 500px;
  margin: 120px auto 0 auto; /* Добавляем отступ сверху */
}

.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin-top: 30px;
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
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.616);
}

.notification.error {
  background-color: rgba(255, 174, 0, 0.615);
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between; /* Добавляет пространство между элементами */
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px; /* Размер логотипа */
  margin-right: 10px; /* Отступ справа от логотипа */
}

.back-button {
  background-color: #fff;
  color: #004281;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  left: 1400px; /* Устанавливает точное расстояние от левого края */
}

.back-button:hover {
  background-color: #004281;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 85, 165, 0.2);
}

.separator {
  flex-grow: 1;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 20px;
}

.menu {
  display: flex;
  gap: 10px;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.register-link {
  margin-top: 15px;
  text-align: center;
}

.register-text {
  color: #004281;
  text-decoration: none;
}

.register-text:hover {
  text-decoration: underline;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border 0.3s ease;
}

input:focus {
  border-color: rgba(255, 174, 0, 0.615);
  outline: none;
}

.error-text {
  font-size: 12px;
  color: red;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.loading-message {
  color: #666;
  margin-top: 10px;
}

.btn-login {
  background-color: #004281;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.btn-login:hover {
  background-color: #003365;
}

.input-error {
  border-color: red !important;
}
</style>
