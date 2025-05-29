<template>
  <div>
    <AppNavbar />

    <div class="booking-details">
      <div class="details-header">
        <h1>Мои забронированные поездки</h1>
        <button class="refresh-button" @click="loadBookedTrips" aria-label="Обновить список поездок">
          Обновить
        </button>
      </div>

      <!-- Loading Indicator -->
      <div v-if="loading" class="loading-state">
        <span class="loading-icon">⏳</span>
        <p>Загрузка поездок...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error && !loading" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button class="retry-button" @click="loadBookedTrips" aria-label="Попробовать снова">
          Попробовать снова
        </button>
      </div>

      <!-- Список забронированных поездок -->
      <div class="booking-list">
        <div v-if="bookedTrips.length === 0 && !loading && !error" class="no-trips">
          У вас нет забронированных поездок.
        </div>
        <div v-else>
          <div 
            v-for="(trip, index) in bookedTrips" 
            :key="index" 
            class="trip-item"
          >
            <div class="trip-content">
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
                <span>{{ formatDate(trip.departuredate) }}</span>
              </div>
              <div class="detail-item">
                <p><strong>Время отбытия:</strong></p>
                <span>{{ trip.departuretime }}</span>
              </div>
              <div class="detail-item">
                <p><strong>Цена:</strong></p>
                <span>{{ trip.cost }} ₽</span>
              </div>
              <div class="detail-item">
                <p><strong>Остановки:</strong></p>
                <span>{{ trip.stops }}</span>
              </div>
            </div>
            
            <div class="trip-actions">
              <button 
                class="action-button view-passengers" 
                @click="showPassengers(trip, 'departure')"
                aria-label="Посмотреть пассажиров"
              >
                Пассажиры
              </button>
              <button 
                class="action-button cancel" 
                @click="cancelBooking(trip)"
                aria-label="Отменить бронирование"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>

      <button class="back-button" @click="goToHome" aria-label="Вернуться на главную">
        Вернуться на главную
      </button>
    </div>

    <!-- Модальное окно с пассажирами -->
    <div v-if="showPassengersModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal" aria-label="Закрыть модальное окно">×</button>
        
        <!-- Информация о водителе -->
        <div class="driver-info-modal" v-if="driver">
          <img :src="driver.avatarurl || '/default-avatar.jpg'" class="driver-avatar" @error="handleImageError" alt="Аватар водителя">
          <div class="driver-details">
            <h4>{{ driver.driver_name }} {{ driver.driver_surname }}</h4>
            <p>Рейтинг: ★ {{ driver.rating?.toFixed(1) || 'Нет оценки' }}</p>
            <p>Стаж: {{ calculateDrivingExperience(driver.license_issue_date) }}</p>
            <p>Автомобиль: {{ driver.brand }} {{ driver.mark }}</p>
          </div>
        </div>
        
        <h3>Пассажиры {{ modalLocationType === 'departure' ? 'отправления' : 'прибытия' }}</h3>
        <p class="location-info">{{ currentLocation }}</p>
        
        <div class="passengers-filter">
          <label>
            <input type="checkbox" v-model="showOnlyMyBookings" aria-label="Показать только мои бронирования">
            Показать только мои бронирования
          </label>
        </div>
        
        <div class="passengers-list">
          <div v-if="filteredPassengers.length === 0" class="no-passengers">
            <p>Нет забронировавших пассажиров</p>
          </div>
          <div v-else>
            <div v-for="(passenger, index) in filteredPassengers" :key="index" class="passenger-item">
              <router-link :to="`/profile/${passenger.user_id}`" class="passenger-avatar-link" :aria-label="`Профиль пассажира ${passenger.name} ${passenger.surname}`">
                <img 
                  :src="passenger.avatarUrl || '/default-avatar.jpg'" 
                  alt="Аватар пассажира" 
                  class="passenger-avatar"
                  @error="handleImageError"
                >
              </router-link>
              <div class="passenger-info">
                <div class="passenger-name">{{ passenger.name }} {{ passenger.surname }}</div>
                <div class="passenger-meta">
                  <span class="passenger-gender" :class="passenger.gender">
                    {{ passenger.gender === 'male' ? 'Женщина' : 'Мужчина' }}
                  </span>
                  <span class="passenger-age">{{ calculateAge(passenger.birthday) }} лет</span>
                  <span v-if="passenger.passenger_rating" class="passenger-rating">
                    ★ {{ passenger.passenger_rating.toFixed(1) }}
                  </span>
                </div>
                <div class="passenger-details">
                  <span class="passenger-seats">Мест: {{ passenger.seats_booked }}</span>
                  <span class="passenger-price">{{ passenger.position }} ₽</span>
                </div>
                <div v-if="passenger.comment" class="passenger-comment">
                  "{{ passenger.comment }}"
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="passengers-summary">
          <p>Всего пассажиров: {{ filteredPassengers.length }}</p>
          <p>Общее количество мест: {{ totalBookedSeats }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from 'js-cookie';
import { API_CONFIG } from '@/config/api';
import mitt from 'mitt';

const emitter = mitt();

export default {
  components: { AppNavbar },
  data() {
    return {
      bookedTrips: [],
      showPassengersModal: false,
      passengers: [],
      currentLocation: '',
      modalLocationType: 'departure',
      showOnlyMyBookings: false,
      driver: {
        driver_name: '',
        driver_surname: '',
        avatarurl: '',
        birth_date: '',
        license_issue_date: '',
        registration_date: '',
        rating: null,
        reviews_count: 0,
        total_trips: 0,
        canceled_trips: 0,
        rescheduled_trips: 0,
        mark: '',
        brand: '',
        reviews: [],
      },
      loading: false,
      error: null,
    };
  },
  computed: {
    filteredPassengers() {
      let passengers = this.passengers;
      if (this.showOnlyMyBookings) {
        const userId = Cookies.get('userId');
        if (userId) {
          passengers = passengers.filter(p => p.user_id === userId);
        }
      }
      return passengers;
    },
    totalBookedSeats() {
      return this.filteredPassengers.reduce((sum, passenger) => sum + passenger.seats_booked, 0);
    },
  },
  created() {
    this.loadBookedTrips();
    emitter.on('bookingCreated', this.loadBookedTrips);
  },
  beforeUnmount() {
    emitter.off('bookingCreated', this.loadBookedTrips);
  },
  methods: {
    async loadBookedTrips() {
      this.loading = true;
      this.error = null;
      try {
        const token = Cookies.get('token');
        if (!token) {
          this.error = "Пользователь не авторизован";
          this.$router.push("/login");
          return;
        }

        const response = await axios.get(API_CONFIG.BASE_URL + '/booking/get-booked', {
          headers: { "Authorization": `Bearer ${token}` },
        });

        this.bookedTrips = response.data.bookedTrips.map(trip => ({
          id_trip: trip.id_trip,
          booking_id: trip.booking_id,
          from: trip.departure_location || trip.from,
          to: trip.arrival_location || trip.to,
          departuredate: trip.departure_date || trip.departure_time,
          departuretime: trip.departure_time?.split('T')[1]?.slice(0, 5) || trip.departuretime,
          cost: trip.cost || trip.price,
          stops: trip.stops?.join(', ') || 'Без остановок',
          driver_id: trip.driver_id,
        }));

        if (!this.bookedTrips.length) {
          this.error = "У вас нет забронированных поездок";
        }
      } catch (error) {
        console.error("Ошибка при загрузке забронированных поездок:", error);
        this.error = error.response?.data?.message || "Ошибка загрузки поездок";
        this.bookedTrips = [];
        this.$notify({
          title: "Ошибка",
          text: this.error,
          type: "error",
        });
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'Не указано';
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Неверная дата'
        : date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    async showPassengers(trip, locationType) {
      this.modalLocationType = locationType;
      this.currentLocation = locationType === 'departure' ? trip.from : trip.to;
      try {
        const token = Cookies.get('token');
        const driverResponse = await axios.get(
          API_CONFIG.BASE_URL + `/user/driver/${trip.driver_id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.driver = driverResponse.data;
        const passengersResponse = await axios.get(
          API_CONFIG.BASE_URL + '/user/get-all',
          {
            params: { trip_id: trip.id_trip },
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        this.passengers = (passengersResponse.data.passengers || []).map(passenger => ({
          ...passenger,
          name: passenger.name || 'Не указано',
          surname: passenger.surname || '',
          gender: passenger.gender || 'unknown',
          passenger_rating: passenger.passenger_rating ? parseFloat(passenger.passenger_rating) : null,
          seats_booked: passenger.seats_booked || 1,
          department: passenger.department || '',
          birthday: passenger.birthday,
          position: passenger.position || '?',
        }));
        this.showPassengersModal = true;
      } catch (error) {
        console.error('Ошибка при загрузке информации:', error);
        this.$notify({
          title: 'Ошибка',
          text: 'Не удалось загрузить информацию',
          type: 'error',
        });
      }
    },
    async cancelBooking(trip) {
      try {
        const confirm = window.confirm('Вы уверены, что хотите отменить бронирование?');
        if (confirm) {
          const token = Cookies.get('token');
          await axios.put(API_CONFIG.BASE_URL + `/booking/cancell/${trip.booking_id}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          this.$notify({
            title: 'Успех',
            text: 'Бронирование отменено',
            type: 'success',
          });
          await this.loadBookedTrips();
        }
      } catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
        this.$notify({
          title: 'Ошибка',
          text: 'Не удалось отменить бронирование',
          type: 'error',
        });
      }
    },
    calculateAge(birthDate) {
      if (!birthDate) return 'Не указан';
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    },
    calculateDrivingExperience(licenseDate) {
      if (!licenseDate) return 'Не указано';
      const licenseYear = new Date(licenseDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const experience = currentYear - licenseYear;
      return experience === 0 ? 'Менее года' : `${experience} ${this.declension(experience, ['год', 'года', 'лет'])}`;
    },
    declension(number, titles) {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[
        number % 100 > 4 && number % 100 < 20 
          ? 2 
          : cases[number % 10 < 5 ? number % 10 : 5]
      ];
    },
    closeModal() {
      this.showPassengersModal = false;
      this.passengers = [];
    },
    goToHome() {
      this.$router.push("/");
    },
    handleImageError(event) {
      event.target.src = '/default-avatar.jpg';
    },
  },
};
</script>

<style scoped>
/* Theme variables */
:root {
  --bg-color: #ffffff;
  --text-color: #1a202c;
  --container-bg: #f9fafb;
  --border-color: #e2e8f0;
  --accent-color: #004281;
  --accent-hover: #003366;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --success-hover: #059669;
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dark-theme {
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
  --container-bg: #1e293b;
  --border-color: #475569;
  --accent-color: #60a5fa;
  --accent-hover: #3b82f6;
  --secondary-color: #94a3b8;
  --success-color: #34d399;
  --success-hover: #10b981;
  --danger-color: #f87171;
  --danger-hover: #ef4444;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.booking-details {
  max-width: 800px;
  margin: 96px auto 24px;
  padding: 24px;
  background-color: var(--bg-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);
}

.details-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.refresh-button {
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.refresh-button:hover,
.refresh-button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.refresh-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.loading-state, .error-state {
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border: 2px dashed var(--border-color);
  margin-bottom: 24px;
  background-color: var(--container-bg);
}

.loading-icon, .error-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.loading-state p, .error-state p {
  font-size: 1.1rem;
  font-weight: 500;
}

.retry-button {
  padding: 12px 24px;
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.retry-button:hover,
.retry-button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.retry-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.booking-list {
  margin-top: 24px;
}

.trip-item {
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--container-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.trip-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.trip-content {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.detail-item p {
  margin: 0;
  font-weight: 600;
  color: var(--text-color);
}

.detail-item span {
  color: var(--secondary-color);
  text-align: right;
  max-width: 60%;
}

.trip-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.action-button.view-passengers {
  background-color: var(--success-color);
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.action-button.view-passengers:hover,
.action-button.view-passengers:focus-visible {
  background-color: var(--success-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-button.cancel {
  background-color: var(--danger-color);
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.action-button.cancel:hover,
.action-button.cancel:focus-visible {
  background-color: var(--danger-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.no-trips {
  padding: 24px;
  font-size: 1.1rem;
  color: var(--secondary-color);
  background-color: var(--container-bg);
  border-radius: 10px;
  border: 2px dashed var(--border-color);
  text-align: center;
}

.back-button {
  display: block;
  margin: 24px auto 0;
  padding: 12px 24px;
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.back-button:hover,
.back-button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.back-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-color);
  padding: 32px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: var(--container-bg);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover,
.modal-close:focus-visible {
  background-color: var(--border-color);
  color: var(--accent-color);
}

.modal-close:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.driver-info-modal {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.driver-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.driver-details h4 {
  margin: 0 0 8px;
  font-size: 1.25rem;
  color: var(--text-color);
}

.driver-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.passengers-list {
  margin: 20px 0;
  max-height: 50vh;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--container-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.passenger-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.passenger-item:hover {
  background-color: var(--bg-color);
}

.passenger-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.passenger-info {
  flex-grow: 1;
}

.passenger-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-color);
  margin-bottom: 4px;
}

.passenger-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--secondary-color);
  flex-wrap: wrap;
}

.passenger-gender {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.passenger-gender.male {
  background-color: var(--accent-color);
  color: #ffffff;
}

.passenger-gender.female {
  background-color: var(--danger-color);
  color: #ffffff;
}

.passenger-rating {
  color: #f59e0b;
  font-weight: 600;
}

.passenger-details {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-color);
  margin-top: 6px;
}

.passenger-comment {
  font-style: italic;
  color: var(--secondary-color);
  margin-top: 8px;
  font-size: 0.85rem;
  padding: 8px;
  background-color: var(--bg-color);
  border-radius: 6px;
}

.passengers-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-color);
}

.no-passengers {
  padding: 20px;
  text-align: center;
  color: var(--secondary-color);
  font-size: 0.95rem;
  background-color: var(--bg-color);
  border-radius: 8px;
}

.passengers-filter {
  margin-bottom: 16px;
  text-align: left;
}

.passengers-filter label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-color);
}

.passengers-filter input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
  .booking-details {
    margin-top: 112px;
    padding: 32px;
  }

  .details-header h1 {
    font-size: 2rem;
  }

  .trip-item {
    padding: 24px;
  }

  .trip-actions {
    gap: 16px;
  }

  .action-button {
    padding: 12px 20px;
  }

  .modal-content {
    padding: 40px;
  }
}

@media (max-width: 480px) {
  .booking-details {
    margin: 80px auto 16px;
    padding: 16px;
  }

  .details-header {
    flex-direction: column;
    gap: 12px;
  }

  .details-header h1 {
    font-size: 1.5rem;
  }

  .refresh-button {
    width: 100%;
  }

  .trip-item {
    padding: 16px;
  }

  .detail-item {
    flex-direction: column;
    gap: 4px;
  }

  .detail-item span {
    text-align: left;
    max-width: 100%;
  }

  .trip-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }

  .modal-content {
    padding: 24px;
  }

  .driver-info-modal {
    flex-direction: column;
    text-align: center;
  }
}
</style>