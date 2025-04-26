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
        <button class="menu-item active">Пользователи</button>
        <button class="menu-item" @click="goToCars">Автомобили</button>

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
      <button class="mobile-menu-item active">Пользователи</button>
      <button class="mobile-menu-item" @click="goToCars">Автомобили</button>
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

    <!-- Секция для пользователей -->
    <div class="users-section">
      <h2>Пользователи</h2>

      <!-- Панель поиска и сортировки -->
      <div class="search-panel">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по ФИО"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="sort-controls">
          <label class="sort-checkbox">
            <input type="checkbox" v-model="showUnconfirmedFirst" @change="handleCheckboxChange" />
            <span class="checkbox-label">Неподтверждённые</span>
          </label>
          <button @click="sortByRating" class="sort-button">
            <span class="button-icon">⭐</span>
            <span class="button-text">Рейтинг {{ sortRatingOrder === 'asc' ? '▲' : '▼' }}</span>
          </button>
          <a href="https://www.gosuslugi.ru/" target="_blank" class="gosuslugi-link">
            <span class="gosuslugi-icon">📋</span>
            <span class="gosuslugi-text">Госуслуги</span>
          </a>
        </div>
      </div>

      <div v-if="filteredUsers.length > 0" class="users-list">
        <div v-for="(user, index) in filteredUsers" :key="index" class="user-item">
          <div class="user-content" @click="openUserDetails(user)">
            <div class="user-info-row">
              <span class="info-label">ФИО:</span>
              <span class="info-value">{{ user.fullName }}</span>
            </div>
            <div class="user-info-row">
              <span class="info-label">Дата рождения:</span>
              <span class="info-value">{{ user.birthDate }}</span>
            </div>
            <div class="user-info-row">
              <span class="info-label">Дата прав:</span>
              <span class="info-value">{{ user.licenseIssueDate }}</span>
            </div>
            <div class="user-info-row">
              <span class="info-label">Права:</span>
              <span class="info-value">{{ user.licenseNumber }}</span>
            </div>
            <div class="user-info-row">
              <span class="info-label">Рейтинг:</span>
              <span class="info-value">{{ user.rating }} ⭐</span>
            </div>
            <div class="user-info-row">
              <span class="info-label">Статус:</span>
              <span :class="['status', { confirmed: user.isConfirmed }]">
                {{ user.isConfirmed ? 'Подтверждено' : 'Не подтверждено' }}
              </span>
            </div>
            <div class="user-info-row">
              <span class="info-label">Автомобиль:</span>
              <span class="info-value">{{ user.cars.length > 0 ? user.cars.join(', ') : 'Нет' }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button @click.stop="approveUser(user)" class="action-button approve-button" title="Подтвердить">
              <span class="button-icon">✔️</span>
              <span class="button-text">Подтвердить</span>
            </button>
            <button @click.stop="rejectUser(user)" class="action-button reject-button" title="Отклонить">
              <span class="button-icon">❌</span>
              <span class="button-text">Отклонить</span>
            </button>
            <button @click.stop="deleteUser(user)" class="action-button delete-button" title="Удалить">
              <span class="button-icon">🗑️</span>
              <span class="button-text">Удалить</span>
            </button>
            <button @click.stop="blockUser(user)" class="action-button block-button" title="Заблокировать">
              <span class="button-icon">🚫</span>
              <span class="button-text">Блок</span>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="no-users">Нет пользователей для проверки.</p>
    </div>

    <!-- Модальное окно с поездками пользователя -->
    <div v-if="selectedUser" class="user-details-modal">
      <div class="modal-content">
        <h3>Поездки: {{ selectedUser.fullName }}</h3>
        <button class="modal-close" @click="closeUserDetails">×</button>
        <div class="trips-section">
          <h4>Созданные поездки:</h4>
          <ul v-if="selectedUser.createdTrips.length > 0" class="trips-list">
            <li v-for="(trip, index) in selectedUser.createdTrips" :key="index" class="trip-item">
              <p><strong>Маршрут:</strong> {{ trip.route }}</p>
              <p><strong>Дата:</strong> {{ trip.date }}</p>
              <p><strong>Статус:</strong> {{ trip.status }}</p>
            </li>
          </ul>
          <p v-else>Нет созданных поездок.</p>
        </div>
        <div class="trips-section">
          <h4>Поездки пассажиром:</h4>
          <ul v-if="selectedUser.passengerTrips.length > 0" class="trips-list">
            <li v-for="(trip, index) in selectedUser.passengerTrips" :key="index" class="trip-item">
              <p><strong>Маршрут:</strong> {{ trip.route }}</p>
              <p><strong>Дата:</strong> {{ trip.date }}</p>
              <p><strong>Статус:</strong> {{ trip.status }}</p>
            </li>
          </ul>
          <p v-else>Нет поездок пассажиром.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [
        {
          fullName: "Иванов Иван Иванович",
          birthDate: "15.05.1990",
          licenseIssueDate: "10.09.2015",
          licenseNumber: "1234 567890",
          rating: 4.5,
          isConfirmed: false,
          cars: ["Toyota Camry", "Honda Civic"],
          createdTrips: [
            { route: "Москва → Санкт-Петербург", date: "10.10.2023", status: "Завершено" },
          ],
          passengerTrips: [
            { route: "Казань → Уфа", date: "15.10.2023", status: "В процессе" },
          ],
        },
        {
          fullName: "Петров Петр Петрович",
          birthDate: "20.11.1985",
          licenseIssueDate: "05.03.2010",
          licenseNumber: "9876 543210",
          rating: 3.8,
          isConfirmed: true,
          cars: [],
          createdTrips: [],
          passengerTrips: [
            { route: "Новосибирск → Омск", date: "20.10.2023", status: "Завершено" },
          ],
        },
        {
          fullName: "Сидорова Мария Сергеевна",
          birthDate: "30.07.1995",
          licenseIssueDate: "12.12.2018",
          licenseNumber: "4567 890123",
          rating: 5.0,
          isConfirmed: false,
          cars: ["Ford Focus"],
          createdTrips: [
            { route: "Екатеринбург → Челябинск", date: "25.10.2023", status: "В процессе" },
          ],
          passengerTrips: [],
        },
      ],
      isProfileDropdownVisible: false,
      isLogoutConfirmVisible: false,
      isMobileMenuVisible: false,
      sortRatingOrder: "desc",
      searchQuery: "",
      selectedUser: null,
      showUnconfirmedFirst: false,
      windowWidth: window.innerWidth
    };
  },
  computed: {
    filteredUsers() {
      let filtered = this.users.filter((user) => {
        const query = this.searchQuery.toLowerCase();
        return user.fullName.toLowerCase().includes(query);
      });

      if (this.showUnconfirmedFirst) {
        filtered.sort((a, b) => {
          if (a.isConfirmed === b.isConfirmed) return 0;
          return a.isConfirmed ? 1 : -1;
        });
      }

      if (this.sortRatingOrder === "asc") {
        filtered.sort((a, b) => a.rating - b.rating);
      } else {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      return filtered;
    },
  },
  methods: {
    handleCheckboxChange() {
      this.filteredUsers;
    },
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
    approveUser(user) {
      user.isConfirmed = true;
      alert(`Данные пользователя ${user.fullName} подтверждены.`);
    },
    rejectUser(user) {
      user.isConfirmed = false;
      alert(`Данные пользователя ${user.fullName} отклонены.`);
    },
    deleteUser(user) {
      const index = this.users.findIndex(u => u === user);
      if (index !== -1) {
        this.users.splice(index, 1);
        alert(`Пользователь ${user.fullName} удален.`);
      }
    },
    blockUser(user) {
      user.isBlocked = true;
      alert(`Пользователь ${user.fullName} заблокирован.`);
    },
    sortByRating() {
      this.sortRatingOrder = this.sortRatingOrder === "asc" ? "desc" : "asc";
    },
    openUserDetails(user) {
      this.selectedUser = user;
    },
    closeUserDetails() {
      this.selectedUser = null;
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

/* Секция пользователей */
.users-section {
  margin-top: 90px;
  padding: 15px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.users-section h2 {
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

.sort-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sort-button:hover {
  background-color: rgba(0, 66, 129, 0.9);
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

/* Список пользователей */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-item {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  cursor: pointer;
}

.user-info-row {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: bold;
  color: rgba(0, 66, 129, 0.8);
  min-width: 100px;
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

.user-actions {
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

.action-button.approve-button {
  background-color: rgba(0, 66, 129, 1);
  color: white;
}

.action-button.approve-button:hover {
  background-color: rgba(0, 66, 129, 0.9);
}

.action-button.reject-button {
  background-color: #d32f2f;
  color: white;
}

.action-button.reject-button:hover {
  background-color: #b71c1c;
}

.action-button.delete-button {
  background-color: #666;
  color: white;
}

.action-button.delete-button:hover {
  background-color: #555;
}

.action-button.block-button {
  background-color: #d32f2f;
  color: white;
}

.action-button.block-button:hover {
  background-color: #b71c1c;
}

.button-icon {
  font-size: 16px;
}

.button-text {
  white-space: nowrap;
}

.no-users {
  text-align: center;
  color: #666;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* Модальное окно с поездками пользователя */
.user-details-modal {
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
  padding: 15px;
}

.user-details-modal .modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.user-details-modal h3 {
  margin-bottom: 15px;
  font-size: 20px;
  color: rgba(0, 66, 129, 1);
  padding-right: 30px;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.trips-section {
  margin-bottom: 15px;
}

.trips-section h4 {
  font-size: 16px;
  color: rgba(0, 66, 129, 1);
  margin-bottom: 10px;
}

.trips-list {
  list-style: none;
  padding: 0;
}

.trip-item {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 14px;
}

.trip-item p {
  margin: 3px 0;
}

/* Адаптивные стили */
@media (min-width: 576px) {
  .user-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .action-button {
    flex: 1;
    min-width: 120px;
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
  
  .users-section {
    margin-top: 100px;
    padding: 20px;
  }
  
  .user-item {
    padding: 20px;
  }
  
  .info-label {
    min-width: 120px;
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
  
  .users-section {
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
  
  .gosuslugi-text, .button-text {
    display: none;
  }
  
  .users-section {
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
  
  .info-label {
    min-width: 90px;
  }
}
</style>