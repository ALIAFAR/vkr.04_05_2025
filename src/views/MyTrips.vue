<template>
  <div>
    <AppNavbar />

    <div class="trip-details">
      <div class="details-header">
        <h1 class="header-title">Мои опубликованные поездки</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingTrips" class="loading-state">
        <span class="loading-icon">⏳</span>
        <p>Загрузка поездок...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorLoadingTrips" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>Не удалось загрузить поездки. Попробуйте снова.</p>
        <button class="retry-button" @click="loadUserTrips" aria-label="Попробовать снова">
          Попробовать снова
        </button>
      </div>

      <!-- Активные поездки -->
      <div v-else-if="activeTrips.length > 0">
        <h2 class="section-title">Активные поездки</h2>
        <div class="trip-list">
          <div 
            v-for="trip in activeTrips" 
            :key="trip.id" 
            class="trip-item"
            @click="showPassengers(trip.id)"
            role="button"
            tabindex="0"
            @keydown.enter="showPassengers(trip.id)"
          >
            <div class="trip-content">
              <div class="trip-icon">🚗</div>
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
                <span>{{ trip.stops.join(', ') || 'Нет' }}</span>
              </div>
            </div>
            
            <div class="trip-actions">
              <button class="action-button edit" @click.stop="openEditModal(trip)" aria-label="Редактировать поездку">
                Редактировать
              </button>
              <button class="action-button reschedule" @click.stop="openRescheduleModal(trip)" aria-label="Перенести поездку">
                Перенести
              </button>
              <button class="action-button cancel" @click.stop="confirmCancel(trip)" aria-label="Отменить поездку">
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
          <div v-for="trip in completedTrips" :key="trip.id" class="trip-item completed">
            <div class="trip-content">
              <div class="trip-icon">🚖</div>
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
                <span>{{ trip.stops.join(', ') || 'Нет' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoadingTrips && !errorLoadingTrips && userTrips.length === 0" class="no-trips">
        <span class="no-trips-icon">🚍</span>
        <p>У вас нет опубликованных поездок.</p>
        <button class="create-trip-btn" @click="goToCreateTrip" aria-label="Создать новую поездку">
          Создать поездку
        </button>
      </div>

      <button class="back-button" @click="goToHome" aria-label="Вернуться на главную">
        Назад
      </button>

      <!-- Модальное окно редактирования -->
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <button class="modal-close-button" @click="closeModal" aria-label="Закрыть модальное окно">×</button>
          <h3>Редактировать поездку</h3>
          <form @submit.prevent="saveEdit">
            <div class="form-group">
              <label for="departure_location">Откуда:</label>
              <input id="departure_location" v-model="editingTrip.departure_location" required aria-label="Место отправления">
            </div>
            <div class="form-group">
              <label for="arrival_location">Куда:</label>
              <input id="arrival_location" v-model="editingTrip.arrival_location" required aria-label="Место прибытия">
            </div>
            <div class="form-group">
              <label for="seats">Пассажиры:</label>
              <input id="seats" type="number" v-model="editingTrip.seats" required aria-label="Количество пассажиров" min="1">
            </div>
            <div class="form-group">
              <label>Остановки:</label>
              <div class="stops-list">
                <div v-for="(stop, index) in editingTrip.stops" :key="index" class="stop-item">
                  <input v-model="editingTrip.stops[index]" :aria-label="`Остановка ${index + 1}`">
                  <button type="button" class="remove-stop" @click="removeStop(index)" aria-label="Удалить остановку">
                    ×
                  </button>
                </div>
              </div>
              <div class="add-stop">
                <input id="new-stop" type="text" v-model="newStop" placeholder="Добавить остановку" aria-label="New Stop">
                <button type="button" class="add-stop-button" @click="addStop" aria-label="Добавить остановку">
                  +
                </button>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="closeModal">Отмена</button>
              <button type="submit" class="save-button">Сохранить</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модальное окно переноса -->
      <div v-if="showRescheduleModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <button class="modal-close-button" @click="closeModal" aria-label="Закрыть модальное окно">×</button>
          <h3>Перенести поездку</h3>
          <form @submit.prevent="saveReschedule">
            <div class="form-group">
              <label for="new-date">Новая дата:</label>
              <input id="new-date" type="date" v-model="rescheduleData.newDate" required aria-label="Новая дата поездки">
            </div>
            <div class="form-group">
              <label for="new-time">Новое время:</label>
              <input id="new-time" type="time" v-model="rescheduleData.newTime" required aria-label="Новое время поездки">
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="closeModal">Отмена</button>
              <button type="submit" class="save-button">Перенести</button>
            </div>
          </form>
        </div>
      </div>

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
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG } from '@/config/api';

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      userTrips: [],
      showEditModal: false,
      showRescheduleModal: false,
      showPassengersModal: false,
      isLoadingTrips: false,
      isLoadingPassengers: false,
      errorLoadingTrips: false,
      errorLoadingPassengers: false,
      editingTrip: {
        id: null,
        departure_location: '',
        arrival_location: '',
        seats: 0,
        stops: []
      },
      rescheduleData: {
        tripId: null,
        newDate: '',
        newTime: ''
      },
      newStop: '',
      currentTripPassengers: [],
      selectedTripId: null,
      modalLocationType: 'departure',
      currentLocation: '',
      showOnlyMyBookings: false,
      currentUserId: null
    };
  },
  computed: {
    activeTrips() {
      return this.userTrips.filter(trip => trip.trip_status === 'active');
    },
    completedTrips() {
      return this.userTrips.filter(trip => trip.trip_status === 'last');
    },
    filteredPassengers() {
      if (this.showOnlyMyBookings && this.currentUserId) {
        return this.currentTripPassengers.filter(passenger => passenger.user_id === this.currentUserId);
      }
      return this.currentTripPassengers;
    },
    totalBookedSeats() {
      return this.filteredPassengers.reduce((total, passenger) => total + (passenger.seats_booked || 0), 0);
    }
  },
  async created() {
    await this.fetchCurrentUser();
    this.loadUserTrips();
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const token = Cookies.get('token');
        if (!token) return;

        const response = await axios.get(API_CONFIG.BASE_URL + '/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        this.currentUserId = response.data.id;
      } catch (error) {
        console.error("Ошибка при загрузке профиля пользователя:", error);
      }
    },

    async loadUserTrips() {
      try {
        this.isLoadingTrips = true;
        this.errorLoadingTrips = false;
        const token = Cookies.get('token');
        if (!token) {
          console.error("Токен отсутствует. Пользователь не авторизован.");
          return;
        }

        const response = await axios.get(API_CONFIG.BASE_URL + '/trip/search', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        this.userTrips = response.data.data || [];
      } catch (error) {
        console.error("Ошибка при загрузке поездок:", error);
        this.errorLoadingTrips = true;
        this.userTrips = [];
      } finally {
        this.isLoadingTrips = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'Не указано';
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Неверная дата' 
        : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatTime(dateString) {
      if (!dateString) return 'Не указано';
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Неверное время' 
        : date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },

    goToHome() {
      this.$router.push("/");
    },

    goToCreateTrip() {
      this.$router.push("/create-trip");
    },

    openEditModal(trip) {
      this.editingTrip = {
        id: trip.id,
        departure_location: trip.departure_location,
        arrival_location: trip.arrival_location,
        seats: trip.seats,
        stops: [...(trip.stops || [])]
      };
      this.newStop = '';
      this.showEditModal = true;
    },

    openRescheduleModal(trip) {
      const date = new Date(trip.departure_time);
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = date.toTimeString().substring(0, 5);
      
      this.rescheduleData = {
        tripId: trip.id,
        newDate: formattedDate,
        newTime: formattedTime
      };
      this.showRescheduleModal = true;
    },

    async showPassengers(tripId) {
      try {
        const token = Cookies.get('token');
        this.isLoadingPassengers = true;
        this.errorLoadingPassengers = false;
        this.selectedTripId = tripId;
        
        const response = await axios.get(
          API_CONFIG.BASE_URL + '/user/get-all',
          {
            params: { trip_id: tripId },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        this.showPassengersModal = true;
        this.currentTripPassengers = (response.data.passengers || []).map(passenger => ({
          ...passenger,
          name: passenger.name || 'Не указано',
          surname: passenger.surname || '',
          gender: passenger.gender || 'unknown',
          passenger_rating: passenger.passenger_rating ? parseFloat(passenger.passenger_rating) : null,
          seats_booked: passenger.seats_booked || 0,
          birthday: passenger.birthday || null,
          position: passenger.position || '0',
          user_id: passenger.user_id || null
        }));

        const trip = this.userTrips.find(t => t.id === tripId);
        this.currentLocation = trip 
          ? `${trip.departure_location} → ${trip.arrival_location}`
          : 'Маршрут не найден';
      } catch (error) {
        console.error("Ошибка при загрузке пассажиров:", error);
        this.errorLoadingPassengers = true;
        this.$toast.error('Не удалось загрузить информацию о пассажирах');
      } finally {
        this.isLoadingPassengers = false;
      }
    },

    closeModal() {
      this.showEditModal = false;
      this.showRescheduleModal = false;
      this.showPassengersModal = false;
      this.newStop = '';
      this.currentTripPassengers = [];
      this.errorLoadingPassengers = false;
      this.selectedTripId = null;
    },

    addStop() {
      if (this.newStop.trim()) {
        this.editingTrip.stops.push(this.newStop.trim());
        this.newStop = '';
      }
    },
    
    removeStop(index) {
      this.editingTrip.stops.splice(index, 1);
    },

    async saveEdit() {
      try {
        const token = Cookies.get('token');
        const updatedTrip = {
          ...this.editingTrip,
          stops: this.editingTrip.stops.filter(stop => stop.trim() !== '')
        };

        await axios.put(API_CONFIG.BASE_URL + `/trip/${this.editingTrip.id}`, updatedTrip, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await this.notifyPassengers(this.editingTrip.id, 'Поездка была отредактирована. Проверьте новые детали.');

        this.closeModal();
        this.loadUserTrips();
        this.$toast.success('Поездка успешно обновлена! Пассажиры уведомлены.');
      } catch (error) {
        console.error("Ошибка при обновлении поездки:", error);
        this.$toast.error('Ошибка при обновлении поездки');
      }
    },

    async saveReschedule() {
      try {
        const token = Cookies.get('token');
        const newDateTime = new Date(`${this.rescheduleData.newDate}T${this.rescheduleData.newTime}`);
        if (isNaN(newDateTime.getTime())) {
          throw new Error('Неверная дата или время');
        }
        
        await axios.patch(API_CONFIG.BASE_URL + `/trip/${this.rescheduleData.tripId}/reschedule`, {
          new_departure_time: newDateTime.toISOString()
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await this.notifyPassengers(this.rescheduleData.tripId, 'Поездка была перенесена. Проверьте новые дату и время.');

        this.closeModal();
        this.loadUserTrips();
        this.$toast.success('Поездка успешно перенесена! Пассажиры уведомлены.');
      } catch (error) {
        console.error("Ошибка при переносе поездки:", error);
        this.$toast.error('Ошибка при переносе поездки');
      }
    },

    confirmCancel(trip) {
      if (confirm('Вы уверены, что хотите отменить эту поездку? Все пассажиры будут уведомлены.')) {
        this.cancelTrip(trip.id);
      }
    },

    async cancelTrip(tripId) {
      try {
        const token = Cookies.get('token');
        
        await axios.delete(API_CONFIG.BASE_URL + `/api/trip/${tripId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await this.notifyPassengers(tripId, 'Поездка была отменена водителем.');

        this.loadUserTrips();
        this.$toast.success('Поездка отменена. Пассажиры уведомлены.');
      } catch (error) {
        console.error("Ошибка при отмене поездки:", error);
        this.$toast.error('Ошибка при отмене поездки');
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
        
        await axios.delete(API_CONFIG.BASE_URL + `/trip/${this.selectedTripId}/passenger/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await this.notifyPassengers(this.selectedTripId, 'Пассажир отменил бронирование.');

        await this.showPassengers(this.selectedTripId);
        await this.loadUserTrips();
        this.$toast.success('Бронирование успешно отменено.');
      } catch (error) {
        console.error("Ошибка при отмене бронирования:", error);
        this.$toast.error('Ошибка при отмене бронирования');
      }
    },

    async notifyPassengers(tripId, message) {
      try {
        const token = Cookies.get('token');
        
        await axios.post(API_CONFIG.BASE_URL + '/trip/notify', {
          trip_id: tripId,
          message: message
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Ошибка при отправке уведомлений:", error);
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

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/40?text=Avatar';
    }
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
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
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
  --danger-color: #f87171;
  --danger-hover: #dc2626;
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
}

.action-button.edit {
  background-color: var(--warning-color);
  color: #1a202c;
}

.action-button.reschedule {
  background-color: #17a2b8;
  color: white;
}

.action-button.cancel {
  background-color: var(--danger-color);
  color: white;
  border: 1px solid var(--danger-color);
}

.action-button.cancel-booking {
  background-color: var(--danger-color);
  color: white;
  border: 1px solid var(--danger-color);
  font-weight: 600;
  padding: 8px 14px;
  min-width: 140px;
  margin-top: 8px;
}

.action-button.cancel:hover,
.action-button.cancel-booking:hover,
.action-button.cancel:focus-visible,
.action-button.cancel-booking:focus-visible {
  background-color: var(--danger-hover);
  border-color: var(--danger-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-button:hover,
.action-button:focus-visible {
  transform: translateY(-2px);
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
  transform: translateY(-2px);
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

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.dark-mode .modal-overlay {
  background-color: #1e293b;
}

.modal {
  position: relative;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  transform: scale(1);
  opacity: 1;
}

.dark-mode .modal {
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
}

.modal-close-button:hover,
.modal-close-button:focus-visible {
  color: var(--accent-color);
}

.modal-close-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.modal h3 {
  margin: 0 0 16px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text-color);
  background: var(--bg-color);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 16px;
  background: var(--border-color);
  color: var(--text-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.cancel-btn:hover,
.cancel-btn:focus-visible {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.dark-mode .cancel-btn:hover,
.dark-mode .cancel-btn:focus-visible {
  background: #475569;
}

.cancel-btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.save-button {
  padding: 10px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.save-button:hover,
.save-button:focus-visible {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.save-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Стили для остановок */
.stops-list {
  margin-bottom: 16px;
}

.stop-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.stop-item input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
}

.remove-stop {
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-stop:hover,
.remove-stop:focus-visible {
  background: var(--danger-hover);
  transform: scale(1.1);
}

.remove-stop:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.add-stop {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-stop input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
}

.add-stop-button {
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-stop-button:hover,
.add-stop-button:focus-visible {
  background: #059669;
  transform: scale(1.1);
}

.add-stop-button:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Пассажиры */
.modal-content {
  position: relative;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
  opacity: 1;
}

.dark-mode .modal-content {
  background: #1e293b;
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

  .modal {
    padding: flex;
    padding: 20px;
  }

  .passenger-item {
    padding: 12px;
  }

  .passenger-avatar {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1.1em;
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
}
</style>