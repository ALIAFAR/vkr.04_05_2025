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
        const response = await axios.get("https://unigo.onrender.com/api/user/password_check", {
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
  min-height: auto; /* Изменено с 100vh */
  background-color: rgba(244, 244, 249, 0.8);
  width: auto;
  max-width: 420px; /* Уменьшено с 480px */
  margin: 100px auto 30px; /* Уменьшен нижний отступ */
  padding: 25px 30px; /* Уменьшены отступы */
  border-radius: 10px; /* Немного уменьшено скругление */
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08); /* Более легкая тень */
}

/* Форма */
.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 350px;
  padding: 20px;
  box-sizing: border-box; /* Добавлено для правильного расчета ширины */
}


/* Навбар */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 12px 20px;
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
  height: 40px;
  margin-right: 10px;
}

/* Кнопка "Назад" */
.back-button {
  background-color: #fff;
  color: #004281;
  border: 1px solid #004281;
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  position: static;
  margin-left: auto;
}

.back-button:hover {
  background-color: #004281;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 85, 165, 0.2);
}

/* Элементы формы */
.input-group {
  margin-bottom: 18px;
  width: 100%; /* Добавлено */
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  color: #555;
  width: 100%; /* Добавлено */
}

input {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  box-sizing: border-box; /* Добавлено */
  display: block; /* Добавлено */
}

input:focus {
  border-color: rgba(255, 174, 0, 0.615);
  outline: none;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(255, 174, 0, 0.1);
}

/* Кнопка входа */
.btn-login {
  background-color: #004281;
  color: white;
  border: none;
  padding: 13px 20px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  margin-top: 5px;
}

.btn-login:hover {
  background-color: #003365;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  margin: 12px 0;
  text-align: center;
  font-size: 14px;
}

.loading-message {
  color: #666;
  margin: 12px 0;
  text-align: center;
  font-size: 14px;
}

.input-error {
  border-color: red !important;
}

/* Ссылка на регистрацию */
.register-link {
  margin-top: 18px;
  text-align: center;
}

.register-text {
  color: #004281;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s ease;
}

.register-text:hover {
  text-decoration: underline;
  color: #003366;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.notification.show {
  opacity: 1;
  visibility: visible;
  top: 30px;
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
    max-width: 100%;
    padding: 20px 15px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .navbar {
    padding: 10px 15px;
  }
  
  .back-button {
    padding: 7px 12px;
    font-size: 13px;
  }
}

/* Адаптивные стили для маленьких экранов */
@media (max-width: 480px) {
  .form-container {
    padding: 18px;
    width: calc(100% - 20px); /* Учитываем отступы */
    max-width: none; /* Убираем ограничение максимальной ширины */
  }
  
  .form-container {
    padding: 18px;
    margin-top: 15px;
  }
  input {
    padding: 10px;
    width: 100%;
  }
  
  .btn-login {
    padding: 12px;
    font-size: 15px;
  }
  
  .logo-img {
    height: 35px;
  }
}

@media (max-width: 360px) {
  .form-container {
    padding: 15px;
    width: calc(100% - 16px);
  }
  
  .navbar {
    flex-wrap: wrap;
    padding: 8px 10px;
  }
  
  .logo {
    margin-bottom: 8px;
  }
  
  .back-button {
    width: 100%;
    margin-top: 8px;
    text-align: center;
  }
}
</style>