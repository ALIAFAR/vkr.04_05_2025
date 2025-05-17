<template>
  <div>
    <AppNavbar /> <!-- Добавьте AppNavbar здесь -->
    <div class="profile-container">
      <div class="form-container">
        <h1>Профиль пользователя</h1>
        <form @submit.prevent="saveProfile">
          <div class="input-group">
            <label for="firstName">Имя:</label>
            <input
              type="text"
              id="firstName"
              v-model="profile.firstName"
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <div class="input-group">
            <label for="middleName">Отчество (при наличии):</label>
            <input
              type="text"
              id="middleName"
              v-model="profile.middleName"
              placeholder="Введите ваше отчество"
            />
          </div>

          <div class="input-group">
            <label for="lastName">Фамилия:</label>
            <input
              type="text"
              id="lastName"
              v-model="profile.lastName"
              placeholder="Введите вашу фамилию"
              required
            />
          </div>

          <div class="input-group">
            <label for="gender">Пол:</label>
            <select id="gender" v-model="profile.gender" class="w-full p-2 border rounded">
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div class="input-group">
            <label for="birthDate">Дата рождения:</label>
            <input
              type="date"
              id="birthDate"
              v-model="profile.birthDate"
              required
            />
          </div>

          <div class="input-group">
            <label for="phone">Номер телефона:</label>
            <input
              type="tel"
              id="phone"
              v-model="profile.phone"
              placeholder="Введите ваш номер телефона"
              required
            />
          </div>

          <div class="input-group">
            <label for="email">Электронная почта:</label>
            <input
              type="email"
              id="email"
              v-model="profile.email"
              placeholder="Введите вашу почту"
              required
            />
          </div>

          <div class="input-group">
            <label for="position">Должность:</label>
            <input
              type="text"
              id="position"
              v-model="profile.position"
              placeholder="Введите вашу должность"
              required
            />
          </div>

          <div class="input-group">
            <label for="department">Отдел:</label>
            <input
              type="text"
              id="department"
              v-model="profile.department"
              placeholder="Введите ваш отдел"
              required
            />
          </div>

          <button type="submit" class="btn-login">Сохранить</button>
        </form>

        <button @click="addVehicle" class="btn-login mt-4">Добавить транспортное средство</button>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue"; // Импортируем AppNavbar
import axios from "axios"; // Импортируем axios для запросов на сервер
import { useToast } from "vue-toastification"; // Для уведомлений
import { API_CONFIG } from '@/config/api'

export default {
  components: {
    AppNavbar, // Регистрируем AppNavbar
  },
  setup() {
    const toast = useToast(); // Инициализируем уведомления
    return { toast };
  },
  data() {
    return {
      profile: {
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        birthDate: "",
        phone: "",
        email: "",
        position: "", // Должность
        department: "", // Отдел
      },
    };
  },
  methods: {
    // Загрузка данных профиля с сервера
    async loadProfile() {
      try {
        const response = await axios.get("https://ваш-сервер/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Токен авторизации
          },
        });

        if (response.data.success) {
          this.profile = response.data.profile; // Заполняем данные профиля
        } else {
          this.toast.error("Не удалось загрузить данные профиля.");
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        this.toast.error("Ошибка при загрузке профиля. Попробуйте снова.");
      }
    },

    // Сохранение данных профиля на сервере
    async saveProfile() {
      try {
        const response = await axios.post("/api/profile",
          this.profile,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Токен авторизации
            },
          }
        );

        if (response.data.success) {
          this.toast.success("Профиль успешно сохранен!");
        } else {
          this.toast.error("Не удалось сохранить профиль.");
        }
      } catch (error) {
        console.error("Ошибка при сохранении профиля:", error);
        this.toast.error("Ошибка при сохранении профиля. Попробуйте снова.");
      }
    },

    // Переход на страницу добавления транспортного средства
    addVehicle() {
      this.$router.push("/add-vehicle");
    },
  },
  mounted() {
    // Загружаем данные профиля при монтировании компонента
    this.loadProfile();
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

.profile-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: rgba(244, 244, 249, 0.8);
  max-width: 500px;
  margin: 120px auto 0 auto;
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

h1 {
  text-align: center;
  color: #004281;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border 0.3s ease;
}

input:focus,
select:focus {
  border-color: rgba(255, 174, 0, 0.615);
  outline: none;
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
</style>