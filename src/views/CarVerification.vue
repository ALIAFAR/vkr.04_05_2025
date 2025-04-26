<template>
  <div>
    <!-- Навигационная панель для оператора -->
    <div class="navbar">
      <div class="logo" @click="goToHome">
        <img src="/Logotip.png" alt="Operator Logo" class="logo-img" />
        <span class="logo-text">UniGo</span>
        <span class="logo-subtext">Панель оператора</span>
      </div>
      
      <div class="desktop-menu">
        <button class="menu-item" @click="goToDataUpload">Загрузка данных</button>
        <button class="menu-item" @click="goToNotifications">Уведомления</button>
        <button class="menu-item" @click="goToUsers">Пользователи</button>
        <button class="menu-item active">Автомобили</button>

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
      <button class="mobile-menu-item active">Автомобили</button>
      <button class="mobile-menu-item logout-btn" @click="confirmLogout">Выход</button>
    </div>

    <!-- Модальное окно для подтверждения выхода -->
    <div v-if="isLogoutConfirmVisible" class="logout-modal">
      <div class="modal-content">
        <p>Вы уверены, что хотите выйти из профиля?</p>
        <div class="modal-buttons">
          <button @click="logout" class="modal-button confirm">Да</button>
          <button @click="cancelLogout" class="modal-button cancel">Нет</button>
        </div>
      </div>
    </div>

    <!-- Секция для проверки автомобилей -->
    <div class="cars-section">
      <h2>Проверка автомобилей</h2>

      <!-- Панель поиска и сортировки -->
      <div class="search-panel">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по госномеру"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="sort-controls">
          <label class="sort-checkbox">
            <input type="checkbox" v-model="sortByUnverified" />
            <span class="checkbox-label">Сначала непроверенные</span>
          </label>
          <a href="https://www.gosuslugi.ru/" target="_blank" class="gosuslugi-link">
            <span class="gosuslugi-icon">📋</span>
            <span class="gosuslugi-text">Проверить на Госуслугах</span>
          </a>
        </div>
      </div>

      <div v-if="filteredCars.length > 0" class="cars-list">
        <div v-for="car in filteredCars" :key="car.licensePlate" class="car-item">
          <div class="car-content">
            <div class="car-info-row">
              <span class="info-label">Госномер:</span>
              <span class="info-value">{{ car.licensePlate }}</span>
            </div>
            <div class="car-info-row">
              <span class="info-label">СТС:</span>
              <span class="info-value">{{ car.sts }}</span>
            </div>
            <div class="car-info-row">
              <span class="info-label">Марка:</span>
              <span class="info-value">{{ car.brand }}</span>
            </div>
            <div class="car-info-row">
              <span class="info-label">Модель:</span>
              <span class="info-value">{{ car.model }}</span>
            </div>
            <div class="car-info-row">
              <span class="info-label">Статус:</span>
              <span :class="['status', { verified: car.isVerified }]">
                {{ car.isVerified ? 'Проверено' : 'Не проверено' }}
              </span>
            </div>
          </div>
          <div class="car-actions">
            <button @click.stop="verifyCar(car)" class="action-button verify-button">
              <span class="button-icon">✔️</span>
              <span class="button-text">Проверено</span>
            </button>
            <button @click.stop="deleteCar(car)" class="action-button delete-button">
              <span class="button-icon">🗑️</span>
              <span class="button-text">Удалить</span>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="no-cars">Нет автомобилей для проверки.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cars: [
        {
          licensePlate: "А123ВС77",
          sts: "1234567890",
          brand: "Toyota",
          model: "Camry",
          isVerified: false,
        },
        {
          licensePlate: "О777ОО77",
          sts: "0987654321",
          brand: "Honda",
          model: "Civic",
          isVerified: true,
        },
        {
          licensePlate: "Е555КХ77",
          sts: "1122334455",
          brand: "Ford",
          model: "Focus",
          isVerified: false,
        },
      ],
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
      isMobileMenuVisible: false,
      searchQuery: "",
      sortByUnverified: false,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    filteredCars() {
      let filtered = this.cars.filter((car) => {
        const query = this.searchQuery.toLowerCase();
        return car.licensePlate.toLowerCase().includes(query);
      });

      if (this.sortByUnverified) {
        filtered.sort((a, b) => (a.isVerified === b.isVerified ? 0 : a.isVerified ? 1 : -1));
      }

      return filtered;
    },
  },
  methods: {
    goToHome() {
      this.$router.push("/operator-panel");
    },
    goToDataUpload() {
      this.closeMobileMenu();
      this.$router.push("/operator-panel");
    },
    goToNotifications() {
      this.closeMobileMenu();
      this.$router.push("/notifications");
    },
    goToUsers() {
      this.closeMobileMenu();
      this.$router.push("/user-verification");
    },
    goToCars() {
      this.closeMobileMenu();
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
      this.isProfileDropdownVisible = false;
    },
    closeMobileMenu() {
      this.isMobileMenuVisible = false;
    },
    handleOutsideClick(event) {
      const profile = this.$refs.profile;
      if (profile && !profile.contains(event.target)) {
        this.closeDropdown();
      }
      
      if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.mobile-menu')) {
        this.closeMobileMenu();
      }
    },
    confirmLogout() {
      this.isLogoutConfirmVisible = true;
      this.closeDropdown();
      this.closeMobileMenu();
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
    verifyCar(car) {
      car.isVerified = true;
      alert(`Автомобиль ${car.licensePlate} проверен.`);
    },
    deleteCar(car) {
      if (confirm(`Вы уверены, что хотите удалить автомобиль ${car.licensePlate}?`)) {
        const index = this.cars.findIndex(c => c.licensePlate === car.licensePlate);
        if (index !== -1) {
          this.cars.splice(index, 1);
        }
      }
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth > 768) {
        this.closeMobileMenu();
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
/* Общие стили */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Навигационная панель */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-img {
  width: 50px;
  height: auto;
  margin-right: 10px;
}

.logo-text {
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  font-size: 20px;
  margin-right: 5px;
}

.logo-subtext {
  font-family: 'Poppins', sans-serif;
  color: rgba(0, 66, 129, 0.8);
  font-size: 14px;
  display: none;
}

.desktop-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: rgba(0, 66, 129, 0.8);
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 5px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.menu-item.active {
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  text-decoration: underline;
}

.profile {
  position: relative;
  margin-left: 15px;
}

.profile-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  min-width: 120px;
  overflow: hidden;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px 15px;
  width: 100%;
  text-align: left;
  color: rgba(0, 66, 129, 0.8);
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.3s ease;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(0, 66, 129, 1);
  padding: 5px 10px;
}

/* Мобильное меню */
.mobile-menu {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  background-color: white;
  z-index: 999;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-direction: column;
}

.mobile-menu-item {
  padding: 15px 20px;
  border: none;
  background: none;
  text-align: left;
  color: rgba(0, 66, 129, 0.8);
  font-family: 'Poppins', sans-serif;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.mobile-menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

.mobile-menu-item.active {
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
  background-color: rgba(0, 66, 129, 0.05);
}

.logout-btn {
  color: #ff4d4d;
}

/* Модальное окно выхода */
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
  width: 90%;
  max-width: 400px;
}

.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  transition: background-color 0.3s ease;
  min-width: 80px;
}

.modal-button.confirm {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.modal-button.confirm:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

.modal-button.cancel {
  background-color: #f0f0f0;
  color: #333;
}

.modal-button.cancel:hover {
  background-color: #e0e0e0;
}

/* Секция автомобилей */
.cars-section {
  margin-top: 90px;
  padding: 15px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.cars-section h2 {
  font-family: 'Poppins', sans-serif;
  color: rgba(0, 66, 129, 1);
  margin-bottom: 20px;
  text-align: center;
}

/* Панель поиска */
.search-panel {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: rgba(0, 66, 129, 1);
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 66, 129, 0.2);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 66, 129, 0.6);
}

/* Сортировка */
.sort-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sort-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
  color: #555;
  cursor: pointer;
}

.sort-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: rgba(0, 66, 129, 1);
  cursor: pointer;
}

.gosuslugi-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.3s ease;
}

.gosuslugi-link:hover {
  background-color: rgba(0, 66, 129, 0.9);
}

.gosuslugi-text {
  white-space: nowrap;
}

/* Список автомобилей */
.cars-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.car-item {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.car-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.car-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.car-info-row {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: bold;
  color: rgba(0, 66, 129, 0.8);
  min-width: 80px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
}

.status {
  font-weight: bold;
  color: #d32f2f;
  font-family: 'Poppins', sans-serif;
}

.status.verified {
  color: #388e3c;
}

.car-actions {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-button.verify-button {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.action-button.verify-button:hover {
  background-color: rgba(0, 66, 129, 0.9);
}

.action-button.delete-button {
  background-color: #d32f2f;
  color: white;
}

.action-button.delete-button:hover {
  background-color: #b71c1c;
}

.button-icon {
  font-size: 16px;
}

.button-text {
  white-space: nowrap;
}

.no-cars {
  text-align: center;
  color: #666;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* Адаптивные стили */
@media (min-width: 576px) {
  .car-actions {
    flex-direction: row;
  }
  
  .action-button {
    padding: 10px 15px;
  }
}

@media (min-width: 768px) {
  .navbar {
    height: 80px;
    padding: 10px 30px;
  }
  
  .logo-text {
    font-size: 24px;
  }
  
  .logo-subtext {
    display: inline;
  }
  
  .desktop-menu {
    gap: 15px;
  }
  
  .menu-item {
    font-size: 16px;
    padding: 10px 15px;
  }
  
  .search-panel {
    flex-direction: row;
    align-items: center;
  }
  
  .search-input {
    min-width: 250px;
  }
  
  .sort-controls {
    flex-direction: row;
    align-items: center;
  }
  
  .cars-section {
    margin-top: 100px;
    padding: 20px;
  }
  
  .car-item {
    padding: 20px;
  }
  
  .info-label {
    min-width: 100px;
    font-size: 16px;
  }
  
  .info-value {
    font-size: 16px;
  }
}

@media (min-width: 992px) {
  .logo-text {
    font-size: 28px;
  }
  
  .desktop-menu {
    gap: 20px;
  }
  
  .menu-item {
    font-size: 16px;
    padding: 10px 20px;
  }
  
  .search-input {
    min-width: 300px;
  }
  
  .cars-section {
    padding: 30px;
  }
}

@media (max-width: 767px) {
  .desktop-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .logo-subtext {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar {
    height: 70px;
    padding: 10px 15px;
  }
  
  .logo-img {
    width: 40px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .search-input {
    padding-left: 35px;
  }
  
  .search-icon {
    left: 10px;
  }
  
  .gosuslugi-text {
    display: none;
  }
  
  .cars-section {
    margin-top: 80px;
    padding: 10px;
  }
  
  .modal-content {
    padding: 15px;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
  
  .modal-button {
    width: 100%;
  }
}
</style>