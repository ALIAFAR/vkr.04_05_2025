<template>
  <div class="login-page">
    <AppNavbar />

    <div class="login-wrapper">
      <div class="login-card">
        <h1 class="login-title">Вход в систему</h1>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="emailOrPhone" class="input-label">Логин</label>
            <input
              type="text"
              id="emailOrPhone"
              v-model="emailOrPhone"
              required
              placeholder="Email или телефон"
              :class="['form-input', { 'input-error': emailOrPhone && !isValidEmailOrPhone }]"
              @input="clearError"
            />
            <transition name="fade">
              <p v-if="emailOrPhone && !isValidEmailOrPhone" class="error-message">
                Неверный формат логина (email или телефон)
              </p>
            </transition>
          </div>

          <div class="form-group">
            <label for="password" class="input-label">Пароль</label>
            <div class="password-input-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                required
                placeholder="Введите пароль"
                :class="['form-input', { 'input-error': password && !isValidPassword }]"
                @input="clearError"
              />
              <button
                type="button"
                class="password-toggle"
                @click="toggleShowPassword"
                aria-label="Показать пароль"
              >
                <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
              </button>
            </div>
            <transition name="fade">
              <p v-if="password && !isValidPassword" class="error-message">
                Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы
              </p>
            </transition>
          </div>

          <div class="form-actions">
            <router-link to="/forgot-password" class="forgot-password-link">
              Забыли пароль?
            </router-link>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading || !isFormValid"
            :class="{ 'button-loading': isLoading }"
          >
            <span v-if="!isLoading">Войти</span>
            <span v-else class="loading-spinner"></span>
          </button>

          <transition name="fade">
            <div v-if="error" class="form-error-message">
              {{ error }}
            </div>
          </transition>
        </form>

        <div class="register-section">
          <p class="register-text">Ещё не с нами?</p>
          <router-link to="/registration" class="register-link">
            Создать аккаунт
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AppNavbar from "@/components/AppNavbar.vue";
import { notify } from "@kyvg/vue3-notification";
import Cookies from "js-cookie";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faEye, faEyeSlash);

export default {
  name: 'LoginPage',
  components: {
    AppNavbar,
    FontAwesomeIcon
  },
  data() {
    return {
      emailOrPhone: "",
      password: "",
      error: "",
      isLoading: false,
      showPassword: false,
    };
  },
  computed: {
    isValidEmailOrPhone() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\+?\d{10,15}$/;
      return emailPattern.test(this.emailOrPhone) || phonePattern.test(this.emailOrPhone);
    },
    isValidPassword() {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      return passwordPattern.test(this.password);
    },
    isFormValid() {
      return this.isValidEmailOrPhone && this.isValidPassword;
    },
  },
  methods: {
    toggleShowPassword() {
      this.showPassword = !this.showPassword;
    },
    clearError() {
      this.error = "";
    },
    async handleLogin() {
      if (!this.isFormValid) {
        this.error = "Пожалуйста, проверьте введенные данные.";
        return;
      }

      this.isLoading = true;
      this.error = "";

      try {
        const response = await axios.post("http://localhost:5000/api/user/login", {
          login: this.emailOrPhone,
          password: this.password,
        });

        Cookies.set("token", response.data.token, { expires: 12 / 24, secure: true });

        notify({
          title: "Успешный вход",
          text: "Добро пожаловать!",
          type: "success",
        });

        this.$router.push("/");
      } catch (error) {
        this.handleLoginError(error);
      } finally {
        this.isLoading = false;
      }
    },
    handleLoginError(error) {
      console.error("Ошибка входа:", error);
      
      if (error.response) {
        this.error = error.response.data.message || "Неверные учетные данные";
      } else if (error.request) {
        this.error = "Не удалось подключиться к серверу. Проверьте интернет-соединение.";
      } else {
        this.error = "Произошла ошибка. Пожалуйста, попробуйте снова.";
      }
    },
  },
  created() {
    if (Cookies.get("token")) {
      this.$router.push("/");
    }
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding: 2rem 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  margin: 1rem;
}

.login-title {
  color: #1a1a1a;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.75rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  background-color: white;
}

.input-error {
  border-color: #e53e3e;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2);
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #2d3748;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.5rem;
}

.forgot-password-link {
  color: #3182ce;
  font-size: 0.8125rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-password-link:hover {
  color: #2c5282;
  text-decoration: underline;
}

.submit-button {
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #2c5282;
}

.submit-button:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.button-loading {
  position: relative;
}

.loading-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-error-message {
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
}

.register-section {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #4a5568;
}

.register-text {
  margin-bottom: 0.5rem;
}

.register-link {
  color: #3182ce;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #2c5282;
  text-decoration: underline;
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 480px) {
  .login-card {
    padding: 1.75rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>