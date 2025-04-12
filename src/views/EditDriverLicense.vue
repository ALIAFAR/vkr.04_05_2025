<template>
  <div class="edit-driver-license-page">
    <AppNavbar />
    <div class="edit-container">
      <h1>Редактирование данных о водительском удостоверении</h1>

      <!-- Форма редактирования -->
      <div class="data-item">
        <label>Серия и номер прав:</label>
        <input
          type="text"
          v-model="editDriverLicense.licenseNumber"
          placeholder="Введите серию и номер прав"
          class="input-field"
        />
      </div>
      <div class="data-item">
        <label>Дата выдачи прав:</label>
        <input
          type="date"
          v-model="editDriverLicense.licenseIssueDate"
          placeholder="дд.мм.гггг"
          class="input-field"
        />
      </div>

      <!-- Чекбокс согласия -->
      <div class="data-item checkbox-container">
        <input
          type="checkbox"
          id="consentCheckbox"
          v-model="consentGiven"
          class="consent-checkbox"
        />
        <label for="consentCheckbox" class="consent-label">
          Я даю согласие на обработку моих персональных данных
        </label>
      </div>

      <!-- Кнопки действий -->
      <div class="actions">
        <button 
          @click="saveDriverLicense" 
          class="btn-login"
          :disabled="!consentGiven"
        >
          Сохранить
        </button>
        <button @click="goBack" class="btn-login">Назад</button>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      editDriverLicense: {
        licenseNumber: "",
        licenseIssueDate: "",
      },
      consentGiven: false, // Флаг согласия на обработку данных
    };
  },
  methods: {
    async saveDriverLicense() {
      if (!this.consentGiven) {
        alert("Необходимо дать согласие на обработку персональных данных");
        return;
      }
      
      if (!this.validateDriverLicense()) {
        return;
      }
      try {
        const token = Cookies.get('token');
        console.log("this.editDriverLicense",this.editDriverLicense)
        await axios.post('http://localhost:5000/api/user/upd_profile_license', this.editDriverLicense, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.$router.push("/personal-information"); // Возвращаемся на страницу профиля после сохранения
      } catch (error) {
        console.error("Ошибка при сохранении данных о водительском удостоверении:", error);
      }
    },
    validateDriverLicense() {
      let isValid = true;
      const licenseNumberPattern = /^\d{10}$/;
      if (!licenseNumberPattern.test(this.editDriverLicense.licenseNumber)) {
        alert("Серия и номер прав должны состоять из 10 цифр.");
        isValid = false;
      }
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(this.editDriverLicense.licenseIssueDate)) {
        alert("Дата выдачи прав должна быть в формате ГГГГ-ММ-ДД.");
        isValid = false;
      }
      const today = new Date().toISOString().split("T")[0];
      if (this.editDriverLicense.licenseIssueDate > today) {
        alert("Дата выдачи прав не может быть в будущем.");
        isValid = false;
      }
      return isValid;
    },
    goBack() {
      this.$router.push("/personal-information"); // Возвращаемся на страницу профиля
    },
  },
};
</script>

<style scoped>
.edit-driver-license-page {
  padding: 20px;
  max-width: 900px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.2);
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.edit-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.data-item {
  margin-bottom: 15px;
}

.data-item label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
}

.input-field {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border 0.3s ease-in-out;
  background-color: #f9f9f9;
  max-width: 300px;
}

.input-field:focus {
  border-color: #004281;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 66, 129, 0.3);
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.consent-checkbox {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  cursor: pointer;
}

.consent-label {
  font-weight: normal;
  cursor: pointer;
  color: #2c3e50;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.btn-login {
  padding: 12px;
  font-size: 18px;
  background-color: #004281;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.btn-login:hover {
  background-color: #003365;
}

.btn-login:active {
  background-color: #002549;
}

.btn-login:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>