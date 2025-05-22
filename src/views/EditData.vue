<template>
  <div>
    <AppNavbar />
    <div class="edit-data-container">
      <h1 class="section-title">Редактирование данных:</h1>
      <form @submit.prevent="saveChanges">
        <div class="input-group">
          <label for="gender">Пол:</label>
          <select id="gender" v-model="editedUserData.gender" required>
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
          </select>
        </div>
        <div class="input-group">
          <label for="dob">Дата рождения:</label>
          <input
            type="date"
            id="dob"
            v-model="editedUserData.dob"
            required
          />
        </div>
        <div class="input-group">
          <label for="phone">Номер телефона:</label>
          <input
            type="tel"
            id="phone"
            v-model="editedUserData.phone"
            placeholder="Введите номер телефона"
            required
          />
        </div>
        <div class="input-group">
          <label for="email">Электронная почта:</label>
          <input
            type="email"
            id="email"
            v-model="editedUserData.email"
            placeholder="Введите электронную почту"
            required
          />
        </div>
        <button type="submit" class="btn-login">Сохранить изменения</button>
      </form>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG } from '@/config/api'

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      editedUserData: {
        gender: "",
        dob: "",
        phone: "",
        email: "",
      },
    };
  },
  created() {
    // Загружаем текущие данные пользователя при создании компонента
    this.loadUserData();
  },
  methods: {
    loadUserData() {
      // Здесь можно загрузить данные из хранилища (например, Vuex) или API
      this.editedUserData = { ...this.$store.state.userData }; // Пример с Vuex
    },
    async saveChanges() {
      try {
        const token = Cookies.get('token');

        // Преобразуем gender в числовое значение
        const payload = {
          ...this.editedUserData,
          gender: this.editedUserData.gender === "Мужской" ? 0 : 1,
        };

        console.log("Отправляемые данные:", payload);

        // Отправляем данные на сервер
        await axios.post(API_CONFIG.BASE_URL +'/user/update-profile', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Возвращаемся на страницу профиля после сохранения
        this.$router.push("/personal-information");
      } catch (error) {
        console.error("Ошибка при сохранении данных:", error);
        alert("Произошла ошибка при сохранении данных. Пожалуйста, попробуйте снова.");
      }
    },
  },
};
</script>

<style scoped>
.edit-data-container {
  text-align: center;
  padding: 50px 20px;
  max-width: 600px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
}

label {
  font-size: 18px;
  margin-bottom: 5px;
  display: block;
  text-align: left;
}

input,
select {
  width: 90%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  background-color: #f7f7f7;
  text-align: left;
}

input:focus,
select:focus {
  outline: none;
  background-color: #e3e3e3;
  border-color: #004281;
  box-shadow: 0 0 5px rgba(0, 66, 129, 0.5);
}

.btn-login {
  padding: 12px;
  font-size: 18px;
  background-color: #004281;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.btn-login:hover {
  background-color: #003365;
}

.btn-login:active {
  background-color: #002549;
}
</style>