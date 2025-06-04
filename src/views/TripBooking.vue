<template>
  <div>
    <AppNavbar />

    <div class="trip-details">
      <div class="details-header">
        <h1 class="header-title">Мои забронированные поездки</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingTrips" class="loading-state">
        <span class="loading-icon">⏳</span>
        <p>Загрузка поездок...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorLoadingTrips" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ errorLoadingTrips }}</p>
        <button class="retry-button" @click="loadBookedTrips(true)" aria-label="Попробовать снова">
          Попробовать снова
        </button>
      </div>

      <!-- Активные поездки -->
      <div v-else-if="activeTrips.length > 0">
        <h2 class="section-title">Активные поездки</h2>
        <div class="trip-list">
          <div 
            v-for="trip in activeTrips" 
            :key="trip.booking_id" 
            class="trip-item"
            @click="showPassengers(trip)"
            role="button"
            tabindex="0"
            @keydown.enter="showPassengers(trip)"
          >
            <div class="trip-content">
              <div class="trip-icon">🚗</div>
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
                <span>{{ formatTime(trip.departuretime) }}</span>
              </div>
              <div class="detail-item">
                <p><strong>Пассажиры:</strong></p>
                <span>{{ trip.seats_booked || 1 }}</span>
              </div>
              <div class="detail-item">
                <p><strong>Остановки:</strong></p>
                <span>{{ trip.stops || 'Нет' }}</span>
              </div>
            </div>
            
            <div class="trip-actions">
              <button 
                class="action-button" 
                @click.stop="showPassengers(trip)" 
                aria-label="Посмотреть пассажиров"
              >
                Пассажиры
              </button>
              <button 
                class="action-button cancel" 
                @click.stop="confirmCancel(trip)" 
                aria-label="Отменить бронирование"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Завершённые поездки -->
      <div v-if="completedTrips.length > 0">
        <h2 class="section-title">Завершённые поездки</h2>
        <div class="trip-list">
          <div v-for="trip in completedTrips" :key="trip.booking_id" class="trip-item completed">
            <div class="trip-content">
              <div class="trip-icon">🚖</div>
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
                <span>{{ formatTime(trip.departuretime) }}</span>
              </div>
              <div class="detail-item">
                <p><strong>Пассажиры:</strong></p>
                <span>{{ trip.seats_booked || 1 }}</span>
              </div>
              <div class="detail-item">
                <p><strong>Остановки:</strong></p>
                <span>{{ trip.stops || 'Нет' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoadingTrips && !errorLoadingTrips && bookedTrips.length === 0" class="no-trips">
        <span class="no-trips-icon">🚍</span>
        <p>У вас нет забронированных поездок.</p>
        <button class="create-trip-btn" @click="goToSearch" aria-label="Найти поездку">
          Найти поездку
        </button>
      </div>

      <button class="back-button" @click="goToHome" aria-label="Вернуться на главную">
        Назад
      </button>

      <!-- Модальное окно с пассажирами -->
      <div v-if="showPassengersModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close-button" @click="closeModal" aria-label="Закрыть модальное окно">×</button>
          <h3>Пассажиры {{ modalLocationType === 'departure' ? 'отправления' : 'прибытия' }}</h3>
          <p class="location-info">{{ currentLocation || 'Не указано' }}</p>
          
          <div class="passengers-filter">
            <label class="filter-label">
              <input type="checkbox" v-model="showOnlyMyBookings" aria-label="Показать только мои бронирования">
              Показать только мои бронирования
            </label>
          </div>
          
          <div class="passengers-list">
            <div v-if="isLoadingPassengers" class="loading-state">
              <span class="loading-icon">⏳</span>
              <p>Загрузка пассажиров...</p>
            </div>
            <div v-else-if="errorLoadingPassengers" class="error-state">
              <span class="error-icon">⚠️</span>
              <p>Не удалось загрузить пассажиров.</p>
            </div>
            <div v-else-if="filteredPassengers.length === 0" class="no-passengers">
              <span class="no-passengers-icon">👥</span>
              <p>Нет забронировавших пассажиров</p>
            </div>
            <div v-else>
              <div v-for="(passenger, index) in filteredPassengers" :key="index" class="passenger-item">
                <router-link :to="`/profile/${passenger.user_id}`" class="passenger-avatar-link">
                  <img 
                    :src="passenger.avatarUrl || '/default-avatar.jpg'" 
                    :alt="`Аватар ${passenger.name} ${passenger.surname}`" 
                    class="passenger-avatar"
                    @error="handleImageError"
                  >
                </router-link>
                <div class="passenger-info">
                  <div class="passenger-name">{{ passenger.name }} {{ passenger.surname }}</div>
                  <div class="passenger-meta">
                    <span class="passenger-gender" :class="passenger.gender">
                      {{ passenger.gender === 'male' ? 'Мужчина' : passenger.gender === 'female' ? 'Женщина' : 'Не указано' }}
                    </span>
                    <span class="passenger-age">{{ calculateAge(passenger.birthday) }} лет</span>
                    <span v-if="passenger.passenger_rating" class="passenger-rating">
                      ★ {{ passenger.passenger_rating.toFixed(1) }}
                    </span>
                  </div>
                  <div class="passenger-details">
                    <span class="passenger-seats">Мест: {{ passenger.seats_booked || 'Не указано' }}</span>
                    <span class="passenger-price">{{ passenger.position || 0 }} ₽</span>
                  </div>
                  <div v-if="passenger.comment" class="passenger-comment">
                    "{{ passenger.comment }}"
                  </div>
                  <div v-if="passenger.user_id === currentUserId" class="passenger-actions">
                    <button 
                      class="action-button cancel-booking" 
                      @click.stop="confirmCancelPassenger(passenger.user_id)"
                      aria-label="Отменить бронирование"
                    >
                      Отменить бронирование
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="passengers-summary" v-if="!isLoadingPassengers && !errorLoadingPassengers && filteredPassengers.length > 0">
            <p>Всего пассажиров: {{ filteredPassengers.length }}</p>
            <p>Общее количество мест: {{ totalBookedSeats }}</p>
          </div>
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
      isLoadingTrips: false,
      isLoadingPassengers: false,
      errorLoadingTrips: null,
      errorLoadingPassengers: null,
      currentUserId: null,
      selectedTrip: null,
    };
  },
  computed: {
    activeTrips() {
      return this.bookedTrips.filter(trip => trip.trip_status === 'active');
    },
    completedTrips() {
      return this.bookedTrips.filter(trip => trip.trip_status === 'completed');
    },
    filteredPassengers() {
      if (this.showOnlyMyBookings && this.currentUserId) {
        return this.passengers.filter(p => p.user_id === this.currentUserId);
      }
      return this.passengers;
    },
    totalBookedSeats() {
      return this.filteredPassengers.reduce((sum, passenger) => sum + (passenger.seats_booked || 0), 0);
    },
  },
  async created() {
    await this.fetchCurrentUser();
    await this.loadBookedTrips(true);
    emitter.on('bookingCreated', this.handleBookingCreated);
  },
  beforeUnmount() {
    emitter.off('bookingCreated', this.handleBookingCreated);
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const token = Cookies.get('token');
        if (!token) {
          this.$notify({
            title: "Ошибка",
            text: "Пожалуйста, войдите в систему",
            type: "error",
          });
          this.$router.push("/login");
          return;
        }

        const response = await axios.get(API_CONFIG.BASE_URL + '/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.currentUserId = response.data.id;
      } catch (error) {
        console.error("Ошибка при загрузке профиля пользователя:", error);
        this.$notify({
          title: "Ошибка",
          text: "Не удалось загрузить профиль пользователя",
          type: "error",
        });
      }
    },
    async handleBookingCreated(bookingData) {
      // Добавляем новую поездку в список
      const newTrip = {
        id_trip: bookingData.trip_id,
        booking_id: bookingData.booking_id,
        from: bookingData.departure_location || 'Не указано',
        to: bookingData.arrival_location || 'Не указано',
        departuredate: bookingData.departure_time || '',
        departuretime: bookingData.departure_time?.split('T')[1]?.slice(0, 5) || 'Не указано',
        seats_booked: bookingData.seats_booked || 1,
        stops: Array.isArray(bookingData.stops) ? bookingData.stops.join(', ') : bookingData.stops || 'Нет',
        driver_id: bookingData.driver_id || null,
        trip_status: 'active',
      };
      this.bookedTrips = [...this.bookedTrips, newTrip];
      this.$notify({
        title: "Успех",
        text: "Поездка успешно добавлена в ваши бронирования",
        type: "success",
      });
    },
    async loadBookedTrips(force = false) {
      if (!force && this.bookedTrips.length && !this.errorLoadingTrips) return;
      this.isLoadingTrips = true;
      this.errorLoadingTrips = null;
      try {
        const token = Cookies.get('token');
        if (!token) {
          this.$notify({
            title: "Ошибка",
            text: "Пожалуйста, войдите в систему",
            type: "error",
          });
          this.$router.push("/login");
          return;
        }

        const response = await axios.get(API_CONFIG.BASE_URL + '/booking/get-booked', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Ответ API /booking/get-booked:", response.data.bookedTrips);

        const trips = Array.isArray(response.data.bookedTrips) ? response.data.bookedTrips : [];
        this.bookedTrips = trips.map(trip => ({
          id_trip: trip.id_trip,
          booking_id: trip.booking_id,
          from: trip.departure_location || trip.from || 'Не указано',
          to: trip.arrival_location || trip.to || 'Не указано',
          departuredate: trip.departure_date || trip.departure_time || '',
          departuretime: trip.departure_time?.split('T')[1]?.slice(0, 5) || trip.departuretime || 'Не указано',
          seats_booked: trip.seats_booked || 1,
          stops: Array.isArray(trip.stops) ? trip.stops.join(', ') : trip.stops || 'Нет',
          driver_id: trip.driver_id,
          trip_status: trip.trip_status || 'active',
        }));

        if (trips.length === 0) {
          console.warn("API вернул пустой список поездок");
          console.log(token)
        }
      } catch (error) {
        console.error("Ошибка при загрузке забронированных поездок:", error);
        this.errorLoadingTrips = error.response?.data?.message || "Ошибка загрузки поездок";
        this.bookedTrips = [];
        this.$notify({
          title: "Ошибка",
          text: this.errorLoadingTrips,
          type: "error",
        });
      } finally {
        this.isLoadingTrips = false;
      }
    },
    formatDate(dateString) {
      console.log("dateString",dateString)
      if (!dateString) return 'Не указано';
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Неверная дата'
        : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    },
    formatTime(timeString) {
      if (!timeString) return 'Не указано';
      const date = new Date(`1970-01-01T${timeString}`);
      return isNaN(date.getTime())
        ? 'Неверное время'
        : date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },
    async showPassengers(trip) {
      this.selectedTrip = trip;
      this.modalLocationType = 'departure';
      this.currentLocation = `${trip.from} → ${trip.to}`;
      this.isLoadingPassengers = true;
      this.errorLoadingPassengers = null;
      try {
        const token = Cookies.get('token');
        const passengersResponse = await axios.get(API_CONFIG.BASE_URL + '/user/get-all', {
          params: { trip_id: trip.id_trip },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Ответ API /user/get-all:", passengersResponse.data);

        this.passengers = (passengersResponse.data.passengers || []).map(passenger => ({
          ...passenger,
          name: passenger.name || 'Не указано',
          surname: passenger.surname || '',
          gender: passenger.gender || 'unknown',
          passenger_rating: passenger.passenger_rating ? parseFloat(passenger.passenger_rating) : null,
          seats_booked: passenger.seats_booked || 1,
          birthday: passenger.birthday || null,
          position: passenger.position || '0',
          user_id: passenger.user_id || null,
          comment: passenger.comment || '',
          avatarUrl: passenger.avatarUrl || '/default-avatar.jpg',
        }));

        this.showPassengersModal = true;
      } catch (error) {
        console.error("Ошибка при загрузке пассажиров:", error);
        this.errorLoadingPassengers = "Не удалось загрузить пассажиров";
        this.$notify({
          title: "Ошибка",
          text: "Не удалось загрузить информацию о пассажирах",
          type: "error",
        });
      } finally {
        this.isLoadingPassengers = false;
      }
    },
    confirmCancel(trip) {
      if (confirm('Вы уверены, что хотите отменить бронирование?')) {
        this.cancelBooking(trip);
      }
    },
    async cancelBooking(trip) {
      try {
        const token = Cookies.get('token');
        await axios.put(
          API_CONFIG.BASE_URL + `/booking/cancell/${trip.booking_id}`,
          { seats_booked: trip.seats_booked }, // Добавляем seats_booked в тело запроса
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.$notify({
          title: "Успех",
          text: "Бронирование отменено",
          type: "success",
        });
        await this.loadBookedTrips(true);
      } catch (error) {
        console.error("Ошибка при отмене бронирования:", error);
        this.$notify({
          title: "Ошибка",
          text: "Не удалось отменить бронирование",
          type: "error",
        });
      }
    },
    confirmCancelPassenger(userId) {
      if (confirm('Вы уверены, что хотите отменить ваше бронирование?')) {
        this.cancelPassengerBooking(userId);
      }
    },
    async cancelPassengerBooking(userId) {
      try {
        const token = Cookies.get('token');
        await axios.delete(API_CONFIG.BASE_URL + `/trip/${this.selectedTrip.id_trip}/passenger/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.$notify({
          title: "Успех",
          text: "Бронирование успешно отменено",
          type: "success",
        });
        await this.showPassengers(this.selectedTrip);
        await this.loadBookedTrips(true);
      } catch (error) {
        console.error("Ошибка при отмене бронирования:", error);
        this.$notify({
          title: "Ошибка",
          text: "Не удалось отменить бронирование",
          type: "error",
        });
      }
    },
    calculateAge(birthday) {
      if (!birthday) return 'Не указан';
      const birthDate = new Date(birthday);
      if (isNaN(birthDate.getTime())) return 'Неверная дата';
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : 'Неверная дата';
    },
    closeModal() {
      this.showPassengersModal = false;
      this.passengers = [];
      this.selectedTrip = null;
      this.errorLoadingPassengers = null;
    },
    goToHome() {
      this.$router.push("/");
    },
    goToSearch() {
      this.$router.push("/search");
    },
    handleImageError(event) {
      event.target.src = '/default-avatar.jpg';
    },
  },
};
</script>

<style scoped>
/* Базовые стили */
:root {
  --bg-color: #ffffff;
  --text-color: #1a202c;
  --secondary-color: #6b7280;
  --container-bg: #ffffff;
  --border-color: #e2e8f0;
  --accent-color: #004281;
  --accent-hover: #003366;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ff1a1a;
  --danger-hover: #cc0000;
}

.dark-mode {
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
  --secondary-color: #94a3b8;
  --container-bg: #1e293b;
  --border-color: #475569;
  --accent-color: #60a5fa;
  --accent-hover: #3b82f6;
  --success-color: #34d399;
  --warning-color: #facc15;
  --danger-color: #ff5555;
  --danger-hover: #bb0000;
}

.trip-details {
  padding: 32px;
  max-width: 900px;
  margin: 80px auto;
  background: var(--container-bg);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.details-header {
  text-align: center;
  margin-bottom: 24px;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.section-title {
  margin: 32px 0 16px;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-color);
  padding-left: 12px;
  border-left: 4px solid var(--accent-color);
  text-align: left;
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-item {
  padding: 20px;
  background: var(--container-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideIn 0.5s ease-out;
}

.trip-item.completed {
  background-color: var(--container-bg);
  opacity: 0.7;
  cursor: default;
}

.trip-item:not(.completed) {
  cursor: pointer;
}

.trip-item:not(.completed):hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--accent-color);
}

.trip-item:not(.completed):focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.trip-icon {
  font-size: 1.5rem;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.trip-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.detail-item {
  flex: 1 1 45%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.detail-item p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.detail-item span {
  font-size: 0.9rem;
  color: var(--secondary-color);
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.trip-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.action-button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
  text-align: center;
  z-index: 2;
}

.action-button.cancel {
  background-color: var(--danger-color);
  color: white;
  border: 1px solid var(--danger-color);
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  min-width: 120px;
}

.action-button.cancel-booking {
  background-color: var(--danger-color);
  color: white;
  border: 1px solid var(--danger-color);
  font-weight: 700;
  font-size: 1rem;
  padding: 10px 16px;
  min-width: 160px;
  margin-top: 8px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.action-button.cancel:hover,
.action-button.cancel-booking:hover,
.action-button.cancel:focus-visible,
.action-button.cancel-booking:focus-visible {
  background-color: var(--danger-hover);
  border-color: var(--danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.action-button:hover,
.action-button:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.no-trips, .loading-state, .error-state {
  padding: 24px;
  border-radius: 10px;
  text-align: center;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border: 2px dashed var(--border-color);
  margin-bottom: 24px;
}

.no-trips-icon, .loading-icon, .error-icon {
  font-size: 2.5rem;
  opacity: 0.7;
}

.no-trips p, .loading-state p, .error-state p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.create-trip-btn, .retry-button {
  padding: 10px 20px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.create-trip-btn:hover,
.create-trip-btn:focus-visible,
.retry-button:hover,
.retry-button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.create-trip-btn:focus-visible,
.retry-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.back-button {
  display: block;
  margin: 24px auto 0;
  padding: 12px 24px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-button:hover,
.back-button:focus-visible {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  opacity: 1;
  z-index: 1001;
}

.dark-mode .modal-content {
  background: #1e293b;
}

.modal-close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--secondary-color);
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 1002;
}

.modal-close-button:hover,
.modal-close-button:focus-visible {
  color: var(--accent-color);
}

.modal-close-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.modal-content h3 {
  margin: 0 0 16px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.passengers-filter {
  margin-bottom: 16px;
  text-align: left;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--text-color);
}

.passengers-list {
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 16px;
}

.passenger-item {
  display: flex;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--bg-color);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  gap: 12px;
  transition: all 0.2s ease;
}

.passenger-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
}

.passenger-avatar-link {
  flex-shrink: 0;
}

.passenger-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.passenger-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.passenger-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.passenger-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--secondary-color);
}

.passenger-gender.male {
  color: #3b82f6;
}

.passenger-gender.female {
  color: #ec4899;
}

.passenger-rating {
  color: var(--warning-color);
}

.passenger-details {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.passenger-comment {
  font-size: 0.875rem;
  color: var(--secondary-color);
  font-style: italic;
  margin-top: 4px;
}

.passenger-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.passengers-summary {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  font-size: 0.95rem;
  color: var(--text-color);
  text-align: left;
}

.no-passengers, .loading-state, .error-state {
  text-align: center;
  padding: 20px;
  color: var(--secondary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.no-passengers-icon, .loading-icon, .error-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.location-info {
  font-size: 0.95rem;
  color: var(--secondary-color);
  margin-bottom: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .trip-details {
    padding: 16px;
    margin: 70px auto;
    width: 95%;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .trip-item {
    padding: 16px;
  }

  .detail-item {
    flex: 1 1 100%;
  }

  .trip-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-button {
    width: 100%;
  }

  .passenger-item {
    padding: 12px;
  }

  .passenger-avatar {
    width: 36px;
    height: 36px;
  }

  .action-button.cancel-booking {
    min-width: 120px;
    font-size: 0.95rem;
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .detail-item p,
  .detail-item span {
    font-size: 0.85rem;
  }

  .action-button {
    font-size: 0.85rem;
    padding: 8px 12px;
  }

  .passenger-meta {
    flex-direction: column;
    gap: 4px;
  }

  .passenger-details {
    flex-direction: column;
    gap: 4px;
  }

  .action-button.cancel-booking {
    min-width: 100px;
    font-size: 0.9rem;
  }
}
</style>