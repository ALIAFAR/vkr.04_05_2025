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
              <span>{{ trip.departuredate }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Время отбытия:</strong></p>
              <span>{{ trip.departuretime }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Цена:</strong></p>
              <span>{{ trip.cost }}</span>
            </div>
            <div class="detail-item">
              <p><strong>Остановки:</strong></p>
              <span>{{ trip.stops }}</span>
            </div>
            
            <!-- Кнопки действий -->
            <div class="trip-actions">
              <button class="btn-view-passengers" @click="showPassengers(trip, 'departure')">
                Посмотреть пассажиров
              </button>
              <button class="btn-cancel" @click="cancelBooking(trip)">
                Отменить бронь
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка для возврата на главную страницу -->
      <button class="back-button" @click="goToHome">
        Вернуться на главную
      </button>
    </div>

    <!-- Модальное окно с пассажирами -->
    <div v-if="showPassengersModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">×</button>
        
        <!-- Информация о водителе -->
        <div class="driver-info-modal" v-if="driver">
          <img :src="driver.avatarurl || '/default-avatar.jpg'" class="driver-avatar" @error="handleImageError">
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

export default {
  components: {
    AppNavbar,
  },
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
        reviews: []
      },
      loading: false,
      error: null
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
    }
  },
  created() {
    this.loadBookedTrips();
  },
  methods: {
    async loadBookedTrips() {
      this.loading = true;
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error("Пользователь не авторизован");
          return;
        }

        const response = await axios.get("https://unigo.onrender.com/api/booking/get-booked", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        this.bookedTrips = response.data.bookedTrips;
        console.log("data.bookedTrips",this.bookedTrips)
      } catch (error) {
        console.error("Ошибка при загрузке забронированных поездок:", error);
        this.bookedTrips = [];
      } finally {
        this.loading = false;
      }
    },

    async showPassengers(trip, locationType) {
      this.modalLocationType = locationType;
      this.currentLocation = locationType === 'departure' 
        ? trip.from 
        : trip.to;
      
      try {
        const token = Cookies.get('token');
        
        // Загружаем информацию о водителе
        const driverResponse = await axios.get(
          `https://unigo.onrender.com/api/user/driver/${trip.driver_id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        this.driver = driverResponse.data;
        
        // Загружаем пассажиров
        const passengersResponse = await axios.get(
          'https://unigo.onrender.com/api/user/get-all',
          {
            params: { trip_id: trip.id_trip },
            headers: { 'Authorization': `Bearer ${token}` }
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
          position: passenger.position || '?'
        }));
        
        this.showPassengersModal = true;
      } catch (error) {
        console.error('Ошибка при загрузке информации:', error);
        this.$notify({
          title: 'Ошибка',
          text: 'Не удалось загрузить информацию',
          type: 'error'
        });
      }
    },

    async cancelBooking(trip) {
      try {
        const confirm = await this.$confirm(
          'Вы уверены, что хотите отменить бронирование?',
          'Подтверждение отмены',
          {
            confirmButtonText: 'Да, отменить',
            cancelButtonText: 'Нет',
            type: 'warning'
          }
        );
        
        if (confirm) {
          const token = Cookies.get('token');
          await axios.put(`https://unigo.onrender.com/api/booking/cancell/${trip.booking_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          this.$notify({
            title: 'Успешно',
            text: 'Бронирование отменено',
            type: 'success'
          });
          
          await this.loadBookedTrips();
        }
      } catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
        this.$notify({
          title: 'Ошибка',
          text: 'Не удалось отменить бронирование',
          type: 'error'
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
      
      if (experience === 0) return 'Менее года';
      return `${experience} ${this.declension(experience, ['год', 'года', 'лет'])}`;
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
    }
  }
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