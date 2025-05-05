<template>
  <div class="login-container">
    <AppNavbar />

    <!-- Основной контент -->
    <div class="form-container">
      <h1>Вход</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="emailOrPhone">Логин</label>
          <input
            type="text"
            id="emailOrPhone"
            v-model="emailOrPhone"
            required
            placeholder="Введите ваш логин"
            :class="{ 'input-error': emailOrPhone && !isValidEmailOrPhone }"
          />
          <p v-if="emailOrPhone && !isValidEmailOrPhone" class="error-text">
            Неверный формат логина (email или телефон)
          </p>
        </div>

        <div class="input-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Введите ваш пароль"
            :class="{ 'input-error': password && !isValidPassword }"
          />
          <p v-if="password && !isValidPassword" class="error-text">
            Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы.
          </p>
        </div>

        <button type="submit" :disabled="isLoading || !isFormValid" class="btn-login">
          {{ isLoading ? 'Загрузка...' : 'Войти' }}
        </button>

        <!-- Сообщение об ошибке -->
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>

      <!-- Ссылка на регистрацию -->
      <div class="register-link">
        <span>Еще не с нами? </span>
        <router-link to="/registration" class="register-text"
          >Зарегистрироваться</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AppNavbar from "@/components/AppNavbar.vue";
import { notify } from "@kyvg/vue3-notification"; // Библиотека для уведомлений
import Cookies from "js-cookie"; // Импорт библиотеки для работы с cookies

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      emailOrPhone: "",
      password: "",
      error: "", // Для отображения ошибок
      isLoading: false, // Для отслеживания состояния загрузки
    };
  },
  computed: {
    // Проверка на корректный формат email или телефона
    isValidEmailOrPhone() {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const phonePattern = /^\+?\d{10,15}$/; // Подходит для телефонных номеров в международном формате
      return (
        emailPattern.test(this.emailOrPhone) ||
        phonePattern.test(this.emailOrPhone)
      );
    },
    // Проверка на корректный формат пароля
    isValidPassword() {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordPattern.test(this.password);
    },
    // Проверка валидности всей формы
    isFormValid() {
      return this.isValidEmailOrPhone && this.isValidPassword;
    },
  },
  methods: {
    async handleLogin() {
      if (!this.isFormValid) {
        this.error = "Пожалуйста, проверьте введенные данные.";
        return;
      }

      this.isLoading = true;
      this.error = "";

      try {
        const response = await axios.post("https://unigo.onrender.com/api/user/login",
          {
            login: this.emailOrPhone,
            password: this.password,
          }
        );

        // Сохраняем токен в cookies
        Cookies.set("token", response.data.token, { expires: 12 / 24 }); // Токен сохраняется на 7 дней

        // Уведомление об успешной авторизации
        notify({
          title: "Успех",
          text: "Вы успешно вошли в систему!",
          type: "success",
        });

        // Переход на главную страницу после успешного входа
        this.$router.push("/");
      } catch (error) {
        console.error("Ошибка при входе:", error);

        if (error.response) {
          // Ошибка от сервера
          this.error =
            error.response.data.message || "Неверная почта, номер или пароль";
        } else if (error.request) {
          // Ошибка сети (нет ответа от сервера)
          this.error = "Ошибка сети. Пожалуйста, проверьте подключение к интернету.";
        } else {
          // Другие ошибки
          this.error = "Произошла ошибка. Пожалуйста, попробуйте еще раз.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
  created() {
    // Проверка на наличие токена при заходе на страницу входа
    if (Cookies.get("authToken")) {
      this.$router.push("/"); // Если пользователь уже авторизован, перенаправляем на главную
    }
  },
};
</script>

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