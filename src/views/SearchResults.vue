<template>
  <div>
    <AppNavbar />

    <div class="search-results">
      <h1>Результаты поиска</h1>

      <!-- Контейнер с параметрами поиска -->
      <div class="search-params-container">
        <div class="search-params">
          <p><strong>Откуда:</strong> {{ searchParams.from }}</p>
          <p><strong>Куда:</strong> {{ searchParams.to }}</p>
          <p><strong>Дата:</strong> {{ formatDate(searchParams.date) }}</p>
          <p><strong>Мест:</strong> {{ searchParams.passengers }}</p>
        </div>
      </div>

      <!-- Сортировка -->
      <div class="sort-controls">
        <label>Сортировать по:</label>
        <select v-model="sortBy" @change="sortTrips">
          <option value="default">По умолчанию</option>
          <option value="experience">Стажу вождения</option>
          <option value="rating">Рейтингу</option>
          <option value="price-asc">Цене (по возрастанию)</option>
          <option value="price-desc">Цене (по убыванию)</option>
        </select>
      </div>

      <!-- Список поездок -->
      <div class="trip-list">
        <div v-if="trips.length === 0" class="no-trips">
          Нет подходящих поездок.
        </div>
        <div v-else>
          <div v-for="(trip, index) in sortedTrips" :key="index" class="trip-item">
            <div class="trip-header">
              <div class="driver-info">
                <div class="driver-name">
                  {{ trip.driver_name }} {{ trip.driver_surname }}
                </div>
                <div class="driver-rating">
                  <span class="rating-value">{{ trip.driver_rating || 'Нет оценки' }}</span>
                  <span class="star">★</span>
                </div>
              </div>
              <div class="car-info">
                {{ trip.car_brand }} {{ trip.car_mark }}
              </div>
            </div>

            <div class="trip-details">
              <div class="detail-row">
                <div class="detail-label">Стаж вождения:</div>
                <div class="detail-value">{{ calculateDrivingExperience(trip.license_issue_date) }}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Маршрут:</div>
                <div class="detail-value">{{ trip.departure_location }} → {{ trip.arrival_location }}</div>
              </div>

              <div v-if="trip.stops" class="detail-row">
                <div class="detail-label">Остановки:</div>
                <div class="detail-value">{{ trip.stops }}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Отправление:</div>
                <div class="detail-value">{{ formatDateTime(trip.departure_time) }}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Прибытие:</div>
                <div class="detail-value">{{ formatDateTime(trip.arrival_time) }}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Время в пути:</div>
                <div class="detail-value">{{ calculateTravelTime(trip.departure_time, trip.arrival_time) }}</div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Свободных мест:</div>
                <div class="detail-value">{{ trip.available_seats }}</div>
              </div>

              <div class="detail-row price-row">
                <div class="detail-label">Стоимость:</div>
                <div class="detail-value price">{{ trip.cost }} ₽</div>
              </div>
            </div>

            <button 
              class="btn-primary"
              @click="bookTrip(trip)"
              :disabled="trip.available_seats < searchParams.passengers"
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>

      <div class="back-button-container">
        <button class="btn-secondary" @click="goBack">
          Вернуться к поиску
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from 'js-cookie';

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      searchParams: {
        departure_location: '',
        arrival_location: '',
        trip_date: '',
        seats_needed: 1
      },
      trips: [],
      sortedTrips: [],
      sortBy: 'default',
      loading: false,
      error: null
    };
  },
  async created() {
    await this.loadSearchParams();
    await this.fetchTrips();
  },
  methods: {
    async loadSearchParams() {
      const params = Cookies.get('searchParams');
      if (params) {
        this.searchParams = JSON.parse(params);
        console.log("Параметры из cookies:", this.searchParams);
        
        this.searchParams = {
          from: this.searchParams.from || this.searchParams.departure_location,
          to: this.searchParams.to || this.searchParams.arrival_location,
          date: this.searchParams.date || this.searchParams.trip_date,
          passengers: this.searchParams.passengers || this.searchParams.seats_needed || 1
        };
      }
    },
    async fetchTrips() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('http://localhost:5000/api/trip/searchResult', {
          params: {
            departure_location: this.searchParams.from,
            arrival_location: this.searchParams.to,
            trip_date: this.searchParams.date,
            seats_needed: this.searchParams.passengers
          }
        });
        
        this.trips = response.data;
        this.sortedTrips = [...this.trips];
      } catch (error) {
        console.error('Ошибка при загрузке поездок:', error);
        this.error = 'Не удалось загрузить результаты поиска';
      } finally {
        this.loading = false;
      }
    },
    sortTrips() {
      switch(this.sortBy) {
        case 'experience':
          this.sortedTrips.sort((a, b) => {
            const aExp = new Date(a.license_issue_date).getFullYear();
            const bExp = new Date(b.license_issue_date).getFullYear();
            return bExp - aExp; // Сначала более опытные
          });
          break;
        case 'rating':
          this.sortedTrips.sort((a, b) => {
            const aRating = a.driver_rating || 0;
            const bRating = b.driver_rating || 0;
            return bRating - aRating; // Сначала с более высоким рейтингом
          });
          break;
        case 'price-asc':
          this.sortedTrips.sort((a, b) => a.cost - b.cost);
          break;
        case 'price-desc':
          this.sortedTrips.sort((a, b) => b.cost - a.cost);
          break;
        default:
          this.sortedTrips = [...this.trips]; // Сброс к исходному порядку
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    formatDateTime(datetimeString) {
      if (!datetimeString) return '';
      const date = new Date(datetimeString);
      return date.toLocaleString('ru-RU');
    },
    calculateDrivingExperience(licenseDate) {
      if (!licenseDate) return 'Не указано';
      
      const licenseYear = new Date(licenseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const experience = currentYear - licenseYear;
      
      if (experience === 0) return 'Менее года';
      return `${experience} ${this.declension(experience, ['год', 'года', 'лет'])}`;
    },
    calculateTravelTime(departure, arrival) {
      if (!departure || !arrival) return '';
      
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diff = arr - dep;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours} ч ${minutes} мин`;
    },
    declension(number, titles) {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[
        number % 100 > 4 && number % 100 < 20 
          ? 2 
          : cases[number % 10 < 5 ? number % 10 : 5]
      ];
    },
    async bookTrip(trip) {
      try {
        const token = Cookies.get('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }

        const response = await axios.post(
          `http://localhost:5000/api/trips/${trip.id}/book`,
          {
            seats: this.searchParams.passengers
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log(response.data);
        alert('Поездка успешно забронирована!');
        this.fetchTrips();
      } catch (error) {
        console.error('Ошибка бронирования:', error);
        alert('Ошибка при бронировании: ' + (error.response?.data?.message || error.message));
      }
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.search-results {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.search-params-container {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.sort-controls {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls label {
  font-weight: bold;
}

.sort-controls select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.trip-list {
  margin-top: 20px;
}

.trip-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.driver-info {
  display: flex;
  flex-direction: column;
}

.driver-name {
  font-weight: bold;
  font-size: 1.1em;
}

.driver-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ffc107;
}

.rating-value {
  color: #333;
}

.star {
  font-size: 1.2em;
}

.car-info {
  color: #666;
  font-style: italic;
}

.trip-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: bold;
  color: #555;
}

.detail-value {
  text-align: right;
}

.price-row {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #ddd;
}

.price {
  font-weight: bold;
  color:  #004281;
  font-size: 1.1em;
}

.btn-primary {
  background-color:  #004281;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 1em;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color:  #004281;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color:  #004281;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color:  #004281;
}

.back-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.no-trips {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>