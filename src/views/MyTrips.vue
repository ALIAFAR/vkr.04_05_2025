<template>
  <div>
    <AppNavbar />

    <div class="booking-details">
      <div class="details-header">
        <h1>Мои забронированные поездки</h1>
      </div>

      <!-- Список забронированных поездок -->
      <div class="booking-list">
        <div v-if="bookedTrips.length === 0" class="no-trips">
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
            </div>
            
            <div class="trip-actions">
              <button 
                class="action-button view-passengers" 
                @click="showPassengers(trip, 'departure')"
              >
                Пассажиры
              </button>
              <button 
                class="action-button cancel" 
                @click="cancelBooking(trip)"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>

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
.booking-details {
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

.action-button.view-passengers {
  background-color: #3498db;
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

/* Модальное окно */
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

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
}

.driver-info-modal {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.driver-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.driver-details h4 {
  margin: 0 0 5px 0;
}

.driver-details p {
  margin: 3px 0;
  font-size: 14px;
  color: #555;
}

.passengers-list {
  margin: 15px 0;
  max-height: 50vh;
  overflow-y: auto;
}

.passenger-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.passenger-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.passenger-info {
  flex-grow: 1;
}

.passenger-name {
  font-weight: bold;
  margin-bottom: 3px;
}

.passenger-meta {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.passenger-gender {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.passenger-gender.male {
  background-color: #e3f2fd;
  color: #1565c0;
}

.passenger-gender.female {
  background-color: #fce4ec;
  color: #ad1457;
}

.passenger-rating {
  color: #ff9800;
  font-weight: bold;
}

.passenger-details {
  display: flex;
  gap: 15px;
  font-size: 13px;
}

.passenger-comment {
  font-style: italic;
  color: #666;
  margin-top: 5px;
  font-size: 13px;
}

.passengers-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
}

.no-passengers {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.passengers-filter {
  margin-bottom: 1rem;
  text-align: left;
}

.passengers-filter label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

/* Адаптация для мобильных */
@media (max-width: 768px) {
  .booking-details {
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

  .modal-content {
    padding: 1.5rem;
  }
  
  .driver-info-modal {
    flex-direction: column;
    text-align: center;
  }
}
</style>