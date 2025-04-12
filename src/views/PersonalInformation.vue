<template>
  <div>
    <AppNavbar />
    <div class="display-data-container">
      <!-- Блок для отображения сообщений -->
      

      <h1 class="section-title">Профиль:</h1>

      <!-- Личные данные -->
      <div class="data-section">
        <h2>Личные данные</h2>
        <div class="data-item" v-for="(value, key) in userData" :key="key">
          <label>{{ formatLabel(key) }}:</label>
          <span>{{ formatValue(key, value) }}</span>
        </div>
      </div>
      <div class="actions">
        <button @click="editData" class="btn-login">Редактировать данные</button>
</div>
      <!-- Данные о водительском удостоверении -->
      <div class="data-section">
        <h2>Данные о водительском удостоверении</h2>
        <div class="data-item">
          <label>Серия и номер прав:</label>
          <span>{{ driverLicense.licenseNumber || 'Нет данных' }}</span>
        </div>
        <div class="data-item">
          <label>Дата выдачи прав:</label>
          <span>{{ driverLicense.licenseIssueDate || 'Нет данных' }}</span>
        </div>
        <div class="actions">
          <button @click="openEditModal" class="btn-login">Редактировать</button>
        </div>
      </div>


      <!-- Данные о транспортных средствах -->
      <div v-for="(car, index) in carData" :key="index" class="car-item">
        <div class="data-item">
          <label>Госномер:</label>
          <span>{{ car.carNumber }}</span>
        </div>
        <div class="data-item">
          <label>Свидетельство о регистрации (СТС):</label>
          <span>{{ car.carSTS }}</span>
        </div>
        <div class="data-item">
          <label>Марка авто:</label>
          <span>{{ car.carBrand }}</span>
        </div>
        <div class="data-item">
          <label>Модель авто:</label>
          <span>{{ car.carModel }}</span>
        </div>
        <button @click="deleteVehicle(index)" class="btn-delete">Удалить это транспортное средство</button>
      </div>

      <!-- Кнопки действий -->
      <div class="actions">
        <button
          ref="addVehicleButton"
          @click="addVehicle"
          class="btn-login"
          :disabled="!isLicenseDataFilled"
        >
          Добавить транспортное средство
        </button>
        <button @click="saveAndContinue" class="btn-login">На главную</button>
      </div>
    </div>
    <img src="/машина.webp" alt="Машина" class="car-image" />
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
      userData: {},
      driverLicense: {
        licenseNumber: "",
        licenseIssueDate: "",
      },
      editDriverLicense: {
        licenseNumber: "",
        licenseIssueDate: "",
      },
      carData: [
        {
          carBrand: '', // Марка авто
          carModel: '', // Модель авто
          carNumber: '', // Госномер
          carSTS: '', // Свидетельство о регистрации (СТС)
          color: '' // Цвет (если нужно)
        }
      ], // Данные о транспортных средствах
      //showMessage: false, // Видимость сообщения
      //messageText: "", // Текст сообщения
      //messageType: "error", // Тип сообщения (error или success)
      isEditing: false, // Режим редактирования
    };
  },
  computed: {
    // Проверка, заполнены ли данные о водительском удостоверении
    isLicenseDataFilled() {
      return this.driverLicense.licenseNumber && this.driverLicense.licenseIssueDate;
    },
  },
  async created() {
    // Загрузка личных данных и данных о транспортных средствах при создании компонента
    await this.fetchUserData();
    await this.fetchCarData();
    await this.fetchDriverLicense();
  },
  methods: {
    // Форматирование ключей данных для отображения
    formatLabel(key) {
    const labels = {
      phone_number: "Номер телефона",
      email: "Email",
      birthday: "Дата рождения",
      gender: "Пол",
      surname: "Фамилия",
      name: "Имя",
      middlename: "Отчество",
      department: "Отдел",
      position: "Должность",
    };
    return labels[key] || key; // Возвращаем читаемое название или оригинальный ключ, если название не найдено
  },
  formatValue(key, value) {
    if (key === "gender") {
      return value ? "Мужской" : "Женский"; // Преобразуем boolean в читаемый формат
    }
    if (key === "birthday") {
      return new Date(value).toLocaleDateString(); // Форматируем дату
    }
    return value; // Возвращаем значение как есть
  },

    // Остальные методы компонента
    async fetchUserData() {
      try {
        const token = Cookies.get('token');
        console.log("try user data");
        const response = await axios.get('http://localhost:5000/api/user/getUser', {
          headers: {
            Authorization: `Bearer ${token}`, // Передаем токен в заголовке
          },
        });
        console.log("checking");
        if (response.data.success) {
          console.log('Данные пользователя:', response.data.user);
          this.userData = response.data.user; // Сохраняем данные пользователя в this.userData
        }
      } catch (error) {
        console.error("Ошибка при загрузке личных данных:", error);
        //this.showMessage = true;
        //this.messageText = "Не удалось загрузить личные данные.";
        //this.messageType = "error";
      }
    },
    // Загрузка данных о транспортных средствах из базы данных
    async fetchCarData() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('http://localhost:5000/api/car/profileCar', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Car DATA/n", response.data.car);
        this.carData = response.data.car.map(car => ({
          carBrand: car.mark, // Марка авто
          carModel: car.brand, // Модель авто
          carNumber: car.car_number, // Госномер
          carSTS: car.sts_number, // Свидетельство о регистрации (СТС)
          color: car.color // Цвет (если нужно)
        }));
      } catch (error) {
        console.error("Ошибка при загрузке данных о транспортных средствах:", error);
        //this.showMessage = true;
        //this.messageType = "error";
      }
    },
    async fetchDriverLicense() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('http://localhost:5000/api/user/license_profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          console.log("response.data.user/n", response.data.user);

          // Преобразуем данные из серверного формата в формат компонента
          this.driverLicense = {
            licenseNumber: response.data.user.license_number,
            licenseIssueDate: response.data.user.license_issue_date.split('T')[0], // Убираем время, оставляем только дату
          };

          console.log("Преобразованные данные:", this.driverLicense); // Для отладки
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных о водительском удостоверении:", error);
      }
    },
    openEditModal() {
      this.$router.push("/edit-driver-license");
    },
    async saveDriverLicense() {
      if (!this.validateDriverLicense()) {
        return;
      }
      try {
        const token = Cookies.get('token');
        await axios.post('http://localhost:5000/api/driver-license', this.editDriverLicense, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.driverLicense = { ...this.editDriverLicense };
        this.closeEditModal();
        ///this.showMessage = true;
        //this.messageText = "Данные о водительском удостоверении успешно сохранены!";
        //this.messageType = "success";
      } catch (error) {
        console.error("Ошибка при сохранении данных о водительском удостоверении:", error);
        //this.showMessage = true;
        //this.messageText = "Не удалось сохранить данные о водительском удостоверении.";
        //this.messageType = "error";
      }
    },
    validateDriverLicense() {
      let isValid = true;
      const licenseNumberPattern = /^\d{10}$/;
      if (!licenseNumberPattern.test(this.editDriverLicense.licenseNumber)) {
        //this.showMessage = true;
        //this.messageText = "Серия и номер прав должны состоять из 10 цифр.";
        //this.messageType = "error";
        isValid = false;
      }
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(this.editDriverLicense.licenseIssueDate)) {
        //this.showMessage = true;
        //this.messageText = "Дата выдачи прав должна быть в формате ГГГГ-ММ-ДД.";
        //this.messageType = "error";
        isValid = false;
      }
      const today = new Date().toISOString().split("T")[0];
      if (this.editDriverLicense.licenseIssueDate > today) {
        //this.showMessage = true;
        //this.messageText = "Дата выдачи прав не может быть в будущем.";
        //this.messageType = "error";
        isValid = false;
      }
      return isValid;
    },

    // Удаление транспортного средства
   
   async deleteVehicle(index) {
    const carNumber = this.carData[index].carNumber; // Получаем госномер
    if (confirm("Вы уверены, что хотите удалить это транспортное средство?")) {
        try {
            const token = Cookies.get('token'); // Получаем токен из куки
            await axios.delete(`http://localhost:5000/api/car/deleteByNumber/${carNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Передаем токен в заголовке
                },
            });
            this.carData.splice(index, 1); // Удаляем транспортное средство из списка
            //this.showMessage = true;
            //this.messageText = "Транспортное средство успешно удалено.";
            //this.messageType = "success";
        } catch (error) {
            console.error("Ошибка при удалении транспортного средства:", error);
            //this.showMessage = true;
            //this.messageText = "Не удалось удалить транспортное средство.";
            //this.messageType = "error";
        }
    }
},

    async addVehicle() {
      if (!this.isLicenseDataFilled) {
        //this.showMessage = true;
        //this.messageText = "Для добавления транспортного средства необходимо заполнить данные о водительском удостоверении!";
        return;
      }
      try {
        this.$router.push("/select-car-manufacturer");
      } catch (error) {
        // Обработка ошибки
      }
    },
    editData() {
      this.$router.push("/edit-data");
    },
    saveAndContinue() {
      this.$router.push("/");
    },
    
    // Переключение режима редактирования
    handleEdit() {
      if (this.isEditing) {
        this.saveDriverLicense();
      }
      this.isEditing = !this.isEditing;
    },
    
  },
};
</script>

<style scoped>
/* Стили для сообщений */
.message {
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #c62828;
  z-index: 1000;
  white-space: nowrap;
  position: absolute;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #c62828;
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #2e7d32;
}

.display-data-container {
  text-align: left;
  padding: 50px 20px;
  max-width: 900px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.2);
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  position: relative;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.data-section {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.data-section h2 {
  color: #34495e;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 20px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: rgba(240, 240, 240, 0.9);
  border-radius: 5px;
  font-size: 16px;
}

.data-item label {
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.data-item span {
  color: #555;
  flex: 2;
  text-align: right;
}

/* Стили для формы ввода данных о водительском удостоверении */
.input-group {
  margin-bottom: 15px;
}

.input-group label {
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
  max-width: 300px; /* Уменьшаем ширину поля ввода */
}

.input-field:focus {
  border-color: #004281;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 66, 129, 0.3);
}

.input-field::placeholder {
  color: #999;
}

/* Ошибки */
.error-text {
  color: #d9534f;
  font-size: 14px;
  margin-top: 5px;
}

.input-error {
  border-color: #d9534f !important;
  background-color: rgba(217, 83, 79, 0.1);
}

/* Кнопки */
.actions {
  display: flex;
  justify-content: center; /* Центрирование кнопок */
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
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-delete {
  padding: 12px;
  font-size: 18px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 10px;
}

.btn-delete:hover {
  background-color: #cc0000;
}

.btn-delete:active {
  background-color: #990000;
}

/* Картинка машины */
.car-image {
  max-width: 20%;
  height: auto;
  position: absolute;
  left: 75%;
  bottom: 15%;
  z-index: 3;
}

.data-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: rgba(240, 240, 240, 0.9);
  border-radius: 5px;
}

.data-item label {
  font-weight: bold;
  color: #333;
  flex: 1;
}

.data-item span {
  color: #666;
  flex: 2;
  text-align: right;
}

.car-item {
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(250, 250, 250, 0.9);
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  transition: background-color 0.3s ease;
}

.btn-login:hover {
  background-color: #003365;
}

.btn-login:active {
  background-color: #002549;
}

.btn-delete {
  padding: 12px;
  font-size: 18px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 10px;
}

.btn-delete:hover {
  background-color: #cc0000;
}

.btn-delete:active {
  background-color: #990000;
}

/* Стиль для картинки с машиной */
.car-image {
  max-width: 30%;
  height: auto;
  position: absolute;
  right: 0;
  bottom: 20%; /* Позиционируем ниже контейнера */
  z-index: 2; /* Картинка не должна закрывать форму */
}
</style>