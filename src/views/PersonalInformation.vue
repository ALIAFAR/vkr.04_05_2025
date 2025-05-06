<template>
  <div>
    <AppNavbar />
    <div class="display-data-container">
      <h1 class="section-title">Профиль:</h1>

      <!-- Блок с аватаром и личными данными -->
      <div class="profile-header">
        <div class="avatar-container">
          <img 
            :src="avatarUrl || 'placeholder-image.jpg'" 
            alt="Аватар" 
            class="avatar-image" 
            @click="triggerFileInput"
        />
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleAvatarUpload" 
            accept="image/*" 
            style="display: none"
          />
          <button @click="triggerFileInput" class="btn-avatar-change">
            {{ avatarUrl ? 'Изменить фото' : 'Добавить фото' }}
          </button>
          <button 
            v-if="avatarUrl" 
            @click="removeAvatar" 
            class="btn-avatar-remove"
          >
            Удалить фото
          </button>
        </div>

        <!-- Личные данные -->
        <div class="data-section personal-data">
          <h2>Личные данные</h2>
          <div class="data-item" v-for="(value, key) in userData" :key="key">
            <label>{{ formatLabel(key) }}:</label>
            <span>{{ formatValue(key, value) }}</span>
          </div>
          <div class="actions">
            <button @click="editData" class="btn-login">Редактировать данные</button>
          </div>
        </div>
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
      avatarUrl: null,
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
          carBrand: '',
          carModel: '',
          carNumber: '',
          carSTS: '',
          color: ''
        }
      ],
      isEditing: false,
    };
  },
  computed: {
    isLicenseDataFilled() {
      return this.driverLicense.licenseNumber && this.driverLicense.licenseIssueDate;
    },
  },
  async created() {
    await this.fetchUserData();
    await this.fetchCarData();
    await this.fetchDriverLicense();
    await this.fetchAvatar();
  },
  methods: {
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
      return labels[key] || key;
    },
    formatValue(key, value) {
      if (key === "gender") {
        return value ? "Женский" : "Мужской";
      }
      if (key === "birthday") {
        return new Date(value).toLocaleDateString();
      }
      return value;
    },

    // Методы для работы с аватаром
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    async handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      if (file.size > 2 * 1024 * 1024) {
        alert("Размер файла не должен превышать 2MB");
        return;
      }
      
      const formData = new FormData();
      formData.append('avatar', file);
      console.log("formData", file)
      
      try {
        const token = Cookies.get('token');
        const response = await axios.put('https://unigo.onrender.com/api/user/create-img', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });       
        if (response.data.success) {
          this.avatarUrl = response.data.avatarUrl + '?' + new Date().getTime(); // Добавляем параметр для избежания кеширования
        }
      } catch (error) {
        console.error("Ошибка при загрузке аватара:", error);
        alert("Не удалось загрузить аватар");
      }
    },
    
    async removeAvatar() {
      try {
        const token = Cookies.get('token');
        const response = await axios.delete('https://unigo.onrender.com/api/user/delete-img', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          this.avatarUrl = null;
        }
      } catch (error) {
        console.error("Ошибка при удалении аватара:", error);
        alert("Не удалось удалить аватар");
      }
    },
    
    async fetchAvatar() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('https://unigo.onrender.com/api/user/get-img', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.success && response.data.avatarUrl) {
            this.avatarUrl = response.data.avatarUrl;
            console.log("check avatarUrl",this.avatarUrl)
        }
      } catch (error) {
          console.error("Ошибка при загрузке аватара:", error);
      }
    },

    async fetchUserData() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('https://unigo.onrender.com/api/user/getUser', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          this.userData = response.data.user;
        }
      } catch (error) {
        console.error("Ошибка при загрузке личных данных:", error);
      }
    },
    
    async fetchCarData() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('https://unigo.onrender.com/api/car/profileCar', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.carData = response.data.car.map(car => ({
          carBrand: car.mark,
          carModel: car.brand,
          carNumber: car.car_number,
          carSTS: car.sts_number,
          color: car.color
        }));
      } catch (error) {
        console.error("Ошибка при загрузке данных о транспортных средствах:", error);
      }
    },
    
    async fetchDriverLicense() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('https://unigo.onrender.com/api/user/license_profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          this.driverLicense = {
            licenseNumber: response.data.user.license_number,
            licenseIssueDate: response.data.user.license_issue_date.split('T')[0],
          };
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных о водительском удостоверении:", error);
      }
    },
    
    openEditModal() {
      this.$router.push("/edit-driver-license");
    },
    
    async deleteVehicle(index) {
      const carNumber = this.carData[index].carNumber;
      if (confirm("Вы уверены, что хотите удалить это транспортное средство?")) {
        try {
          const token = Cookies.get('token');
          await axios.delete(`https://unigo.onrender.com/api/car/deleteByNumber/${carNumber}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          this.carData.splice(index, 1);
        } catch (error) {
          console.error("Ошибка при удалении транспортного средства:", error);
        }
      }
    },
    
    addVehicle() {
      if (!this.isLicenseDataFilled) return;
      this.$router.push("/select-car-manufacturer");
    },
    
    editData() {
      this.$router.push("/edit-data");
    },
    
    saveAndContinue() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
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

.profile-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #004281;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
}

.btn-avatar-change, .btn-avatar-remove {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-avatar-change {
  background-color: #004281;
  color: white;
}

.btn-avatar-change:hover {
  background-color: #003365;
}

.btn-avatar-remove {
  background-color: #ff4d4d;
  color: white;
}

.btn-avatar-remove:hover {
  background-color: #cc0000;
}

.personal-data {
  flex-grow: 1;
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
  margin-bottom: 10px;
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

.car-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn-login {
  padding: 12px 20px;
  font-size: 16px;
  background-color: #004281;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-width: 200px;
}

.btn-login:hover {
  background-color: #003365;
}

.btn-login:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-delete {
  padding: 12px;
  font-size: 16px;
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

.car-image {
  max-width: 20%;
  height: auto;
  position: absolute;
  right: 5%;
  bottom: 15%;
  z-index: 3;
}

/* Адаптивные стили */
@media (max-width: 992px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
  }
  
  .car-image {
    display: none;
  }
}

@media (max-width: 768px) {
  .display-data-container {
    margin-top: 80px;
    padding: 20px 15px;
  }
  
  .data-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .data-item span {
    text-align: left;
    width: 100%;
    margin-top: 5px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-login {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 20px;
  }
  
  .data-section h2 {
    font-size: 18px;
  }
  
  .data-item {
    font-size: 14px;
    padding: 8px;
  }
  
  .btn-login, .btn-delete {
    font-size: 14px;
    padding: 10px;
  }
}
</style>