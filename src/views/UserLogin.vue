<template>
  <div class="login-container">
    <AppNavbar />

    <!-- Основной контент -->
    <div class="form-container">
      <h1 class="form-title">Вход</h1>
      <form @submit.prevent="handleLogin" aria-label="Форма входа">
        <div class="input-group">
          <label for="emailOrPhone" class="input-label">Логин</label>
          <input
            type="text"
            id="emailOrPhone"
            v-model="emailOrPhone"
            required
            placeholder="Email или телефон"
            :class="{ 'input-error': emailOrPhone && !isValidEmailOrPhone }"
            aria-describedby="emailOrPhoneError"
          />
          <p
            v-if="emailOrPhone && !isValidEmailOrPhone"
            id="emailOrPhoneError"
            class="error-text"
          >
            Неверный формат логина (email или телефон)
          </p>
        </div>

        <div class="input-group">
          <label for="password" class="input-label">Пароль</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="Введите ваш пароль"
              :class="{ 'input-error': password && !isValidPassword }"
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
            v-if="password && !isValidPassword"
            id="passwordError"
            class="error-text"
          >
            Пароль должен содержать минимум 8 символов, включая заглавные и
            строчные буквы, цифры и специальные символы.
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="btn-login"
          :class="{ 'btn-loading': isLoading }"
        >
          {{ isLoading ? 'Загрузка...' : 'Войти' }}
        </button>

        <!-- Сообщение об ошибке -->
        <div v-if="error" class="error-message" role="alert">
          {{ error }}
        </div>
      </form>

      <!-- Ссылки -->
      <div class="links-container">
        <div class="register-link">
          <span>Еще не с нами? </span>
          <router-link to="/registration" class="link-text"
            >Зарегистрироваться</router-link
          >
        </div>
        <div class="forgot-password-link">
          <router-link to="/forgot-password" class="link-text"
            >Забыли пароль?</router-link
          >
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
import { API_CONFIG } from "@/config/api";

export default {
  components: {
    AppNavbar,
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
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const phonePattern = /^\+?\d{10,15}$/;
      return (
        emailPattern.test(this.emailOrPhone) ||
        phonePattern.test(this.emailOrPhone)
      );
    },
    isValidPassword() {
      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordPattern.test(this.password);
    },
    isFormValid() {
      return this.isValidEmailOrPhone && this.isValidPassword;
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
      if (!this.isFormValid) {
        this.error = "Пожалуйста, проверьте введенные данные.";
        return;
      }

      this.isLoading = true;
      this.error = "";

      try {
        const response = await axios.post(API_CONFIG.BASE_URL + "/user/login", {
          login: this.emailOrPhone,
          password: this.password,
        });

        Cookies.set("token", response.data.token, { expires: 12 / 24 });

        notify({
          title: "Успех",
          text: "Вы успешно вошли в систему!",
          type: "success",
        });

        this.$router.push("/");
      } catch (error) {
        console.error("Ошибка при входе:", error);

        if (error.response) {
          this.error =
            error.response.data.message || "Неверная почта, номер или пароль";
        } else if (error.request) {
          this.error =
            "Ошибка сети. Пожалуйста, проверьте подключение к интернету.";
        } else {
          this.error = "Произошла ошибка. Пожалуйста, попробуйте еще раз.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
  created() {
    if (Cookies.get("authToken")) {
      this.$router.push("/");
    }
  },
};
</script>

<style scoped>
/* Modern and clean design with improved UX */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
}

/* Main container */
.login-container {
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

/* Login button */
.btn-login {
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

.btn-login:hover:not(:disabled) {
  background: linear-gradient(90deg, #2b6cb0 0%, #2c5282 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-login:disabled {
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

.register-link,
.forgot-password-link {
  margin: 12px 0;
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
  .login-container {
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
  .btn-login {
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

  .btn-login {
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
  .btn-login {
    font-size: 13px;
  }
}
</style>