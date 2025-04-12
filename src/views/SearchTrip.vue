<template>
  <AppNavbar />

    <div>
      <!-- Сообщение, если поездок нет -->
      <p v-if="trips.length === 0" class="no-trips-message">
        Нет доступных поездок.
      </p>

      <!-- Список поездок -->
      <ul v-if="trips.length > 0">
        <li v-for="trip in trips" :key="trip.id">
          {{ trip.from }} → {{ trip.to }} ({{ trip.date }})
        </li>
      </ul>

      <!-- Сообщение об ошибке -->
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AppNavbar from "@/components/AppNavbar.vue"; // Скорректирован путь

export default {
  components: {
    AppNavbar,
  },
  computed: {
    ...mapGetters(["allTrips"]), // Подключаем геттер allTrips из Vuex
    trips() {
      return this.allTrips || []; // Возвращаем список поездок из Vuex, если он пустой, возвращаем пустой массив
    },
  },
  data() {
    return {
      errorMessage: "", // Хранит сообщение об ошибке
      isProfileDropdownVisible: false, // Состояние для отображения выпадающего меню профиля
    };
  },
  methods: {
    ...mapActions(["fetchTrips"]), // Подключаем экшен fetchTrips из Vuex

    async loadTrips() {
      this.errorMessage = ""; // Сброс ошибки при новой загрузке
      try {
        await this.fetchTrips(); // Загружаем поездки через экшен
      } catch (error) {
        this.errorMessage = "Не удалось загрузить поездки. Попробуйте позже."; // Обработка ошибки
      }
    },
    toggleProfileDropdown() {
      this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
    },
    // Добавьте дополнительные методы для переходов (goToMyTrips, goToPublishTrip, etc.)
  },
};
</script>

<style scoped>
/* Навигационная панель */
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
  font-size: 36px; /* Увеличенный размер шрифта */
  font-family: 'Poppins', sans-serif; /* Пример красивого шрифта */
  font-weight: bold; /* Сделать шрифт жирным */
  color: rgba(0, 66, 129, 1); /* Цвет шрифта */
}

/* Подключение шрифта Lora */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;700&display=swap');

.logo-img {
  height: 40px;
  margin-right: 20px;
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
  color: black;
  box-shadow: 0px 4px 6px rgba(0, 66, 129, 0.8);
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
}
.no-trips-message {
  color: #888;
  font-style: italic;
  margin-top: 20px; /* Добавляем отступ сверху */
}
</style>
