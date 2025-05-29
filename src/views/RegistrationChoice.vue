<template>
  <div class="registration-container">
    <AppNavbar />

    <!-- Основной контент -->
    <div class="form-container">
      <h1 class="form-title">Регистрация</h1>
      <form @submit.prevent="handleLogin" aria-label="Форма регистрации">
        <div class="input-group">
          <label for="email" class="input-label">Почта</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Введите ваш e-mail"
            :class="{ 'input-error': email && !isValidEmail }"
            aria-describedby="emailError"
          />
          <p v-if="email && !isValidEmail" id="emailError" class="error-text">
            Неверный формат e-mail
          </p>
        </div>

        <div class="input-group">
          <label for="temporaryPassword" class="input-label">Временный пароль</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="temporaryPassword"
              v-model="temporaryPassword"
              required
              placeholder="Введите временный пароль"
              :class="{ 'input-error': temporaryPassword && !isValidPassword }"
              ref="passwordInput"
              aria-describedby="passwordError"
            />
            <span
              class="toggle-password"
              @click="togglePasswordVisibility"
              role="button"
              aria-label="Переключить видимость пароля"
            >
              <i :class="showPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
            </span>
          </div>
          <p
            v-if="temporaryPassword && !isValidPassword"
            id="passwordError"
            class="error-text"
          >
            Пароль должен содержать минимум 8 символов, включая заглавные и
            строчные буквы, цифры и специальные символы (!@#$%^&*).
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading || isSubmitting"
          class="btn-submit"
          :class="{ 'btn-loading': isLoading }"
        >
          {{ isLoading ? 'Загрузка...' : 'Продолжить' }}
        </button>

        <div v-if="error" class="error-message" role="alert">
          {{ error }}
        </div>
      </form>

      <div class="links-container">
        <div class="login-link">
          <span>Уже с нами? </span>
          <router-link to="/login" class="link-text">Войти</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from "js-cookie";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      email: "",
      temporaryPassword: "",
      error: "",
      isLoading: false,
      isSubmitting: false,
      showPassword: false,
    };
  },
  computed: {
    isValidEmail() {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(this.email);
    },
    isValidPassword() {
      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordPattern.test(this.temporaryPassword);
    },
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      const input = this.$refs.passwordInput;
      if (input) {
        input.type = this.showPassword ? "text" : "password";
      }
    },
    async handleLogin() {
      if (this.isSubmitting) return;

      if (!this.isValidEmail) {
        this.error = "Неверный формат e-mail";
        return;
      }

      if (!this.isValidPassword) {
        this.error =
          "Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (!@#$%^&*).";
        return;
      }

      this.isLoading = true;
      this.isSubmitting = true;
      this.error = "";

      try {
        Cookies.set("email", this.email, { expires: 1 / 144 });
        Cookies.set("temporaryPassword", this.temporaryPassword, { expires: 1 / 144 });

        const userId = await this.checkTemporaryPassword(this.temporaryPassword);

        if (userId) {
          Cookies.set("user_id", userId, { expires: 1 / 144 });
          console.log("User ID сохранен в cookies:", userId);
          this.$router.push("/set-password");
        } else {
          this.error = "Временный пароль неверный или пользователь не найден";
        }
      } catch (error) {
        console.error("Ошибка при обработке данных:", error);
        this.error = "Ошибка при обработке данных";
      } finally {
        this.isLoading = false;
        this.isSubmitting = false;
      }
    },
    async checkTemporaryPassword(password) {
      try {
        const response = await axios.get(API_CONFIG.BASE_URL + "/user/password_check", {
          params: {
            password: password,
          },
        });

        if (response.data && response.data.user_id) {
          return response.data.user_id;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Ошибка при проверке временного пароля:", error);
        throw error;
      }
    },
  },
};
</script>

<style scoped>
/* Modern and clean design */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
}

/* Main container */
.registration-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* Form container */
.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 32px;
  box-sizing: border-box;
  animation: fadeIn 0.5s ease-out;
}

/* Form title */
.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  text-align: center;
  margin-bottom: 24px;
}

/* Input group */
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f7fafc;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  background: white;
}

.input-error {
  border-color: #e53e3e !important;
}

/* Password input container */
.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #718096;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #2d3748;
}

/* Error text */
.error-text {
  font-size: 12px;
  color: #e53e3e;
  margin-top: 6px;
  line-height: 1.4;
}

/* Error message */
.error-message {
  color: #e53e3e;
  font-size: 14px;
  text-align: center;
  margin: 16px 0;
}

/* Submit button */
.btn-submit {
  background: linear-gradient(90deg, #3182ce 0%, #2b6cb0 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(90deg, #2b6cb0 0%, #2c5282 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-submit:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.btn-loading {
  opacity: 0.7;
  cursor: progress;
}

/* Links container */
.links-container {
  margin-top: 20px;
  text-align: center;
}

.login-link {
  font-size: 14px;
  color: #4a5568;
}

.link-text {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link-text:hover {
  color: #2b6cb0;
  text-decoration: underline;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .registration-container {
    padding: 15px;
  }

  .form-container {
    padding: 24px;
    max-width: 360px;
  }

  .form-title {
    font-size: 22px;
  }

  input,
  .btn-submit {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 20px;
    box-shadow: none;
    border-radius: 10px;
  }

  .form-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  input {
    padding: 10px 14px;
    font-size: 14px;
  }

  .btn-submit {
    padding: 10px;
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .form-container {
    padding: 16px;
  }

  .form-title {
    font-size: 18px;
  }

  input,
  .btn-submit {
    font-size: 13px;
  }
}
</style>