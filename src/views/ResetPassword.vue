<template>
  <AppNavbar />
  <div class="reset-container">
    <div class="form-container">
      <h1>Сброс пароля</h1>
      <form @submit.prevent="handleSubmit">
        <input type="hidden" v-model="token" />
        
        <div class="input-group">
          <label for="newPassword">Новый пароль</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              required
              placeholder="Введите новый пароль"
              :class="{ 'input-error': newPassword && !isValidPassword }"
            />
            <span class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
            </span>
          </div>
          <p v-if="newPassword && !isValidPassword" class="error-text">
            Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы
          </p>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Повторите новый пароль"
            :class="{ 'input-error': confirmPassword && !passwordsMatch }"
          />
          <span class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
          </span>
          <p v-if="confirmPassword && !passwordsMatch" class="error-text">
            Пароли не совпадают
          </p>
        </div>

        <button type="submit" :disabled="isLoading || !formValid" class="btn-submit">
          {{ isLoading ? 'Сохранение...' : 'Сохранить пароль' }}
        </button>

        <div v-if="message" :class="['message', success ? 'success' : 'error']">
          {{ message }}
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
      token: "",
      newPassword: "",
      confirmPassword: "",
      isLoading: false,
      message: "",
      success: false,
      showPassword: false,
      showConfirmPassword: false
    };
  },
  computed: {
    isValidPassword() {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordPattern.test(this.newPassword);
    },
    passwordsMatch() {
      return this.newPassword === this.confirmPassword;
    },
    formValid() {
      return this.isValidPassword && this.passwordsMatch;
    }
  },
  created() {
    this.token = this.$route.query.token || "";
    if (!this.token) {
      this.message = "Недействительная ссылка для сброса пароля";
      this.success = false;
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.formValid) return;

      this.isLoading = true;
      this.message = "";

      try {
        const response = await axios.post(API_CONFIG.BASE_URL + '/auth/reset-password', {
          token: this.token,
          newPassword: this.newPassword
        });

        this.message = response.data.message || "Пароль успешно изменен";
        this.success = true;
        
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          this.$router.push('/login');
        }, 3000);
      } catch (error) {
        this.message = error.response?.data?.message || "Произошла ошибка при сбросе пароля";
        this.success = false;
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.reset-container {
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

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
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
  margin-top: 20px;
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

/* Адаптивные стили */
@media (max-width: 480px) {
  .form-container {
    padding: 20px;
    margin: 10px;
  }
}
</style>