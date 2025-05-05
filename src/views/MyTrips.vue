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
        const response = await axios.get("https://unigo.onrender.com/api/trip/search", {
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
/* Основные стили для всех устройств */
.trip-details {
  padding: 2rem;
  max-width: 800px;
  margin: 6rem auto;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 66, 129, 0.1);
}

.details-header h1 {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: #004281;
  font-weight: 600;
}

.trip-list {
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
  .trip-details {
    margin: 5rem auto;
    padding: 1.5rem;
    max-width: 90%;
  }
  
  .details-header h1 {
    font-size: 1.75rem;
  }
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .trip-details {
    margin: 7rem auto 3rem;
    padding: 1.25rem;
    width: 95%;
    border-radius: 12px;
  }

  .details-header h1 {
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

  /* Особые стили для маленьких экранов */
  @media (max-width: 480px) {
    .trip-details {
      margin: 6rem auto 2rem;
      padding: 1rem;
    }

    .details-header h1 {
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
    .trip-details {
      margin: 5rem auto 2rem;
    }
    
    .detail-item {
      flex-direction: row;
    }
  }
}
</style>