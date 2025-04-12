<template>
  <div>
    <AppNavbar />

    <div class="trip-details">
      <div class="details-header">
        <h1>Мои опубликованные поездки</h1>
      </div>

      <!-- Список поездок -->
      <div class="trip-list">
        <div v-if="userTrips.length === 0" class="no-trips">
          У вас нет опубликованных поездок.
        </div>
        <div v-else>
          <div v-for="(trip, index) in userTrips" :key="index" class="trip-item">
            <div class="detail-item">
              <p><strong>Откуда:</strong></p>
              <span>{{ trip.departure_location }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Куда:</strong></p>
              <span>{{ trip.arrival_location }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Дата отбытия:</strong></p>
              <span>{{ formatDate(trip.departure_time) }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Время отбытия:</strong></p>
              <span>{{ formatTime(trip.departure_time) }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Пассажиры:</strong></p>
              <span>{{ trip.seats }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Остановки:</strong></p>
              <span>{{ trip.stops.join(', ') }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Статус:</strong></p>
              <span>
                {{ trip.trip_status === 'active' ? 'Активный' : trip.trip_status === 'last' ? 'Завершенный' : trip.trip_status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка для возврата на главную страницу -->
      <button class="back-button" @click="goToHome">
        Вернуться на главную
      </button>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from 'axios';
import Cookies from 'js-cookie'; // Импортируем библиотеку для работы с куками

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      userTrips: [], // Список поездок, опубликованных пользователем
    };
  },
  created() {
    // Загружаем поездки при создании компонента
    this.loadUserTrips();
  },
  methods: {
    // Загрузка поездок пользователя с сервера
    async loadUserTrips() {
      try {
        // Получаем токен из куки
        const token = Cookies.get('token');

        // Если токен отсутствует, пользователь не авторизован
        if (!token) {
          console.error("Токен отсутствует. Пользователь не авторизован.");
          return;
        }

        // Делаем запрос на сервер с использованием axios
        const response = await axios.get("http://localhost:5000/api/trip/search", {
          headers: {
            Authorization: `Bearer ${token}`, // Передаем токен в заголовке
          },
          withCredentials: true, // Включаем передачу куки (если нужно)
        });

        // Сохраняем поездки в data
        this.userTrips = response.data.data;
      } catch (error) {
        console.error("Ошибка при загрузке поездок:", error);
        this.userTrips = []; // Очищаем список поездок в случае ошибки
      }
    },

    // Форматирование даты
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    // Форматирование времени
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString();
    },

    // Возврат на главную страницу
    goToHome() {
      this.$router.push("/"); // Переход на главную страницу
    },
  },
};
</script>

<style scoped>
.trip-details {
  padding: 20px;
  max-width: 800px;
  margin: 100px auto;
  text-align: center;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.details-header h1 {
  margin-bottom: 20px;
  font-size: 28px;
  color: #004281;
}

.trip-list {
  margin-top: 20px;
}

.trip-item {
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trip-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.detail-item {
  margin-bottom: 10px;
  text-align: left;
}

.detail-item p {
  margin: 0;
  font-weight: bold;
  color: #004281;
}

.detail-item span {
  font-size: 14px;
  color: #555;
}

.no-trips {
  font-size: 18px;
  color: #555;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 16px;
  color: #fff;
  background-color: #004281;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #003365;
}
</style>

<style scoped>
.trip-details {
  padding: 20px;
  max-width: 800px;
  margin: 100px auto;
  text-align: center;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.details-header h1 {
  margin-bottom: 20px;
  font-size: 28px;
  color: #004281;
}

.trip-list {
  margin-top: 20px;
}

.trip-item {
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trip-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.detail-item {
  margin-bottom: 10px;
  text-align: left;
}

.detail-item p {
  margin: 0;
  font-weight: bold;
  color: #004281;
}

.detail-item span {
  font-size: 14px;
  color: #555;
}

.no-trips {
  font-size: 18px;
  color: #555;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 16px;
  color: #fff;
  background-color: #004281;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #003365;
}
</style>

<style scoped>
.trip-details {
  padding: 20px;
  max-width: 600px;
  margin: 140px auto 0;
  text-align: center;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.details-header h1 {
  margin-bottom: 20px;
  font-size: 28px;
  color: #004281;
}

.filters {
  margin-bottom: 20px;
  text-align: left;
}

.filter-item {
  margin-bottom: 15px;
}

.filter-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #003365;
}

.filter-item input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.filter-button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #004281;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.filter-button:hover {
  background-color: #003365;
}

.trip-list {
  margin-top: 20px;
}

.trip-item {
  padding: 15px;
  margin-bottom: 15px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-item {
  margin-bottom: 10px;
  text-align: left;
  font-size: 16px;
}

.detail-item p {
  margin: 0;
  color: #003365;
}

.detail-item span {
  font-size: 14px;
  color: #555;
}

.no-trips {
  font-size: 18px;
  color: #555;
}

.back-button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #004281;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #003365;
}
</style>

<style scoped>
.trip-details {
  padding: 10px;
  max-width: 500px;
  margin: 140px auto 0;
  text-align: center;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.details-header h1 {
  margin-bottom: 20px;
  font-size: 28px;
  color: #004281;
}

.details-container {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
  text-align: left;
  font-size: 18px;
}

.detail-item p {
  margin: 0;
  color: #003365;
}

.detail-item span {
  font-size: 16px;
  color: #555;
}

.back-button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #004281;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #003365;
}
</style>
