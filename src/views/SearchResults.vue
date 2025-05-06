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

      <div v-if="showBookingConfirmation1" class="modal-overlay" @click.self="closeBookingModal">
        <div class="modal-content safety-modal">
          <button class="modal-close" @click="closeBookingModal">×</button>
          
          <template v-if="!showConfirmation">
            <h3>Подтверждение бронирования</h3>
            
            <div class="safety-notification">
              <div class="safety-icon">⚠️</div>
              <div class="safety-content">
                <h4>Ваша безопасность важна!</h4>
                <ul class="safety-checklist">
                  <li>Проверьте номер автомобиля - он должен совпадать с указанным в приложении</li>
                  <li>Убедитесь, что марка и модель авто соответствуют данным в заказе</li>
                  <li>Подтвердите личность водителя - сверьте фото и имя в приложении</li>
                  <li>Не садитесь в машину, если что-то вызывает подозрения</li>
                </ul>
              </div>
            </div>

              <!-- QR-код для оплаты -->
              <div class="qr-payment-section">
                <h4>Оплата через QR-код</h4>
                <div class="qr-code-placeholder">
                  <!-- Реальное изображение QR-кода с сохранением ваших стилей -->
                  <img src="/qr-code.png" alt="QR-код для оплаты" class="qr-code">
                  <p class="qr-hint">Отсканируйте QR-код для оплаты</p>
                </div>
      

              <div class="or-divider">
                <span>или</span>
              </div>
            </div>

            <!-- Поля для ввода данных карты -->
            <div class="payment-form">
              <div class="form-group">
                <label for="card-number">Номер карты</label>
                <input 
                  id="card-number" 
                  type="text" 
                  placeholder="1234 5678 9012 3456" 
                  class="card-input"
                  v-model="cardNumber"
                  maxlength="19"
                  @input="formatCardNumber"
                >
              </div>

              <div class="form-row">
                <div class="form-group half-width">
                  <label for="expiry-date">Срок действия</label>
                  <input 
                    id="expiry-date" 
                    type="text" 
                    placeholder="MM/ГГ" 
                    class="card-input"
                    v-model="expiryDate"
                    maxlength="5"
                    @input="formatExpiryDate"
                  >
                </div>

                <div class="form-group half-width">
                  <label for="cvv">CVV/CVC</label>
                  <input 
                    id="cvv" 
                    type="password" 
                    placeholder="•••" 
                    class="card-input"
                    v-model="cvv"
                    maxlength="3"
                  >
                </div>
              </div>

              <button class="btn-pay" @click="startPayment">
                Оплатить
              </button>
            </div>
          </template>

          <!-- Экран подтверждения оплаты -->
          <div v-if="showConfirmation" class="confirmation-screen">
            <div class="confirmation-icon">✓</div>
            <h3>Оплата прошла успешно!</h3>
            <p class="confirmation-text">Спасибо за использование нашего сервиса</p>
            
            <div v-if="showCodeInput" class="code-confirmation">
              <p>Введите код подтверждения из SMS:</p>
              <input 
                type="text" 
                v-model="confirmationCode"
                class="code-input"
                placeholder="1234"
                maxlength="4"
              >
              <button class="btn-confirm" @click="completePayment">
                Подтвердить
              </button>
            </div>
            
            <button class="btn-close" @click="closeBookingModal">
              Закрыть
            </button>
          </div>
        </div>
      </div>

      <!-- Сортировка и фильтры -->
      <div class="sort-filter-container">
        <div class="sort-controls">
          <div class="sort-select">
            <label>Сортировать по:</label>
            <select v-model="sortBy" @change="sortTrips">
              <option value="default">По умолчанию</option>
              <option value="experience">Стажу вождения</option>
              <option value="rating">Рейтингу</option>
              <option value="price-asc">Цене (по возрастанию)</option>
              <option value="price-desc">Цене (по убыванию)</option>
            </select>
            <span class="sort-icon">▼</span>
          </div>
        </div>
        
        <div class="filter-toggle" @click="toggleFilters">
          <span>Фильтры</span>
          <span class="filter-icon">⚙️</span>
        </div>
      </div>

      <!-- Дополнительные фильтры (скрыты/открыты) -->
      <transition name="slide-fade">
        <div v-if="showFilters" class="additional-filters">
          <div class="filter-options">
            <label class="filter-option">
              <input type="checkbox" v-model="filters.pets">
              <span class="filter-icon">🐾</span>
              <span>С животными</span>
            </label>
            
            <label class="filter-option">
              <input type="checkbox" v-model="filters.luggage">
              <span class="filter-icon">🧳</span>
              <span>С негабаритным багажом</span>
            </label>

            <label class="filter-option">
              <input type="checkbox" v-model="filters.big_size_luggage">
              <span class="filter-icon">🧳</span>
              <span>С крупно-габаритным багажом</span>
            </label>
            
            <label class="filter-option">
              <input type="checkbox" v-model="filters.childSeat">
              <span class="filter-icon">👶</span>
              <span>Детское кресло</span>
            </label>
          </div>
        </div>
      </transition>

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Загрузка результатов...</p>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="fetchTrips" class="btn-retry">Повторить попытку</button>
      </div>

      <!-- Список поездок -->
      <div class="trip-list">
        <div v-if="!loading && filteredTrips.length === 0" class="no-trips">
          <p>Нет подходящих поездок.</p>
          <button @click="resetFilters" class="btn-reset">Сбросить фильтры</button>
        </div>
        
        <div v-else>
          <div v-for="(trip, index) in filteredTrips" :key="index" class="trip-item">
            <div class="trip-header">
              <div class="driver-info">
                <router-link :to="`/driver/${trip.driver_id}`" class="driver-avatar-link">
                  <img 
                    :src="trip.avatarUrl || 'placeholder-image.jpg'" 
                    alt="Аватар" 
                    class="driver-avatar" 
                    @error="handleImageError"
                  >
                </router-link>
                <div class="driver-text-info">
                  <div class="driver-name">
                    {{ trip.name }} {{ trip.surname }}
                  </div>
                  <div class="driver-rating">
                    <span class="star">★</span>
                    <span class="rating-value">{{ trip.rating || 'Нет оценки' }}</span>
                    <span class="driver-experience">
                      • {{ calculateDrivingExperience(trip.license_issue_date) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="car-info">
                <span class="car-icon">🚗</span>
                {{ trip.brand }} {{ trip.mark }}
                <span class="car-year" v-if="trip.car_year">({{ trip.car_year }})</span>
              </div>
            </div>

            <div class="trip-details">
              <div class="detail-row">
                <div class="detail-label">Маршрут:</div>
                <div class="detail-value route-info">
                  <span class="location-link" @click="showPassengers(trip, 'departure')">
                    {{ trip.departure_location }}
                  </span>
                  <span class="route-arrow">→</span>
                  <span class="location-link" @click="showPassengers(trip, 'arrival')">
                    {{ trip.arrival_location }}
                  </span>
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-label">Дата и время:</div>
                <div class="detail-value datetime-info">
                  <span class="departure-time">{{ formatDateTime(trip.departure_time) }}</span>
                  <span class="travel-time">
                    ({{ calculateTravelTime(trip.departure_time, trip.arrival_time) }})
                  </span>
                </div>
              </div>

              <div class="detail-row" v-if="trip.stops && trip.stops.length > 0">
                <div class="detail-label">Остановки:</div>
                <div class="detail-value stops-info">
                  {{ trip.stops.join(', ') }}
                </div>
              </div>

              <div class="detail-row seats-price-row">
                <div class="seats-info">
                  <span class="seats-icon">🪑</span>
                  <span class="seats-count">{{ trip.available_seats }} из {{ trip.total_seats }}</span>
                </div>
                
                <div class="price-info">
                  <span class="price-label">Цена:</span>
                  <span class="price-value">{{ trip.cost }} ₽</span>
                  <span class="price-per-person" v-if="searchParams.passengers > 1">
                    ({{ Math.round(trip.cost / searchParams.passengers) }} ₽/чел)
                  </span>
                </div>
              </div>

              <div class="trip-features" v-if="trip.pets || trip.luggage || trip.child_seat||trip. big_size_luggage">
                <div class="feature-tag" v-if="trip.pets">
                  <span class="feature-icon">🐾</span>
                  <span>С животными</span>
                </div>
                <div class="feature-tag" v-if="trip.luggage">
                  <span class="feature-icon">🧳</span>
                  <span>С багажом</span>
                </div>
                <div class="feature-tag" v-if="trip. big_size_luggage">
                  <span class="feature-icon">🧳</span>
                  <span>С крупно-габаритным багажом</span>
                </div>
                <div class="feature-tag" v-if="trip.child_seat">
                  <span class="feature-icon">👶</span>
                  <span>Детское кресло</span>
                </div>
              </div>
            </div>

            <div class="trip-actions">
              <button 
                class="btn-primary"
                @click="bookTrip(trip)"
                :disabled="trip.available_seats < searchParams.passengers"
              >
                {{ trip.available_seats >= searchParams.passengers ? 'Забронировать' : 'Мест недостаточно' }}
              </button>
              
              <button 
                class="btn-secondary"
                @click="showTripDetails(trip)"
              >
                Подробнее
              </button>
            </div>
          </div>
            <!-- Модальное окно подтверждения бронирования с уведомлением о безопасности -->
          <div v-if="showBookingConfirmation" class="modal-overlay" @click.self="closeBookingModal">
            <div class="modal-content booking-modal">
              <button class="modal-close" @click="closeBookingModal">×</button>
              <h3>Подтверждение бронирования</h3>
              
              <div class="safety-notification">
                <div class="safety-icon">⚠️</div>
                <div class="safety-content">
                  <h4>Ваша безопасность важна!</h4>
                  <ul class="safety-checklist">
                    <li>Проверьте номер автомобиля - он должен совпадать с указанным в приложении</li>
                    <li>Убедитесь, что марка и модель авто соответствуют данным в заказе</li>
                    <li>Подтвердите личность водителя - сверьте фото и имя в приложении</li>
                    <li>Не садитесь в машину, если что-то вызывает подозрения</li>
                  </ul>
                  <p class="safety-warning">
                    Вы несете ответственность за свою безопасность. Если данные не совпадают или водитель ведет себя подозрительно - отмените поездку и сообщите в поддержку.
                  </p>
                </div>
              </div>

              <div class="booking-details">
                <h4>Детали поездки:</h4>
                <p><strong>Маршрут:</strong> {{ currentBookingTrip.departure_location }} → {{ currentBookingTrip.arrival_location }}</p>
                <p><strong>Дата:</strong> {{ formatDateTime(currentBookingTrip.departure_time) }}</p>
                <p><strong>Мест:</strong> {{ searchParams.passengers }}</p>
                <p><strong>Цена:</strong> {{ currentBookingTrip.cost }} ₽</p>
                <p><strong>Водитель:</strong> {{ currentBookingTrip.driver_name }} {{ currentBookingTrip.driver_surname }}</p>
                <p><strong>Автомобиль:</strong> {{ currentBookingTrip.car_brand }} {{ currentBookingTrip.car_model }} ({{ currentBookingTrip.car_year }})</p>
                <p><strong>Номер авто:</strong> {{ currentBookingTrip.car_number || 'не указан' }}</p>
              </div>

              <div class="booking-actions">
                <button class="btn-secondary" @click="closeBookingModal">Отменить</button>
                <button class="btn-primary" @click="confirmBooking">Подтвердить бронирование</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="back-button-container">
        <button class="btn-secondary" @click="goBack">
          ← Вернуться к поиску
        </button>
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
              <span v-if="passenger.passenger_rating " class="passenger-rating">
                ★ {{ passenger.passenger_rating .toFixed(1) }}
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
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from 'js-cookie';

// Конфигурация API
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://unigo.onrender.com';

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      showConfirmation: false,
      showCodeInput: false,
      confirmationCode: '',
      searchParams: {
        from: '',
        to: '',
        date: '',
        passengers: 1
        
      },
      trips: [],
      sortedTrips: [],
      filteredTrips: [],
      sortBy: 'default',
      loading: false,
      error: null,
      filters: {
        pets: false,
        luggage: false,
        childSeat: false
      },
      showFilters: false,
      showPassengersModal: false,
      showOnlyMyBookings: false,
      currentUserId: null,
      showBookingConfirmation: false,
      showBookingConfirmation1: false,
      currentBookingTrip: null,
      passengers: [],
      currentLocation: '',
      modalLocationType: 'departure',
      currentUser: null // Добавлено для хранения данных пользователя
    };
  },
  computed: {
    filteredPassengers() {
      let passengers = this.passengers;
      
      if (this.showOnlyMyBookings && this.currentUserId) {
        passengers = passengers.filter(p => p.user_id === this.currentUserId);
      }
      
      return passengers;
    },
    
    totalBookedSeats() {
      return this.filteredPassengers.reduce((sum, passenger) => sum + passenger.seats_booked, 0);
    }
  },
  watch: {
    filters: {
      handler() {
        this.applyFilters();
      },
      deep: true
    },
    sortBy() {
      this.sortTrips();
    }
  },
  async created() {
    await this.loadSearchParams();
    await this.fetchTrips();
  },
  methods: {

    startPayment() {
    // Имитация процесса оплаты
    this.showCodeInput = true;
    
    // Через 1 секунду показываем экран подтверждения
    setTimeout(() => {
      this.showConfirmation = true;
    }, 1000);
  },
  
  completePayment() {
    // Имитация успешного подтверждения
    this.showCodeInput = false;
    
    // Можно добавить дополнительную логику здесь
    setTimeout(() => {
      this.closeBookingModal();
    }, 1500);
  },

    formatCardNumber() {
    // Форматирование номера карты (добавляем пробелы через каждые 4 цифры)
    this.cardNumber = this.cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  },
  
  formatExpiryDate() {
    // Форматирование даты (добавляем / после 2 цифр)
    this.expiryDate = this.expiryDate.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 5);
  },
  
  processPayment() {
    // Здесь будет логика обработки платежа
    // Пока просто закрываем модальное окно
    this.closeBookingModal();
    
    // Можно добавить уведомление об успешной оплате
    this.$notify({
      title: 'Успешно!',
      text: 'Оплата прошла успешно',
      type: 'success'
    });
  },
    
    async loadSearchParams() {
      try {
        const params = Cookies.get('searchParams');
        if (params) {
          const parsedParams = JSON.parse(params);
          
          this.searchParams = {
            from: parsedParams.from || parsedParams.departure_location || '',
            to: parsedParams.to || parsedParams.arrival_location || '',
            date: parsedParams.date || parsedParams.trip_date || '',
            passengers: parsedParams.passengers || parsedParams.seats_needed || 1
          };
        }
      } catch (e) {
        console.error('Ошибка при загрузке параметров поиска:', e);
      }
    },
    
    async fetchTrips() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`https://unigo.onrender.com/api/trip/searchResult`, {
          params: {
            departure_location: this.searchParams.from,
            arrival_location: this.searchParams.to,
            date: this.searchParams.date,
            seats: this.searchParams.passengers
          },
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        });

        console.log('Ответ сервера:', response.data.trips[0]);
        
        // Обрабатываем новую структуру ответа
        if (response.data && response.data.success) {
          this.trips = response.data.trips || [];
          this.sortedTrips = [...this.trips];
          this.filteredTrips = [...this.trips];
          
          if (this.trips.length === 0) {
            this.error = 'Не найдено поездок по вашему запросу. Попробуйте изменить параметры поиска.';
          }
        } else {
          this.error = 'Неверный формат ответа от сервера';
          this.trips = [];
        }
      } catch (error) {
        console.error('Ошибка при загрузке поездок:', error);
        
        if (error.response) {
          switch (error.response.status) {
            case 401:
              this.error = 'Для просмотра результатов необходимо авторизоваться';
              this.$router.push('/login');
              break;
            case 400:
              this.error = error.response.data?.message || 'Некорректные параметры поиска';
              break;
            case 404:
              this.error = 'Сервис поиска временно недоступен';
              break;
            case 500:
              this.error = error.response.data?.message || 'Ошибка сервера при обработке запроса';
              break;
            default:
              this.error = 'Ошибка сервера';
          }
        } else if (error.request) {
          this.error = 'Не удалось подключиться к серверу. Проверьте интернет-соединение';
        } else {
          this.error = 'Произошла ошибка при выполнении запроса';
        }
        
        this.trips = [];
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      this.filteredTrips = this.sortedTrips.filter(trip => {
        if (this.filters.pets && !trip.pets) return false;
        if (this.filters.luggage && !trip.luggage) return false;
        if (this.filters.big_size_luggage && !trip.big_size_luggage) return false;
        if (this.filters.childSeat && !trip.child_seat) return false;
        
        return trip.available_seats >= this.searchParams.passengers;
      });
    },
    
    sortTrips() {
      switch(this.sortBy) {
        case 'experience':
          this.sortedTrips.sort((a, b) => {
            const aExp = new Date(a.license_issue_date).getTime();
            const bExp = new Date(b.license_issue_date).getTime();
            return bExp - aExp;
          });
          break;
          
        case 'rating':
          this.sortedTrips.sort((a, b) => {
            const aRating = a.rating || 0;
            const bRating = b.rating || 0;
            return bRating - aRating;
          });
          break;
          
        case 'price-asc':
          this.sortedTrips.sort((a, b) => a.cost - b.cost);
          break;
          
        case 'price-desc':
          this.sortedTrips.sort((a, b) => b.cost - a.cost);
          break;
          
        default:
          this.sortedTrips = [...this.trips];
      }
      
      this.applyFilters();
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    
    formatDateTime(datetimeString) {
      if (!datetimeString) return '';
      const date = new Date(datetimeString);
      
      const dayMonth = date.toLocaleString('ru-RU', { 
        month: 'long', 
        day: 'numeric' 
      });
      
      const time = date.toLocaleString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `${dayMonth}, ${time}`;
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
    
    calculateTravelTime(departure, arrival) {
      if (!departure || !arrival) return '';
      
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diff = arr - dep;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours === 0) return `${minutes} мин`;
      if (minutes === 0) return `${hours} ч`;
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
        console.log("1")
        
        if (trip.instant_booking) {
          console.log("inst book check")
          this.showBookingConfirmation1=true     
        }

        const response1 = await axios.post(
          `https://unigo.onrender.com/api/chat/create`,
          {
            trip_id: trip.id
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log("2")
         // Получаем chat_id из ответа сервера
        const chat_id = response1.data.chatId; // Предполагая, что сервер возвращает { chatId: ... }
        console.log("3")
        const response = await axios.post(
          `https://unigo.onrender.com/api/booking/create`,
          {
            trip_id: trip.id,
            chat_id: chat_id,
            seats_booked: this.searchParams.passengers
            // остальные поля не обязательны (будут установлены по умолчанию)
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Обновляем локальное состояние
        const booking = response.data.booking;
        const updatedTrip = response.data.trip;

        const index = this.trips.findIndex(t => t.id === updatedTrip.id);
        if (index !== -1) {
          this.trips.splice(index, 1, updatedTrip);
          this.sortTrips();
        }
        
        // Отправка уведомлений водителю
        if (trip.instant_booking) {
          try {
            // Уведомление в приложении
            await axios.post(
              `${API_BASE_URL}/api/notifications`,
              {
                user_id: trip.driver_id,
                title: 'Новый запрос на бронирование',
                message: `Пользователь ${this.currentUser.name} ${this.currentUser.surname} хочет забронировать ${this.searchParams.passengers} мест в вашей поездке`,
                type: 'booking_request',
                related_id: booking.id
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            // Email уведомление
            await axios.post(
              `${API_BASE_URL}/api/send-email`,
              {
                to: trip.driver_email,
                subject: 'Новый запрос на бронирование',
                template: 'booking_request',
                data: {
                  driver_name: trip.driver_name,
                  passenger_name: `${this.currentUser.name} ${this.currentUser.surname}`,
                  seats: this.searchParams.passengers,
                  trip_details: `${trip.departure_location} → ${trip.arrival_location}`,
                  trip_date: this.formatDate(trip.departure_time),
                  booking_link: `${window.location.origin}/driver/bookings/${booking.id}`
                }
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
          } catch (notificationError) {
            console.error('Ошибка отправки уведомлений водителю:', notificationError);
          }
        }
        
        // Уведомление пользователю
        this.$notify({
          title: 'Успешно!',
          text: trip.instant_booking 
            ? 'Запрос на бронирование отправлен водителю' 
            : `Вы забронировали ${this.searchParams.passengers} мест в поездке`,
          type: 'success'
        });
        
        // Перенаправление
        if (trip.instant_booking) {
          // Открываем чат с водителем
          this.$router.push(`/chat/${trip.driver_id}`);
        } else {
          // Для мгновенных бронирований - перенаправляем на страницу оплаты
          this.$router.push(`/payment/${booking.id}`);
        }
        
      } catch (error) {
        console.error('Ошибка бронирования:', error);
        
        let errorMessage = 'Ошибка при бронировании';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Для бронирования необходимо авторизоваться';
            this.$router.push('/login');
          } else if (error.response.status === 400) {
            errorMessage = error.response.data.message || 'Недостаточно свободных мест';
          }
        }
        
        this.$notify({
          title: 'Ошибка',
          text: errorMessage,
          type: 'error'
        });
      }
    },
    
    async showPassengers(trip, locationType) {
      this.modalLocationType = locationType;
      this.currentLocation = locationType === 'departure' 
        ? trip.departure_location 
        : trip.arrival_location;
      
      try {
        const token = Cookies.get('token');
        console.log("trip.trip_id",trip.id)

        const response = await axios.get(
          'https://unigo.onrender.com/api/user/get-all',
          {
            params: { // ✅ GET-параметры
              trip_id: trip.id 
            },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        
        this.passengers = (response.data.passengers || []).map(passenger => ({
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

        console.log("this.passengers",this.passengers)
        
        this.showPassengersModal = true;
      } catch (error) {
        console.error('Ошибка при загрузке пассажиров:', error);
        this.$notify({
          title: 'Ошибка',
          text: 'Не удалось загрузить информацию о пассажирах',
          type: 'error'
        });
      }
      
    },
    async confirmBooking() {
      try {
        const token = Cookies.get('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }

        const trip = this.currentBookingTrip;

        // Запрашиваем подтверждение для поездок с подтверждением
        if (trip.instant_booking) {
          const confirm = await this.$confirm(
            `Эта поездка требует подтверждения водителя. После бронирования вы будете перенаправлены в чат с водителем для уточнения деталей. Продолжить?`,
            'Подтверждение бронирования',
            {
              confirmButtonText: 'Да, забронировать',
              cancelButtonText: 'Отмена',
              type: 'info'
            }
          );
          
          if (!confirm) return;
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/trips/${trip.trip_id}/book`,
          {
            seats: this.searchParams.passengers,
            departure_location: trip.departure_location,
            arrival_location: trip.arrival_location
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const booking = response.data.booking;
        
        // Обновляем список поездок
        const updatedTrip = response.data.trip;
        const index = this.trips.findIndex(t => t.id === updatedTrip.id);
        if (index !== -1) {
          this.trips.splice(index, 1, updatedTrip);
          this.sortTrips();
        }
        
        // Отправка уведомлений водителю
        if (trip.instant_booking) {
          try {
            // Уведомление в приложении
            await axios.post(
              `${API_BASE_URL}/api/notifications`,
              {
                user_id: trip.driver_id,
                title: 'Новый запрос на бронирование',
                message: `Пользователь ${this.currentUser.name} ${this.currentUser.surname} хочет забронировать ${this.searchParams.passengers} мест в вашей поездке`,
                type: 'booking_request',
                related_id: booking.id
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            // Email уведомление
            await axios.post(
              `${API_BASE_URL}/api/send-email`,
              {
                to: trip.driver_email,
                subject: 'Новый запрос на бронирование',
                template: 'booking_request',
                data: {
                  driver_name: trip.driver_name,
                  passenger_name: `${this.currentUser.name} ${this.currentUser.surname}`,
                  seats: this.searchParams.passengers,
                  trip_details: `${trip.departure_location} → ${trip.arrival_location}`,
                  trip_date: this.formatDate(trip.departure_time),
                  booking_link: `${window.location.origin}/driver/bookings/${booking.id}`
                }
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
          } catch (notificationError) {
            console.error('Ошибка отправки уведомлений водителю:', notificationError);
          }
        }
        
        // Уведомление пользователю
        this.$notify({
          title: 'Успешно!',
          text: trip.instant_booking 
            ? 'Запрос на бронирование отправлен водителю' 
            : `Вы забронировали ${this.searchParams.passengers} мест в поездке`,
          type: 'success'
        });
        
        // Закрываем модальное окно
        this.closeBookingModal();
        
        // Перенаправление
        if (trip.instant_booking) {
          // Открываем чат с водителем
          this.$router.push(`/chat/${trip.driver_id}`);
        } else {
          // Для мгновенных бронирований - перенаправляем на страницу оплаты
          this.$router.push(`/payment/${booking.id}`);
        }
        
      } catch (error) {
        console.error('Ошибка бронирования:', error);
        
        let errorMessage = 'Ошибка при бронировании';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Для бронирования необходимо авторизоваться';
            this.$router.push('/login');
          } else if (error.response.status === 400) {
            errorMessage = error.response.data.message || 'Недостаточно свободных мест';
          }
        }
        
        this.$notify({
          title: 'Ошибка',
          text: errorMessage,
          type: 'error'
        });
      }
    },

    closeBookingModal() {
      this.showBookingConfirmation = false;
      this.showBookingConfirmation1 = false;
      //this.currentBookingTrip = null;
    },
    
    showTripDetails(trip) {
      this.$router.push(`/trip/${trip.id}`);
    },
    
    closeModal() {
      this.showPassengersModal = false;
      this.passengers = [];
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    
    resetFilters() {
      this.filters = {
        pets: false,
        luggage: false,
        childSeat: false
      };
      this.sortBy = 'default';
    },
    
    handleImageError(event) {
      event.target.src = '/pngwing.com (5).png';
    }
  }
};
</script>

<style scoped>
/* Стили для QR-кода */
.qr-payment-section {
  margin: 20px 0;
  text-align: center;
}

.qr-code-placeholder {
  margin: 15px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.qr-code {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  background: 
    linear-gradient(45deg, #333 25%, transparent 25%) -50px 0,
    linear-gradient(-45deg, #333 25%, transparent 25%) -50px 0,
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 100px 100px;
  background-color: #fff;
}

.qr-hint {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.or-divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #999;
}

.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.or-divider span {
  padding: 0 10px;
}

/* Стили для экрана подтверждения */
.confirmation-screen {
  text-align: center;
  padding: 20px;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #2ecc71;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
}

.confirmation-text {
  color: #666;
  margin: 15px 0 25px;
}

.code-confirmation {
  margin: 25px 0;
}

.code-input {
  padding: 12px;
  width: 100px;
  text-align: center;
  font-size: 18px;
  border: 2px solid #ddd;
  border-radius: 6px;
  margin: 10px 0;
}

.btn-confirm {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-close {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Стили для формы оплаты */
.payment-form {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.half-width {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.card-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.card-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Стили для кнопки оплаты */
.btn-pay {
  width: 100%;
  padding: 14px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.btn-pay:hover {
  background-color: #27ae60;
}

.btn-pay:active {
  transform: translateY(1px);
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

/* Контейнер содержимого модального окна */
.safety-modal {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Кнопка закрытия */
.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #777;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

/* Стили для блока безопасности - сохраняем ваши важные комментарии */
.safety-notification { /*важно */
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  gap: 15px;
}

.safety-icon { /*важно */
  font-size: 24px;
  color: #ff9800;
}

.safety-content h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e65100;
}

.safety-checklist {
  padding-left: 20px;
  margin: 10px 0;
}

.safety-checklist li {
  margin-bottom: 8px;
  font-size: 14px;
  position: relative;
  padding-left: 15px;
}

.safety-checklist li::before {
  content: "•";
  color: #ff9800;
  position: absolute;
  left: 0;
}

.safety-warning {
  font-size: 13px;
  color: #d32f2f;
  margin-top: 10px;
  font-weight: 500;
}


/* Основные стили */
.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* Параметры поиска */
.search-params-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.search-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.search-params p {
  margin: 5px 0;
  font-size: 14px;
}

/* Сортировка и фильтры */
.sort-filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.sort-controls {
  display: flex;
  align-items: center;
}

.sort-select {
  position: relative;
  display: inline-block;
}

.sort-select select {
  padding: 8px 30px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  appearance: none;
  font-size: 14px;
  cursor: pointer;
}

.sort-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 12px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}

.filter-toggle:hover {
  background-color: #e0e0e0;
}

.filter-icon {
  font-size: 16px;
}

/* Дополнительные фильтры */
.additional-filters {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #eee;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.filter-option input {
  margin: 0;
}

/* Список поездок */
.trip-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.trip-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s ease;
}

.trip-item:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Шапка поездки */
.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.driver-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.driver-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.driver-text-info {
  display: flex;
  flex-direction: column;
}

.driver-name {
  font-weight: bold;
  font-size: 16px;
}

.driver-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.star {
  color: #ffc107;
}

.driver-experience {
  font-size: 13px;
  color: #777;
}

.car-info {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
}

.car-icon {
  font-size: 16px;
}

.car-year {
  color: #888;
  font-size: 13px;
}

/* Детали поездки */
.trip-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #666;
  min-width: 120px;
}

.detail-value {
  color: #333;
  text-align: right;
  flex-grow: 1;
  margin-left: 10px;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.location-link {
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
}

.location-link:hover {
  color: #2980b9;
}

.route-arrow {
  color: #999;
}

.datetime-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.travel-time {
  color: #666;
  font-size: 13px;
}

.seats-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.seats-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.seats-icon {
  font-size: 16px;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.price-label {
  font-size: 13px;
  color: #666;
}

.price-value {
  font-weight: bold;
  font-size: 18px;
  color: #2ecc71;
}

.price-per-person {
  font-size: 12px;
  color: #888;
}

/* Особенности поездки */
.trip-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #e8f4fd;
  color: #135c8d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.feature-icon {
  font-size: 14px;
}

/* Кнопки действий */
.trip-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-grow: 1;
  text-align: center;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #105d91;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #135e90;
  border: 1px solid #0e6199;
}

.btn-secondary:hover {
  background-color: #f5f9fd;
}

/* Кнопка "Назад" */
.back-button-container {
  margin-top: 30px;
  text-align: center;
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
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #777;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.location-info {
  color: #145581;
  margin-bottom: 15px;
  font-weight: bold;
}

/* Список пассажиров */
.passengers-list {
  margin-top: 15px;
}

.passenger-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.passenger-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.passenger-info {
  flex-grow: 1;
}

.passenger-name {
  font-weight: bold;
}

.passenger-details {
  font-size: 13px;
  color: #666;
}

.passenger-seats {
  font-size: 12px;
  color: #888;
}

.no-passengers {
  text-align: center;
  padding: 20px;
  color: #777;
}

/* Индикатор загрузки */
.loading-indicator {
  text-align: center;
  padding: 30px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #084a76;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Сообщение об ошибке */
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.btn-retry {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.btn-retry:hover {
  background-color: #b71c1c;
}

/* Нет поездок */
.no-trips {
  text-align: center;
  padding: 30px;
  color: #777;
}
/* Модальное окно с пассажирами */
.modal-overlay { /*важно */
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
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-close { /*важно */
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #777;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
  margin-bottom: 5px;
}

.location-info {
  color: #3498db;
  margin-bottom: 15px;
  font-weight: 500;
}

.passengers-filter {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.passengers-filter label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* Список пассажиров */
.passengers-list {
  margin: 15px 0;
}

.passenger-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.passenger-item:last-child {
  border-bottom: none;
}

.passenger-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
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
  align-items: center;
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
  align-items: center;
  gap: 15px;
  font-size: 13px;
  margin-bottom: 5px;
}

.passenger-seats {
  color: #555;
}

.passenger-price {
  color: #2ecc71;
  font-weight: bold;
}

.passenger-comment {
  font-size: 13px;
  color: #666;
  font-style: italic;
  padding: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 5px;
}

.no-passengers {
  text-align: center;
  padding: 20px;
  color: #777;
  font-size: 14px;
}

.passengers-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #555;
}

.passengers-summary p {
  margin: 5px 0;
}

/* Анимация */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.btn-reset {
  background-color: #0c4f7c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
}

.btn-reset:hover {
  background-color: #2980b9;
}

/* Анимации */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .search-results {
    padding: 15px;
  }
  
  .search-params {
    grid-template-columns: 1fr;
  }
  
  .sort-filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .trip-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .trip-actions {
    flex-direction: column;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 3px;
  }
  
  .detail-label {
    min-width: auto;
  }
  
  .detail-value {
    text-align: left;
    margin-left: 0;
  }
  
  .seats-price-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  /* Стили для модального окна бронирования */
.booking-modal {
  max-width: 600px;
  padding: 25px;
}

.safety-notification {
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  gap: 15px;
}

.safety-icon {
  font-size: 24px;
  color: #ff9800;
}

.safety-content h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e65100;
}

.safety-checklist {
  padding-left: 20px;
  margin: 10px 0;
}

.safety-checklist li {
  margin-bottom: 8px;
  font-size: 14px;
}

.safety-warning {
  font-size: 13px;
  color: #d32f2f;
  font-weight: 500;
}

.booking-details {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.booking-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.booking-details p {
  margin: 5px 0;
  font-size: 14px;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Стили для блока безопасности */
.safety-notification { /*важно */
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  gap: 15px;
}

.safety-icon { /*важно */
  font-size: 24px;
  color: #ff9800;
}

.safety-content h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e65100;
}

.safety-checklist {
  padding-left: 20px;
  margin: 10px 0;
}

.safety-checklist li {
  margin-bottom: 8px;
  font-size: 14px;
  position: relative;
  padding-left: 15px;
}

.safety-checklist li::before {
  content: "•";
  color: #ff9800;
  position: absolute;
  left: 0;
}

.safety-warning {
  font-size: 13px;
  color: #d32f2f;
  margin-top: 10px;
}

/* Стили для деталей брони */
.booking-details {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.booking-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.booking-details p {
  margin: 6px 0;
  font-size: 14px;
}

/*ппроьрпавапро */

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

/* Контейнер содержимого модального окна */
.safety-modal {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Кнопка закрытия */
.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #777;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

/* Стили для блока безопасности - сохраняем ваши важные комментарии */
.safety-notification { /*важно */
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  gap: 15px;
}

.safety-icon { /*важно */
  font-size: 24px;
  color: #ff9800;
}

.safety-content h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e65100;
}

.safety-checklist {
  padding-left: 20px;
  margin: 10px 0;
}

.safety-checklist li {
  margin-bottom: 8px;
  font-size: 14px;
  position: relative;
  padding-left: 15px;
}

.safety-checklist li::before {
  content: "•";
  color: #ff9800;
  position: absolute;
  left: 0;
}

.safety-warning {
  font-size: 13px;
  color: #d32f2f;
  margin-top: 10px;
  font-weight: 500;
}

/* Стили для формы оплаты */
.payment-form {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.half-width {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.card-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.card-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Стили для кнопки оплаты */
.btn-pay {
  width: 100%;
  padding: 14px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.btn-pay:hover {
  background-color: #27ae60;
}

.btn-pay:active {
  transform: translateY(1px);
}

/* Стили для QR-кода */
.qr-payment-section {
  margin: 20px 0;
  text-align: center;
}

.qr-code-placeholder {
  margin: 15px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.qr-code {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  display: block; /* Добавляем, чтобы изображение правильно центрировалось */
}

.qr-hint {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.or-divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #999;
}

.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.or-divider span {
  padding: 0 10px;
}

/* Стили для экрана подтверждения */
.confirmation-screen {
  text-align: center;
  padding: 20px;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #2ecc71;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
}

.confirmation-text {
  color: #666;
  margin: 15px 0 25px;
}

.code-confirmation {
  margin: 25px 0;
}

.code-input {
  padding: 12px;
  width: 100px;
  text-align: center;
  font-size: 18px;
  border: 2px solid #ddd;
  border-radius: 6px;
  margin: 10px 0;
}

.btn-confirm {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-close {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}



/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .booking-modal {
    padding: 15px;
  }

  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .half-width {
    width: 100%;
  }

  .safety-notification {
    flex-direction: column;
    gap: 10px;
  }
  
  .safety-notification {
    flex-direction: column;
    gap: 10px;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .booking-actions button {
    width: 100%;
  }
}
}
</style>