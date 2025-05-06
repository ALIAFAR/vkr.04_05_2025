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
/* Основные стили */
.booking-container {
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 6rem auto 3rem;
  text-align: center;
}

.booking-header {
  margin-bottom: 2.5rem;
}

.booking-header h1 {
  margin-bottom: 0.5rem;
  font-size: 2.25rem;
  color: #004281;
  font-weight: 700;
}

.subtitle {
  color: #6B7280;
  font-size: 1.1rem;
  margin-bottom: 0;
}

/* Список поездок */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.trip-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid #E5E7EB;
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 66, 129, 0.15);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F3F4F6;
}

.route {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.city {
  font-weight: 600;
  font-size: 1.1rem;
  color: #111827;
}

.arrow {
  display: flex;
  align-items: center;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.status-badge.active {
  background: #EFF6FF;
  color: #1D4ED8;
}

.trip-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.9rem;
}

.detail-label svg {
  width: 18px;
  height: 18px;
}

.detail-value {
  font-weight: 500;
  color: #111827;
}

.trip-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.details {
  background: white;
  color: #004281;
  border-color: #004281;
}

.action-btn.details:hover {
  background: #F5F5F5;
}

.action-btn.cancel {
  background: white;
  color: #DC2626;
  border-color: #DC2626;
}

.action-btn.cancel:hover {
  background: #FEF2F2;
}

/* Состояние "нет поездок" */
.no-trips {
  background: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.no-trips h3 {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.no-trips p {
  color: #6B7280;
  margin-bottom: 1.5rem;
}

.cta-button {
  background: #004281;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #003366;
  transform: translateY(-2px);
}

/* Кнопка назад */
.back-button {
  margin-top: 3rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: white;
  background-color: #004281;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 66, 129, 0.2);
}

.back-button:hover {
  background-color: #003366;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 66, 129, 0.25);
}

.back-button svg {
  width: 18px;
  height: 18px;
}

/* Адаптация для планшетов */
@media (max-width: 1024px) {
  .booking-container {
    padding: 1.5rem;
    margin: 5rem auto;
  }
  
  .booking-header h1 {
    font-size: 2rem;
  }
  
  .trips-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .booking-container {
    margin: 7rem auto 2rem;
    padding: 1rem;
  }

  .booking-header h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }

  .trips-grid {
    grid-template-columns: 1fr;
  }
  
  .trip-actions {
    flex-direction: column;
  }
  
  .no-trips {
    padding: 2rem 1.5rem;
  }
  
  .empty-icon {
    width: 100px;
    height: 100px;
  }
}

/* Особые стили для маленьких экранов */
@media (max-width: 480px) {
  .booking-header h1 {
    font-size: 1.5rem;
  }
  
  .city {
    font-size: 1rem;
  }
  
  .detail-label span {
    display: none;
  }
  
  .back-button {
    width: 100%;
    justify-content: center;
  }
}
</style>