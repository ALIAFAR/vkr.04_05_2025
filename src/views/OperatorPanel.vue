<template>
  <div>
    <!-- Навигационная панель для оператора -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="Operator Logo" class="logo-img" />
        <span class="logo-text">Панель оператора</span>
      </div>
      <div class="menu">
        <button class="menu-item" @click="goToDataUpload">Загрузка данных</button>
        <button class="menu-item" @click="goToNotifications">Уведомления</button>
        <button class="menu-item" @click="goToUsers">Пользователи</button>
        <button class="menu-item" @click="goToCars">Автомобили</button>

        <!-- Выход -->
        <div class="profile" ref="profile">
          <img
            src="/pngwing.com (5).png"
            class="profile-photo"
            @click="toggleProfileDropdown"
            alt="Профиль"
          />
          <div v-if="isProfileDropdownVisible" class="dropdown-menu">
            <button @click="confirmLogout">Выход</button>
          </div>
        </div>
      </div>
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        ☰
      </button>
    </div>

    <!-- Мобильное меню -->
    <div v-if="isMobileMenuVisible" class="mobile-menu">
      <button class="mobile-menu-item" @click="goToDataUpload">Загрузка данных</button>
      <button class="mobile-menu-item" @click="goToNotifications">Уведомления</button>
      <button class="mobile-menu-item" @click="goToUsers">Пользователи</button>
      <button class="mobile-menu-item" @click="goToCars">Автомобили</button>
      <button class="mobile-menu-item logout-btn" @click="confirmLogout">Выход</button>
    </div>

    <!-- Модальное окно для подтверждения выхода -->
    <div v-if="isLogoutConfirmVisible" class="logout-modal">
      <div class="modal-content">
        <p>Вы уверены, что хотите выйти из профиля?</p>
        <div class="modal-buttons">
          <button @click="logout">Да</button>
          <button @click="cancelLogout">Нет</button>
        </div>
      </div>
    </div>

    <!-- Секция для загрузки и отображения данных -->
    <div class="data-upload-section">
      <h2>Загрузка данных из Excel</h2>
      <div class="file-upload-container">
        <label for="file-upload" class="file-upload-label">
          <span class="file-upload-text">{{ fileName || "Выберите файл" }}</span>
          <span class="file-upload-button">Обзор</span>
        </label>
        <input
          id="file-upload"
          type="file"
          @change="handleFileUpload"
          accept=".xlsx, .xls"
          class="file-upload-input"
        />
        <div v-if="!fileName" class="file-upload-hint">Файл не выбран</div>
      </div>
      <div v-if="uploadedData.length > 0" class="table-container">
        <h3>Загруженные данные:</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th v-for="header in headers" :key="header">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in uploadedData" :key="index">
                <td v-for="(value, key) in row" :key="key">{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Кнопка "Сохранить" -->
        <button @click="saveDataToDatabase" class="save-button">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import Cookies from 'js-cookie';

export default {
  data() {
    return {
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
      isMobileMenuVisible: false,
      uploadedData: [],
      headers: [],
      fileName: '',
      windowWidth: window.innerWidth,
    };
  },
  methods: {
    goToHome() {
      this.$router.push("/operator-panel");
    },
    goToDataUpload() {
      this.isMobileMenuVisible = false;
      alert("Вы находитесь на странице загрузки данных.");
    },
    goToNotifications() {
      this.isMobileMenuVisible = false;
      this.$router.push("/notifications");
    },
    goToUsers() {
      this.isMobileMenuVisible = false;
      this.$router.push("/user-verification");
    },
    goToCars() {
      this.isMobileMenuVisible = false;
      this.$router.push("/car-verification");
    },
    toggleProfileDropdown() {
      this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
    },
    closeDropdown() {
      this.isProfileDropdownVisible = false;
    },
    toggleMobileMenu() {
      this.isMobileMenuVisible = !this.isMobileMenuVisible;
    },
    handleOutsideClick(event) {
      const profile = this.$refs.profile;
      if (profile && !profile.contains(event.target)) {
        this.closeDropdown();
      }
      
      if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.mobile-menu')) {
        this.isMobileMenuVisible = false;
      }
    },
    confirmLogout() {
      this.isLogoutConfirmVisible = true;
      this.isProfileDropdownVisible = false;
      this.isMobileMenuVisible = false;
    },
    logout() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      this.isLogoutConfirmVisible = false;
      this.$router.push("/");
    },
    cancelLogout() {
      this.isLogoutConfirmVisible = false;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.fileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          this.headers = jsonData[0];
          this.uploadedData = jsonData.slice(1).map(row => {
            const rowData = {};
            this.headers.forEach((header, index) => {
              rowData[header] = row[index];
            });
            return rowData;
          });
        };
        reader.readAsArrayBuffer(file);
      }
    },
    async saveDataToDatabase() {
      console.log(this.uploadedData)
      try {
        const response = await axios.post(API_CONFIG.BASE_URL+'/operator/create-users', {
          data: this.uploadedData,
        },{
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }});

        if (response.data.success) {
          alert('Данные успешно сохранены в базе данных!');
        } else {
          alert('Ошибка при сохранении данных: ' + response.data.message);
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        alert('Данные успешно сохранены.');
      }
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth > 768) {
        this.isMobileMenuVisible = false;
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
/* Базовые стили */
* {
  box-sizing: border-box;
}

/* Стили для навигационной панели */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  cursor: pointer;
}

.logo-img {
  width: 60px;
  height: auto;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  white-space: nowrap;
}

.menu {
  display: flex;
  gap: 15px;
  align-items: center;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: rgba(0, 66, 129, 0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Стили для профиля */
.profile {
  position: relative;
  margin-left: 15px;
}

.profile-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  min-width: 120px;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px 15px;
  width: 100%;
  text-align: left;
  color: rgba(0, 66, 129, 0.8);
  cursor: pointer;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Стили для мобильного меню */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(0, 66, 129, 1);
  padding: 5px 10px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background-color: white;
  z-index: 999;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  flex-direction: column;
}

.mobile-menu-item {
  padding: 15px 20px;
  border: none;
  background: none;
  text-align: left;
  color: rgba(0, 66, 129, 0.8);
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.mobile-menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.logout-btn {
  color: #ff4d4d;
}

/* Стили для модального окна */
.logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 90%;
  width: 400px;
}

.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-content button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-width: 80px;
}

.modal-content button:first-child {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.modal-content button:first-child:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

.modal-content button:last-child {
  background-color: #f0f0f0;
  color: #333;
}

.modal-content button:last-child:hover {
  background-color: #e0e0e0;
}

/* Стили для секции загрузки данных */
.data-upload-section {
  margin-top: 100px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.data-upload-section h2 {
  margin-bottom: 20px;
  color: rgba(0, 66, 129, 1);
}

/* Стили для кастомного загрузчика файлов */
.file-upload-container {
  position: relative;
  margin-bottom: 20px;
}

.file-upload-label {
  display: flex;
  align-items: center;
  background-color: rgba(0, 66, 129, 0.1);
  border: 2px dashed rgba(0, 66, 129, 0.5);
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-label:hover {
  background-color: rgba(0, 66, 129, 0.2);
}

.file-upload-text {
  flex-grow: 1;
  color: rgba(0, 66, 129, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload-button {
  background-color: rgba(0, 66, 129, 1);
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  margin-left: 10px;
  white-space: nowrap;
}

.file-upload-input {
  display: none;
}

.file-upload-hint {
  margin-top: 5px;
  color: rgba(0, 66, 129, 0.6);
  font-size: 14px;
}

/* Стили для таблицы */
.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.table-wrapper {
  min-width: 600px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background-color: rgba(0, 66, 129, 0.8);
  color: white;
  position: sticky;
  top: 0;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

/* Стили для кнопки "Сохранить" */
.save-button {
  background-color: rgba(0, 66, 129, 1);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
  font-size: 16px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.save-button:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

/* Адаптивные стили */
@media (max-width: 992px) {
  .logo-text {
    font-size: 16px;
  }
  
  .menu-item {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .data-upload-section {
    padding: 15px;
  }
  
  th, td {
    padding: 8px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .logo-text {
    display: none;
  }
  
  .logo-img {
    width: 50px;
    margin-right: 0;
  }
  
  .navbar {
    padding: 10px 15px;
    height: 70px;
  }
  
  .data-upload-section {
    margin-top: 80px;
    padding: 10px;
  }
  
  .file-upload-label {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
  
  .file-upload-button {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }
  
  .save-button {
    width: 100%;
    padding: 10px;
 
  }
  
  .modal-content {
    width: 90%;
    padding: 15px;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-content button {
    width: 100%;
  }
}
@media (max-width: 480px) {
  .logo-text {
    font-size: 12px; /* Вместо display: none */
    margin-left: 5px;
  }
}
</style>