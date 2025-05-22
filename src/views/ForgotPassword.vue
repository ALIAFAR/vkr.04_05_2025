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