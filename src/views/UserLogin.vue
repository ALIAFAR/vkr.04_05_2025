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
        const response = await axios.post("http://localhost:5000/api/user/login",
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
@import "/public/css/registration.css";

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
  margin: 130px auto 0 auto;
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

h1 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
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

.input-error {
  border-color: rgba(255, 174, 0, 0.615);
}

.error-text {
  color: rgba(255, 174, 0, 0.615);
  font-size: 12px;
  margin-top: 5px;
}

.btn-login {
  background-color: rgba(0, 66, 129, 0.8);
  color: white;
  padding: 12px 0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.btn-login:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

.btn-login:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: rgba(255, 174, 0, 0.615);
  font-weight: bold;
  margin-top: 10px;
}

.loading-message {
  color: #888;
  font-style: italic;
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
}
</style>
