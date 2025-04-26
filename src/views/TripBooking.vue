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
/* Основные стили для всех устройств */
.booking-container {
  padding: 2rem;
  max-width: 800px;
  margin: 6rem auto;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 66, 129, 0.1);
}

.booking-header h1 {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: #004281;
  font-weight: 600;
}

.booking-list {
  margin-top: 1.5rem;
}

.trip-item {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 66, 129, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 66, 129, 0.1);
}

.trip-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 66, 129, 0.15);
}

.detail-item {
  margin-bottom: 0.75rem;
  text-align: left;
  display: flex;
  justify-content: space-between;
}

.detail-item p {
  margin: 0;
  font-weight: 600;
  color: #004281;
  font-size: 0.95rem;
}

.detail-item span {
  font-size: 0.95rem;
  color: #4a5568;
  text-align: right;
}

.no-trips {
  font-size: 1.1rem;
  color: #4a5568;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 66, 129, 0.08);
  border: 1px dashed rgba(0, 66, 129, 0.2);
}

.back-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #ffffff;
  background-color: #004281;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 66, 129, 0.2);
}

.back-button:hover {
  background-color: #003366;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 66, 129, 0.25);
}

/* Адаптация для планшетов */
@media (max-width: 1024px) {
  .booking-container {
    margin: 5rem auto;
    padding: 1.5rem;
    max-width: 90%;
  }
  
  .booking-header h1 {
    font-size: 1.75rem;
  }
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .booking-container {
    margin: 7rem auto 3rem;
    padding: 1.25rem;
    width: 95%;
    border-radius: 12px;
  }

  .booking-header h1 {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .trip-item {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    border-left: 4px solid #004281;
  }

  .detail-item {
    flex-direction: column;
    margin-bottom: 0.5rem;
  }

  .detail-item p,
  .detail-item span {
    width: 100%;
    text-align: left;
    font-size: 0.9rem;
  }

  .detail-item span {
    margin-top: 0.25rem;
    color: #4a5568;
  }

  .back-button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.95rem;
  }
}

/* Особые стили для маленьких экранов */
@media (max-width: 480px) {
  .booking-container {
    margin: 6rem auto 2rem;
    padding: 1rem;
  }

  .booking-header h1 {
    font-size: 1.3rem;
  }

  .trip-item {
    padding: 1rem;
  }

  .no-trips {
    padding: 1rem;
    font-size: 1rem;
  }
}

/* Ориентация landscape */
@media (max-width: 768px) and (orientation: landscape) {
  .booking-container {
    margin: 5rem auto 2rem;
  }
  
  .detail-item {
    flex-direction: row;
  }
}
</style>