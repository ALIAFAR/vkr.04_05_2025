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
        <button class="menu-item active">Пользователи</button>
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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по ФИО"
          class="search-input"
        />
        <div class="sort-controls">
          <label class="sort-checkbox">
            <input type="checkbox" v-model="showUnconfirmedFirst" @change="handleCheckboxChange" />
            Показать неподтверждённых первыми
          </label>
          <button @click="sortByRating" class="sort-button">
            Сортировать по рейтингу {{ sortRatingOrder === 'asc' ? '▲' : '▼' }}
          </button>
          <a href="https://www.gosuslugi.ru/" target="_blank" class="gosuslugi-link">Проверить на Госуслугах</a>
        </div>
      </div>

      <ul v-if="filteredUsers.length > 0">
        <li
          v-for="(user, index) in filteredUsers"
          :key="index"
          class="user-item"
          @click="openUserDetails(user)"
        >
          <div class="user-content">
            <p><strong>ФИО:</strong> {{ user.fullName }}</p>
            <p><strong>Дата рождения:</strong> {{ user.birthDate }}</p>
            <p><strong>Дата получения прав:</strong> {{ user.licenseIssueDate }}</p>
            <p><strong>Серия и номер прав:</strong> {{ user.licenseNumber }}</p>
            <p><strong>Рейтинг:</strong> {{ user.rating }} ⭐</p>
            <p>
              <strong>Статус:</strong>
              <span :class="['status', { confirmed: user.isConfirmed }]">
                {{ user.isConfirmed ? 'Подтверждено' : 'Не подтверждено' }}
              </span>
            </p>
            <p>
              <strong>Автомобиль:</strong>
              {{ user.cars.length > 0 ? user.cars.join(', ') : 'Нет автомобиля' }}
            </p>
          </div>
  <div class="user-actions">
    <!-- Кнопка "Подтвердить данные" -->
    <button @click.stop="approveUser(user)" class="action-button approve-button">
      <span class="button-icon">✔️</span> Подтвердить данные
    </button>
    <!-- Кнопка "Отклонить" -->
    <button @click.stop="rejectUser(user)" class="action-button reject-button">
      <span class="button-icon">❌</span> Отклонить
    </button>
    <!-- Кнопка "Удалить" -->
    <button @click.stop="deleteUser(user)" class="action-button delete-button">
      <span class="button-icon">🗑️</span> Удалить
    </button>
    <!-- Кнопка "Заблокировать" -->
    <button @click.stop="blockUser(user)" class="action-button block-button">
      <span class="button-icon">🚫</span> Заблокировать
    </button>
          </div>
        </li>
      </ul>
      <p v-else class="no-users">Нет пользователей для проверки.</p>
    </div>

    <!-- Модальное окно с поездками пользователя -->
    <div v-if="selectedUser" class="user-details-modal">
      <div class="modal-content">
        <h3>Поездки пользователя: {{ selectedUser.fullName }}</h3>
        <div class="trips-section">
          <h4>Созданные поездки:</h4>
          <ul v-if="selectedUser.createdTrips.length > 0">
            <li v-for="(trip, index) in selectedUser.createdTrips" :key="index" class="trip-item">
              <p><strong>Маршрут:</strong> {{ trip.route }}</p>
              <p><strong>Дата:</strong> {{ trip.date }}</p>
              <p><strong>Статус:</strong> {{ trip.status }}</p>
            </li>
          </ul>
          <p v-else>Нет созданных поездок.</p>
        </div>
        <div class="trips-section">
          <h4>Поездки в роли пассажира:</h4>
          <ul v-if="selectedUser.passengerTrips.length > 0">
            <li v-for="(trip, index) in selectedUser.passengerTrips" :key="index" class="trip-item">
              <p><strong>Маршрут:</strong> {{ trip.route }}</p>
              <p><strong>Дата:</strong> {{ trip.date }}</p>
              <p><strong>Статус:</strong> {{ trip.status }}</p>
            </li>
          </ul>
          <p v-else>Нет поездок в роли пассажира.</p>
        </div>
        <button @click="closeUserDetails" class="modal-button close-button">Закрыть</button>
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
      sortRatingOrder: "desc", // Сортировка по рейтингу
      searchQuery: "", // Поисковый запрос
      selectedUser: null, // Выбранный пользователь для деталей
      showUnconfirmedFirst: false, // Показывать неподтвержденных первыми
    };
  },
  computed: {
    // Фильтрация пользователей по ФИО и сортировка
    filteredUsers() {
      let filtered = this.users.filter((user) => {
        const query = this.searchQuery.toLowerCase();
        return user.fullName.toLowerCase().includes(query);
      });

      // Сортировка по статусу (неподтвержденные первыми)
      if (this.showUnconfirmedFirst) {
        filtered.sort((a, b) => {
          if (a.isConfirmed === b.isConfirmed) return 0;
          return a.isConfirmed ? 1 : -1;
        });
      }

      // Сортировка по рейтингу
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
      // При изменении чекбокса пересортировываем пользователей
      this.filteredUsers;
    },
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
  background-color: #4caf50;
  color: white;
}

.modal-button.confirm:hover {
  background-color: #45a049;
}

.modal-button.cancel {
  background-color: #ff4d4d;
  color: white;
}

.modal-button.cancel:hover {
  background-color: #cc0000;
}

/* Секция пользователей (улучшена) */
.users-section {
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
  cursor: pointer;
}

.sort-button {
  padding: 10px 20px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.sort-button:hover {
  background-color: rgba(0, 66, 129, 0.8);
}

.gosuslugi-link {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.gosuslugi-link:hover {
  background-color: #45a049;
}

.user-item {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: }

.user-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.user-content p {
  margin: 5px 0;
  color: #333;
}

.status {
  color: #ff4d4d;
  font-weight: bold;
}

.status.confirmed {
  color: #4caf50;
}

.user-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

.action-button.approve-button {
  background-color: #4caf50;
  color: white;
}

.action-button.approve-button:hover {
  background-color: #45a049;
}

.action-button.reject-button {
  background-color: #ff4d4d;
  color: white;
}

.action-button.reject-button:hover {
  background-color: #cc0000;
}

.action-button.delete-button {
  background-color: #666;
  color: white;
}

.action-button.delete-button:hover {
  background-color: #555;
}

.action-button.block-button {
  background-color: #ff4d4d;
  color: white;
}

.action-button.block-button:hover {
  background-color: #cc0000;
}

.button-icon {
  font-size: 16px;
}

.no-users {
  text-align: center;
  color: #666;
  font-size: 18px;
  margin-top: 20px;
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
}

.user-details-modal .modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-details-modal h3 {
  margin-bottom: 20px;
  font-size: 24px;
  color: rgba(0, 66, 129, 1);
}

.trips-section {
  margin-bottom: 20px;
}

.trips-section h4 {
  font-size: 18px;
  color: rgba(0, 66, 129, 1);
  margin-bottom: 10px;
}

.trip-item {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.trip-item p {
  margin: 5px 0;
  color: #333;
}

.close-button {
  background-color: rgba(0, 66, 129, 1);
  color: white;
  margin-top: 20px;
}

.close-button:hover {
  background-color: rgba(0, 66, 129, 0.8);
}
</style>