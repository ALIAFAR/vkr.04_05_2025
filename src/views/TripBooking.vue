<template>
  <div>
    <AppNavbar />

    <div class="booking-container">
      <div class="booking-header">
        <h1>Мои забронированные поездки</h1>
      </div>

      <!-- Список забронированных поездок -->
      <div class="booking-list">
        <div v-if="bookedTrips.length === 0" class="no-trips">
          У вас нет забронированных поездок.
        </div>
        <div v-else>
          <div v-for="(trip, index) in bookedTrips" :key="index" class="trip-item">
            <div class="detail-item">
              <p><strong>Откуда:</strong></p>
              <span>{{ trip.from }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Куда:</strong></p>
              <span>{{ trip.to }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Дата отбытия:</strong></p>
              <span>{{ trip.departureDate }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Время отбытия:</strong></p>
              <span>{{ trip.departureTime }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Пассажиры:</strong></p>
              <span>{{ trip.passengers }}</span>
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

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      bookedTrips: [], // Список забронированных поездок
    };
  },
  created() {
    // Загружаем забронированные поездки при создании компонента
    this.loadBookedTrips();
  },
  methods: {
    // Загрузка забронированных поездок с сервера
    async loadBookedTrips() {
      try {
        // Получаем токен авторизации (например, из localStorage)
        const token = localStorage.getItem("authToken");

        // Если токен отсутствует, пользователь не авторизован
        if (!token) {
          console.error("Пользователь не авторизован");
          return;
        }

        // Делаем запрос на сервер
        const response = await fetch("https://api.yourserver.com/booked-trips", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Передаем токен в заголовке
          },
        });

        // Проверяем статус ответа
        if (!response.ok) {
          throw new Error("Ошибка при загрузке забронированных поездок");
        }

        // Парсим JSON-ответ
        const data = await response.json();

        // Сохраняем забронированные поездки в data
        this.bookedTrips = data.bookedTrips;
      } catch (error) {
        console.error("Ошибка при загрузке забронированных поездок:", error);
        this.bookedTrips = []; // Очищаем список в случае ошибки
      }
    },

    // Возврат на главную страницу
    goToHome() {
      this.$router.push("/"); // Переход на главную страницу
    },
  },
};
</script>

<style scoped>
.booking-container {
  padding: 20px;
  max-width: 800px;
  margin: 100px auto;
  text-align: center;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.booking-header h1 {
  margin-bottom: 20px;
  font-size: 28px;
  color: #004281;
}

.booking-list {
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