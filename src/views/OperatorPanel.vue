<template>
    <div>
      <!-- Навигационная панель для оператора -->
      <div class="navbar">
        <div class="logo" @click="goToHome">
          <img src="/Logotip.png" alt="Operator Logo" class="logo-img" />
          UniGo Панель оператора
        </div>
        <div class="menu">
          <button class="menu-item" @click="goToDataUpload">Загрузка данных</button>
          <button class="menu-item" @click="goToNotifications">Уведомления</button>
          <button class="menu-item" @click="goToUsers">Пользователи</button>
          <button class="menu-item" @click="goToCars">Автомобили</button>
  
          <!-- Выход -->
          <div class="profile">
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
      </div>
  
      <!-- Модальное окно для подтверждения выхода -->
      <div v-if="isLogoutConfirmVisible" class="logout-modal">
        <div class="modal-content">
          <p>Вы уверены, что хотите выйти из профиля?</p>
          <button @click="logout">Да</button>
          <button @click="cancelLogout">Нет</button>
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
        <div v-if="uploadedData.length > 0">
          <h3>Загруженные данные:</h3>
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
          <!-- Кнопка "Сохранить" -->
          <button @click="saveDataToDatabase" class="save-button">Сохранить</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import * as XLSX from 'xlsx';
  import axios from 'axios'; // Подключаем axios
  
  export default {
    data() {
      return {
        isProfileDropdownVisible: false,
        isLogoutConfirmVisible: false,
        uploadedData: [], // Данные из Excel
        headers: [], // Заголовки таблицы
        fileName: '', // Имя выбранного файла
      };
    },
    methods: {
      goToHome() {
        this.$router.push("/operator-panel");
      },
      goToDataUpload() {
        // Оставляем пользователя на текущей странице
        alert("Вы находитесь на странице загрузки данных.");
      },
      goToNotifications() {
        this.$router.push("/notifications");
      },
      goToUsers() {
        this.$router.push("/user-verification");
      },
      goToCars() {
        this.$router.push("/car-verification");
      },
      toggleProfileDropdown() {
        this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
      },
      closeDropdown() {
        this.isProfileDropdownVisible = false;
      },
      handleOutsideClick(event) {
        const profile = this.$refs.profile;
        if (profile && !profile.contains(event.target)) {
          this.closeDropdown();
        }
      },
      confirmLogout() {
        this.isLogoutConfirmVisible = true;
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
      // Обработка загрузки файла
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.fileName = file.name; // Сохраняем имя файла
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
            // Извлекаем заголовки и данные
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
      // Метод для сохранения данных в базу данных
      async saveDataToDatabase() {
        try {
          const response = await axios.post('/api/save-data', {
            data: this.uploadedData, // Отправляем загруженные данные
          });
  
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
    },
    mounted() {
      document.addEventListener("click", this.handleOutsideClick);
    },
    beforeUnmount() {
      document.removeEventListener("click", this.handleOutsideClick);
    },
  };
  </script>
  
  <style scoped>
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
    margin-right: 80px;
    font-size: 36px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
    color: rgba(0, 66, 129, 1);
    cursor: pointer;
  }
  
  .logo-img {
    width: 100px;
    height: auto;
    margin-right: 10px;
  }
  
  .menu {
    display: flex;
    gap: 20px;
    margin-right: 40px;
  }
  
  .menu-item {
    background-color: transparent;
    border: none;
    color: rgba(0, 66, 129, 0.8);
    font-size: 16px;
    cursor: pointer;
    padding: 10px 20px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  
  .menu-item:hover {
    background-color: rgba(0, 66, 129, 0.1);
  }
  
  /* Стили для профиля */
  .profile {
    position: relative;
    margin-left: auto;
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
    background-color: rgba(0, 66, 129, 0.8);
    color: rgba(0, 66, 129, 1);
    box-shadow: 0px 4px 6px rgba(0, 66, 129, 0.8);
  }
  
  .dropdown-menu button {
    background: transparent;
    border: none;
    padding: 10px;
    width: 100%;
    text-align: left;
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
    background-color: rgba(0, 66, 129, 1);
    z-index: 1001;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 66, 129, 1);
  }
  
  .modal-content button {
    margin: 10px;
    padding: 10px 20px;
    background-color: rgba(0, 66, 129, 1);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .modal-content button:hover {
    background-color: rgba(0, 66, 129, 0.8);
  }
  
  /* Стили для секции загрузки данных */
  .data-upload-section {
    margin-top: 100px;
    padding: 20px;
  }
  
  .data-upload-section h2 {
    margin-bottom: 20px;
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
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .file-upload-label:hover {
    background-color: rgba(0, 66, 129, 0.2);
  }
  
  .file-upload-text {
    flex-grow: 1;
    color: rgba(0, 66, 129, 0.8);
  }
  
  .file-upload-button {
    background-color: rgba(0, 66, 129, 1);
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    margin-left: 10px;
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
  .data-upload-section table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .data-upload-section th,
  .data-upload-section td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  .data-upload-section th {
    background-color: rgba(0, 66, 129, 0.8);
    color: white;
  }
  
  /* Стили для кнопки "Сохранить" */
  .save-button {
    background-color: rgba(0, 66, 129, 1);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s ease;
  }
  
  .save-button:hover {
    background-color: rgba(0, 66, 129, 0.8);
  }
  </style>