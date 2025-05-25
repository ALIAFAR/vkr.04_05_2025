<template>
  <AppNavbar />
  <div class="forgot-container">
    <div class="form-container">
      <h1>Восстановление пароля</h1>
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Введите ваш email"
            :class="{ 'input-error': email && !isValidEmail }"
          />
          <p v-if="email && !isValidEmail" class="error-text">
            Неверный формат email
          </p>
        </div>

        <button type="submit" :disabled="isLoading" class="btn-submit">
          {{ isLoading ? 'Отправка...' : 'Отправить ссылку' }}
        </button>

        <div v-if="message" :class="['message', success ? 'success' : 'error']">
          {{ message }}
        </div>

        <div class="back-to-login">
          <router-link to="/login">Вернуться к входу</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import { API_CONFIG } from '@/config/api'

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      email: "",
      isLoading: false,
      message: "",
      success: false
    };
  },
  computed: {
    isValidEmail() {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(this.email);
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isValidEmail) {
        this.message = "Пожалуйста, введите корректный email";
        this.success = false;
        return;
      }

      this.isLoading = true;
      this.message = "";

      try {
        const response = await axios.post(API_CONFIG.BASE_URL + '/auth/request-password-reset', {
          email: this.email
        });

        this.message = response.data.message || "Ссылка для сброса пароля отправлена на ваш email";
        this.success = true;
      } catch (error) {
        this.message = error.response?.data?.message || "Произошла ошибка при отправке запроса";
        this.success = false;
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.forgot-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: rgba(244, 244, 249, 0.8);
}

.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  padding: 30px;
  margin: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.btn-submit {
  background-color: #004281;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-submit:hover {
  background-color: #003366;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.back-to-login {
  margin-top: 20px;
  text-align: center;
}

.back-to-login a {
  color: #004281;
  text-decoration: none;
}

.back-to-login a:hover {
  text-decoration: underline;
}

/* Адаптивные стили */
@media (max-width: 480px) {
  .form-container {
    padding: 20px;
    margin: 10px;
  }
}
</style>
<style scoped>
/* Базовые стили */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  background: url("/public/фон.jpg") no-repeat center center fixed;
  background-size: cover;
  font-family: Arial, sans-serif;
}

/* Главный контейнер */
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: auto;
  background-color: rgba(244, 244, 249, 0.8);
  width: 90%;
  max-width: 420px;
  margin: 80px auto 20px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
}

/* Форма */
.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 350px;
  padding: 20px;
  box-sizing: border-box;
}

/* Навбар */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 35px;
  margin-right: 8px;
}

/* Кнопка "Назад" */
.back-button {
  background-color: #fff;
  color: #004281;
  border: 1px solid #004281;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #004281;
  color: #fff;
}

/* Элементы формы */
.input-group {
  margin-bottom: 15px;
  width: 100%;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  box-sizing: border-box;
}

input:focus {
  border-color: rgba(255, 174, 0, 0.615);
  outline: none;
  background-color: #fff;
}

/* Кнопка входа */
.btn-login {
  background-color: #004281;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  margin-top: 5px;
}

.btn-login:hover {
  background-color: #003365;
}

/* Сообщения об ошибках */
.error-text {
  font-size: 12px;
  color: red;
  margin-top: 4px;
  display: block;
}

.error-message {
  color: red;
  margin: 10px 0;
  text-align: center;
  font-size: 13px;
}

.loading-message {
  color: #666;
  margin: 10px 0;
  text-align: center;
  font-size: 13px;
}

.input-error {
  border-color: red !important;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  max-width: 90%;
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.8);
}

.notification.error {
  background-color: rgba(255, 174, 0, 0.8);
}

/* Адаптивность */
@media (max-width: 768px) {
  .login-container {
    margin-top: 70px;
    width: 85%;
    padding: 15px;
  }
  
  .navbar {
    padding: 8px 12px;
  }
  
  .logo-img {
    height: 30px;
  }
  
  .back-button {
    padding: 5px 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .login-container {
    margin-top: 60px;
    width: 90%;
    padding: 15px;
    border-radius: 6px;
  }
  
  .form-container {
    padding: 15px;
    box-shadow: none;
  }
  
  input {
    padding: 10px;
    font-size: 15px;
  }
  
  .btn-login {
    padding: 12px;
  }
}
  .navbar {
    flex-wrap: wrap;
    padding: 8px 10px;
  }
  
  .logo {
    margin-bottom: 5px;
  }
  
  .back-button {
    width: 100%;
    margin-top: 5px;
    text-align: center;
  }
  
  .form-container {
    padding: 22px;
  }
  
  input, .btn-login {
    font-size: 14px;
  }

/* Элементы формы */
.input-group {
  margin-bottom: 15px;
  width: 100%;
}

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
  z-index: 2; /* Добавлено для уверенности, что иконка будет поверх поля ввода */
}

.toggle-password:hover {
  color: #333;
}


.forgot-password-link {
  margin-top: 15px;
  text-align: center;
}

.forgot-password-link a {
  color: #004281;
  text-decoration: none;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}


@media (max-width: 360px) {
  .login-container {
    margin-top: 60px;
    width: 95%;
    padding: 20px;
  }
  
  .navbar {
    flex-wrap: wrap;
    padding: 8px 10px;
  }
  
  .logo {
    margin-bottom: 5px;
  }
  
  .back-button {
    width: 100%;
    margin-top: 5px;
    text-align: center;
  }
  
  .form-container {
    padding: 22px;
  }
  
  input, .btn-login {
    font-size: 14px;
  }
}
</style>