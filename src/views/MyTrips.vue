<template>
  <div>
    <AppNavbar />

    <div class="trip-details">
      <div class="details-header">
        <h1>Мои опубликованные поездки</h1>
      </div>

      <!-- Активные поездки -->
      <div v-if="activeTrips.length > 0">
        <h2 class="trip-section-title">Активные поездки</h2>
        <div class="trip-list">
          <div 
            v-for="(trip, index) in activeTrips" 
            :key="'active-' + index" 
            class="trip-item"
            @click="showPassengers(trip.id)"
          >
            <div class="trip-content">
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
            </div>
            
            <div class="trip-actions">
              <button class="action-button edit" @click.stop="openEditModal(trip)">
                Редактировать
              </button>
              <button class="action-button reschedule" @click.stop="openRescheduleModal(trip)">
                Перенести
              </button>
              <button class="action-button cancel" @click.stop="confirmCancel(trip)">
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Завершенные поездки -->
      <div v-if="completedTrips.length > 0">
        <h2 class="trip-section-title">Завершенные поездки</h2>
        <div class="trip-list">
          <div v-for="(trip, index) in completedTrips" :key="'completed-' + index" class="trip-item completed">
            <div class="trip-content">
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
            </div>
          </div>
        </div>
      </div>

      <div v-if="userTrips.length === 0" class="no-trips">
        У вас нет опубликованных поездок.
      </div>

      <button class="back-button" @click="goToHome">
        Вернуться на главную
      </button>

      <!-- Модальное окно редактирования -->
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal">
          <h3>Редактировать поездку</h3>
          <form @submit.prevent="saveEdit">
            <div class="form-group">
              <label>Откуда:</label>
              <input v-model="editingTrip.departure_location" required>
            </div>
            <div class="form-group">
              <label>Куда:</label>
              <input v-model="editingTrip.arrival_location" required>
            </div>
            <div class="form-group">
              <label>Пассажиры:</label>
              <input type="number" v-model="editingTrip.seats" required>
            </div>
            <div class="form-group">
              <label>Остановки:</label>
              <div class="stops-list">
                <div v-for="(stop, index) in editingTrip.stops" :key="index" class="stop-item">
                  <input v-model="editingTrip.stops[index]">
                  <button type="button" class="remove-stop" @click="removeStop(index)">
                    ×
                  </button>
                </div>
              </div>
              <div class="add-stop">
                <input v-model="newStop" placeholder="Добавить остановку">
                <button type="button" class="add-stop-button" @click="addStop">
                  +
                </button>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="closeModal">Отмена</button>
              <button type="submit" class="save-button">Сохранить</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модальное окно переноса -->
      <div v-if="showRescheduleModal" class="modal-overlay">
        <div class="modal">
          <h3>Перенести поездку</h3>
          <form @submit.prevent="saveReschedule">
            <div class="form-group">
              <label>Новая дата:</label>
              <input type="date" v-model="rescheduleData.newDate" required>
            </div>
            <div class="form-group">
              <label>Новое время:</label>
              <input type="time" v-model="rescheduleData.newTime" required>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="closeModal">Отмена</button>
              <button type="submit" class="save-button">Перенести</button>
            </div>
          </form>
        </div>
      </div>


      <!-- Модальное окно с пассажирами -->
      <div v-if="showPassengersModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">×</button>
          <h3>Пассажиры {{ modalLocationType === 'departure' ? 'отправления' : 'прибытия' }}</h3>
          <p class="location-info">{{ currentLocation }}</p>
          
          <div class="passengers-filter">
            <label>
              <input type="checkbox" v-model="showOnlyMyBookings"> Показать только мои бронирования
            </label>
          </div>
          
          <div class="passengers-list">
            <div v-if="filteredPassengers.length === 0" class="no-passengers">
              <p>Нет забронировавших пассажиров</p>
            </div>
            <div v-else>
              <div v-for="(passenger, index) in filteredPassengers" :key="index" class="passenger-item">
                <router-link :to="`/profile/${passenger.user_id}`" class="passenger-avatar-link">
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
                      {{ passenger.gender === 'male' ? 'Мужчина' : 'Женщина' }}
                    </span>
                    <span class="passenger-age">{{ calculateAge(passenger.birthday) }} лет</span>
                    <span v-if="passenger.passenger_rating" class="passenger-rating">
                      ★ {{ passenger.passenger_rating.toFixed(1) }}
                    </span>
                  </div>
                  <div class="passenger-details">
                    <span class="passenger-seats">Мест: {{ passenger.department }}</span>
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
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from 'axios';
import Cookies from 'js-cookie';

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
      isLoadingPassengers: false,
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
      selectedTripId: null
    };
  },
  computed: {
    activeTrips() {
      return this.userTrips.filter(trip => trip.trip_status === 'active');
    },
    completedTrips() {
      return this.userTrips.filter(trip => trip.trip_status === 'completed');
    }
  },
  created() {
    this.loadUserTrips();
  },
  methods: {
    async loadUserTrips() {
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error("Токен отсутствует. Пользователь не авторизован.");
          return;
        }

        const response = await axios.get("https://unigo.onrender.com/api/trip/search", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        this.userTrips = response.data.data;
      } catch (error) {
        console.error("Ошибка при загрузке поездок:", error);
        this.userTrips = [];
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    },

    goToHome() {
      this.$router.push("/");
    },

    openEditModal(trip) {
      this.editingTrip = {
        id: trip.id,
        departure_location: trip.departure_location,
        arrival_location: trip.arrival_location,
        seats: trip.seats,
        stops: [...trip.stops]
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
    closePassengersModal() {
  this.showPassengersModal = false;
  this.currentTripPassengers = [];
  this.errorLoadingPassengers = false;
},

    async showPassengers(tripId) {
      try {
        const token = Cookies.get('token');
        this.isLoadingPassengers = true;
        this.errorLoadingPassengers = false;
        
        // Используем правильный эндпоинт для получения пассажиров
        const response = await axios.get(
          'https://unigo.onrender.com/api/user/get-all',
          {
            params: { // ✅ GET-параметры
              trip_id: tripId 
            },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        try {
          this.showPassengersModal = true;
          this.currentTripPassengers=(response.data.passengers || []).map(passenger => ({
          ...passenger,
          name: passenger.name || 'Не указано',
          surname: passenger.surname || '',
          gender: passenger.gender || 'unknown',
          passenger_rating: passenger.passenger_rating ? parseFloat(passenger.passenger_rating) : null,
          seats_booked: passenger.seats_booked,
          department: passenger.department,
          birthday:passenger.birthday,
          position: passenger.position || '?'
        }));
        } catch (error) {
          throw new Error('Неверный формат ответа сервера');
        }

        /*if (response.data && response.data.success) {
          this.currentTripPassengers = response.data.passengers || [];
          this.showPassengersModal = true;
        } else {
          throw new Error('Неверный формат ответа сервера');
        }*/
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
      this.newStop = '';
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

        await axios.put(`https://unigo.onrender.com/api/trip/${this.editingTrip.id}`, updatedTrip, {
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
        
        await axios.patch(`https://unigo.onrender.com/api/trip/${this.rescheduleData.tripId}/reschedule`, {
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
        
        await axios.delete(`https://unigo.onrender.com/api/trip/${tripId}`, {
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

    async notifyPassengers(tripId, message) {
      try {
        const token = Cookies.get('token');
        
        await axios.post("https://unigo.onrender.com/api/trip/search", {
          message: message
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Ошибка при отправке уведомлений:", error);
      }
    }
  },
};
</script>

<style scoped>
/* Существующие стили остаются без изменений */

.passenger-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #004281;
}

.passenger-info p {
  margin: 0.5rem 0;
  color: #333;
}

.passenger-info strong {
  color: #004281;
}

.no-passengers {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}


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

.trip-section-title {
  margin: 2rem 0 1rem;
  color: #004281;
  font-size: 1.5rem;
  text-align: left;
  padding-left: 0.5rem;
  border-left: 4px solid #004281;
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

.trip-item.completed {
  opacity: 0.7;
  background-color: #f5f5f5;
}

.trip-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 66, 129, 0.15);
}

.trip-content {
  margin-bottom: 1rem;
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

.trip-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  flex: 1;
}

.action-button.edit {
  background-color: #ffc107;
  color: #212529;
}

.action-button.reschedule {
  background-color: #17a2b8;
  color: white;
}

.action-button.cancel {
  background-color: #dc3545;
  color: white;
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
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

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin-top: 0;
  color: #004281;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #004281;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 0.5rem;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.save-button {
  padding: 0.5rem 1rem;
  background: #004281;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Стили для работы с остановками */
.stops-list {
  margin-bottom: 1rem;
}

.stop-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stop-item input {
  flex: 1;
  margin-right: 0.5rem;
}

.remove-stop {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.add-stop {
  display: flex;
  align-items: center;
}

.add-stop input {
  flex: 1;
  margin-right: 0.5rem;
}

.add-stop-button {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .trip-details {
    margin: 7rem auto 3rem;
    padding: 1.25rem;
    width: 95%;
  }

  .trip-item {
    padding: 1.25rem;
  }

  .trip-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-button {
    width: 100%;
  }

  .modal {
    padding: 1.5rem;
  }
  .loading-message, .error-message {
  padding: 1rem;
  text-align: center;
}

.passengers-list {
  max-height: 60vh;
  overflow-y: auto;
}

.passenger-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
}

</style>