<template>
  <AppNavbar />
  <div class="login-container">
    <div class="form-container">
      <h1>Регистрация</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Почта</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Введите ваш e-mail"
            :class="{ 'input-error': email && !isValidEmail }"
          />
          <p v-if="email && !isValidEmail" class="error-text">
            Неверный формат e-mail
          </p>
        </div>

        <div class="input-group">
          <label for="temporaryPassword">Временный пароль</label>
          <input
            type="password"
            id="temporaryPassword"
            v-model="temporaryPassword"
            required
            placeholder="Введите временный пароль"
            :class="{ 'input-error': temporaryPassword && !isValidPassword }"
          />
          <p v-if="temporaryPassword && !isValidPassword" class="error-text">
            Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (!@#$%^&*).
          </p>
        </div>

        <button type="submit" :disabled="isLoading || isSubmitting" class="btn-login">
          {{ isLoading ? 'Загрузка...' : 'Продолжить' }}
        </button>

        <div v-if="error" class="error-message">{{ error }}</div>
      </form>

      <div class="register-link">
        <span> Уже с нами? </span>
        <router-link to="/login" class="register-text"> Войти </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from "js-cookie"; // Подключаем js-cookie
import axios from "axios"; // Подключаем axios

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
    };
  },
  computed: {
    isValidEmail() {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(this.email);
    },
    isValidPassword() {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordPattern.test(this.temporaryPassword);
    },
  },
  methods: {
    async handleLogin() {
      if (this.isSubmitting) return;

      if (!this.isValidEmail) {
        this.error = "Неверный формат e-mail";
        return;
      }

      if (!this.isValidPassword) {
        this.error = "Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (!@#$%^&*).";
        return;
      }

      this.isLoading = true;
      this.isSubmitting = true;
      this.error = "";

      try {
        // Сохраняем данные в куках
        Cookies.set("email", this.email, { expires: 1 / 144 }); // 10 минут        
        Cookies.set("temporaryPassword", this.temporaryPassword, { expires: 1 / 144 }); // 10 минут
        console.log(this.temporaryPassword, "временный пароль");

        // Вызываем метод для проверки временного пароля
        const userId = await this.checkTemporaryPassword(this.temporaryPassword);

        if (userId) {
          // Сохраняем user_id в cookies
          Cookies.set("user_id", userId, { expires: 1 / 144 }); // 10 минут
          console.log("User ID сохранен в cookies:", userId);

          // Перенаправляем на страницу изменения пароля
          this.$router.push("/set-password");
        } else {
          this.error = "Временный пароль неверный или пользователь не найден";
        }
      } catch (error) {
        console.log(Cookies.get("email"));
        console.log(Cookies.get("newPassword"));
        this.error = "Ошибка при обработке данных";
      } finally {
        this.isLoading = false;
        this.isSubmitting = false;
      }
    },

    // Метод для проверки временного пароля через axios
    async checkTemporaryPassword(password) {
      try {
        const response = await axios.get("http://localhost:5000/api/user/password_check", {
          params: {
            password: password, // Передаем временный пароль как параметр
          },
        });

        // Если запрос успешен и user_id найден
        if (response.data && response.data.user_id) {
          return response.data.user_id; // Возвращаем user_id
        } else {
          return null; // Если user_id не найден
        }
      } catch (error) {
        console.error("Ошибка при проверке временного пароля:", error);
        throw error; // Пробрасываем ошибку для обработки в handleLogin
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
