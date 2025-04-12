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
        <button class="menu-item active">Автомобили</button>

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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по госномеру"
          class="search-input"
        />
        <div class="sort-controls">
          <label class="sort-checkbox">
            <input type="checkbox" v-model="sortByUnverified" />
            Сначала непроверенные
          </label>
          <a href="https://www.gosuslugi.ru/" target="_blank" class="gosuslugi-link">Проверить на Госуслугах</a>
        </div>
      </div>

      <ul v-if="filteredCars.length > 0">
        <li v-for="car in filteredCars" :key="car.licensePlate" class="car-item">
          <div class="car-content">
            <p><strong>Госномер:</strong> {{ car.licensePlate }}</p>
            <p><strong>СТС:</strong> {{ car.sts }}</p>
            <p><strong>Марка:</strong> {{ car.brand }}</p>
            <p><strong>Модель:</strong> {{ car.model }}</p>
            <p>
              <strong>Статус:</strong>
              <span :class="['status', { verified: car.isVerified }]">
                {{ car.isVerified ? 'Проверено' : 'Не проверено' }}
              </span>
            </p>
          </div>
          <div class="car-actions">
            <!-- Кнопка "Проверено" -->
            <button @click.stop="verifyCar(car)" class="action-button verify-button">
              <span class="button-icon">✔️</span> Проверено
            </button>
            <!-- Кнопка "Удалить" -->
            <button @click.stop="deleteCar(car)" class="action-button delete-button">
              <span class="button-icon">🗑️</span> Удалить
            </button>
          </div>
        </li>
      </ul>
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
      searchQuery: "", // Поисковый запрос
      sortByUnverified: false, // Сортировка по статусу (непроверенные сначала)
    };
  },
  computed: {
    // Фильтрация автомобилей по госномеру
    filteredCars() {
      let filtered = this.cars.filter((car) => {
        const query = this.searchQuery.toLowerCase();
        return car.licensePlate.toLowerCase().includes(query);
      });

      // Сортировка по статусу (непроверенные сначала)
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
      this.$router.push("/operator-panel");
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
    verifyCar(car) {
      car.isVerified = true;
      alert(`Автомобиль ${car.licensePlate} проверен.`);
    },
    deleteCar(car) {
      const index = this.cars.findIndex(c => c.licensePlate === car.licensePlate);
      if (index !== -1) {
        this.cars.splice(index, 1);
        alert(`Автомобиль ${car.licensePlate} удален.`);
      }
    },
  },
};
</script>

<style scoped>
/* Навигационная панель (оставлена без изменений) */
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

.menu-item.active {
  font-weight: bold;
  text-decoration: underline;
}

/* Профиль (оставлен прежним) */
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
  background-color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Модальное окно для подтверждения выхода */
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
  z-index: 1001;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.modal-button.confirm {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.modal-button.confirm:hover {
  background-color: rgba(0, 66, 129, 1);
}

.modal-button.cancel {
  background-color: #8b0f0f;
  color: white;
}

.modal-button.cancel:hover {
  background-color: #8b0f0f;
}

/* Секция для проверки автомобилей */
.cars-section {
  margin-top: 100px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.search-panel {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: rgba(0, 66, 129, 1);
  outline: none;
}

.sort-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.sort-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.gosuslugi-link {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.gosuslugi-link:hover {
  background-color: rgba(0, 66, 129, 1);
}

.car-item {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.car-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.car-content p {
  margin: 5px 0;
  color: #333;
}

.status {
  color: #7e1818;
  font-weight: bold;
}

.status.verified {
  color:rgba(0, 66, 129, 1);
}

.car-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.action-button.verify-button {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.action-button.verify-button:hover {
  background-color: rgba(0, 66, 129, 1);
}

.action-button.delete-button {
  background-color: #810909;
  color: white;
}

.action-button.delete-button:hover {
  background-color: #810909;
}

.button-icon {
  font-size: 16px;
}

.no-cars {
  text-align: center;
  color: #666;
  font-size: 18px;
  margin-top: 20px;
}
</style>