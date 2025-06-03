<template>
  <div class="search-results-container">
    <AppNavbar />

    <div class="search-results">
      <h1>Результаты поиска</h1>

      <!-- Search Parameters -->
      <div class="search-params-container">
        <div class="search-params">
          <p><strong>Откуда:</strong> {{ searchParams.from }}</p>
          <p><strong>Куда:</strong> {{ searchParams.to }}</p>
          <p><strong>Дата:</strong> {{ formatDate(searchParams.date) }}</p>
          <p><strong>Места:</strong> {{ searchParams.passengers }}</p>
        </div>
      </div>

      <!-- Payment Modal -->
      <div v-if="showPaymentModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" role="dialog" aria-labelledby="payment-modal-title">
          <button class="modal-close" @click="closeModal" aria-label="Закрыть модальное окно">×</button>

          <template v-if="!showPaymentConfirmation">
            <h3 id="payment-modal-title">Оплата поездки</h3>

            <div class="safety-notification">
              <div class="safety-icon">⚠️</div>
              <div class="safety-content">
                <h4>Безопасность превыше всего!</h4>
                <ul class="safety-checklist">
                  <li>Убедитесь, что номер автомобиля совпадает с приложением</li>
                  <li>Проверьте марку и модель автомобиля</li>
                  <li>Подтвердите личность водителя</li>
                  <li>Не садитесь, если что-то вызывает подозрения</li>
                </ul>
              </div>
            </div>

            <!-- Demo Payment Form -->
            <div class="payment-form">
              <div class="form-group">
                <label for="card-number">Номер карты</label>
                <input
                  id="card-number"
                  v-model="paymentDetails.cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  @input="formatCardNumber"
                  :class="{ 'input-error': paymentErrors.cardNumber }"
                  aria-describedby="card-number-error"
                />
                <div v-if="paymentErrors.cardNumber" id="card-number-error" class="error-text">
                  {{ paymentErrors.cardNumber }}
                </div>
              </div>
              <div class="form-row">
                <div class="form-group half-width">
                  <label for="card-expiry">Срок действия</label>
                  <input
                    id="card-expiry"
                    v-model="paymentDetails.expiry"
                    type="text"
                    placeholder="ММ/ГГ"
                    maxlength="5"
                    @input="formatExpiry"
                    :class="{ 'input-error': paymentErrors.expiry }"
                    aria-describedby="card-expiry-error"
                  />
                  <div v-if="paymentErrors.expiry" id="card-expiry-error" class="error-text">
                    {{ paymentErrors.expiry }}
                  </div>
                </div>
                <div class="form-group half-width">
                  <label for="card-cvv">CVV</label>
                  <input
                    id="card-cvv"
                    v-model="paymentDetails.cvv"
                    type="text"
                    placeholder="123"
                    maxlength="3"
                    @input="formatCvv"
                    :class="{ 'input-error': paymentErrors.cvv }"
                    aria-describedby="card-cvv-error"
                  />
                  <div v-if="paymentErrors.cvv" id="card-cvv-error" class="error-text">
                    {{ paymentErrors.cvv }}
                  </div>
                </div>
              </div>
              <button
                class="btn-pay"
                @click="processDemoPayment"
                :disabled="isPaymentProcessing"
                aria-label="Оплатить поездку"
              >
                <span v-if="isPaymentProcessing" class="spinner small"></span>
                {{ isPaymentProcessing ? 'Обработка...' : 'Оплатить' }}
              </button>
              <div v-if="paymentError" class="error-message">
                {{ paymentError }}
              </div>
            </div>
          </template>

          <!-- Payment Confirmation -->
          <div v-if="showPaymentConfirmation" class="confirmation-screen">
            <div class="confirmation-icon">✓</div>
            <p class="confirmation-text">Оплата успешно завершена!</p>
            <div class="receipt-summary">
              <p><strong>Сумма:</strong> <span class="highlight">{{ currentBookingTrip.cost }} ₽</span></p>
              <p><strong>Оплата бронирования:</strong> <span class="highlight">{{ Math.round(currentBookingTrip.cost * 0.1) }} ₽</span></p>
              <p><strong>Номер транзакции:</strong> <span class="highlight">{{ transactionId }}</span></p>
              <p><strong>Дата:</strong> <span class="highlight">{{ transactionDate }}</span></p>
            </div>
            <button class="btn-confirm" @click="completeBooking" aria-label="Перейти к поездке">
              Перейти к поездке
            </button>
          </div>
        </div>
      </div>

      <!-- Sort and Filters -->
      <div class="sort-filter-container">
        <div class="sort-controls">
          <div class="sort-select">
            <label for="sort-by">Сортировать по:</label>
            <select id="sort-by" v-model="sortBy" @change="sortTrips" aria-label="Сортировать результаты">
              <option value="default">По умолчанию</option>
              <option value="experience">Стаж вождения</option>
              <option value="rating">Рейтинг</option>
              <option value="price-asc">Цена (по возрастанию)</option>
              <option value="price-desc">Цена (по убыванию)</option>
            </select>
            <span class="sort-icon">▼</span>
          </div>
        </div>
        <button class="filter-toggle" @click="toggleFilters" aria-label="Открыть фильтры">
          <span>Фильтры</span>
          <span class="filter-icon">⚙️</span>
        </button>
      </div>

      <!-- Additional Filters -->
      <transition name="slide-fade">
        <div v-if="showFilters" class="additional-filters">
          <div class="filter-options">
            <label class="filter-option">
              <input type="checkbox" v-model="filters.pets" aria-label="Разрешены животные" />
              <span class="filter-icon">🐾</span>
              <span>Разрешены животные</span>
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="filters.luggage" aria-label="Багаж" />
              <span class="filter-icon">🧳</span>
              <span>Багаж</span>
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="filters.big_size_luggage" aria-label="Крупногабаритный багаж" />
              <span class="filter-icon">🧳</span>
              <span>Крупногабаритный багаж</span>
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="filters.childSeat" aria-label="Детское кресло" />
              <span class="filter-icon">👶</span>
              <span>Детское кресло</span>
            </label>
          </div>
        </div>
      </transition>

      <!-- Loading Indicator -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="fetchTrips" class="btn-primary" aria-label="Повторить загрузку">Повторить</button>
      </div>

      <!-- Trip List -->
      <div class="trip-list">
        <div v-if="!loading && filteredTrips.length === 0" class="no-trips">
          <p>Поездки не найдены.</p>
          <button @click="resetFilters" class="btn-primary" aria-label="Сбросить фильтры">Сбросить фильтры</button>
        </div>

        <div v-else v-for="(trip, index) in filteredTrips" :key="index" class="trip-item">
          <div class="trip-header">
            <div class="driver-info">
              <router-link :to="`/driver/${trip.driver_id}`" :aria-label="`Профиль водителя ${trip.name} ${trip.surname}`">
                <img
                  :src="trip.avatarUrl || '/images/default-avatar.jpg'"
                  alt="Аватар водителя"
                  class="driver-avatar"
                  @error="handleImageError"
                />
              </router-link>
              <div class="driver-text-info">
                <div class="driver-name">{{ trip.name }} {{ trip.surname }}</div>
                <div class="driver-rating">
                  <span class="star">★</span>
                  <span class="rating-value">{{ trip.rating || 'Без рейтинга' }}</span>
                  <span class="driver-experience">• {{ calculateDrivingExperience(trip.license_issue_date) }}</span>
                </div>
              </div>
            </div>
            <div class="car-info">
              <span class="car-icon">🚗</span>
              {{ trip.brand }} {{ trip.mark }} ({{ trip.car_year }})
            </div>
          </div>

          <div class="trip-details">
            <div class="detail-row">
              <div class="detail-label">Маршрут:</div>
              <div class="detail-value route-info">
                <button class="location-link" @click="showPassengers(trip, 'departure')" :aria-label="`Пассажиры на отправление из ${trip.departure_location}`">
                  {{ trip.departure_location }}
                </button>
                <span class="route-arrow">→</span>
                <button class="location-link" @click="showPassengers(trip, 'arrival')" :aria-label="`Пассажиры на прибытие в ${trip.arrival_location}`">
                  {{ trip.arrival_location }}
                </button>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Дата и время:</div>
              <div class="detail-value datetime-info">
                <span class="departure-time">{{ formatDateTime(trip.departure_time) }}</span>
                <span class="travel-time">({{ calculateTravelTime(trip.departure_time, trip.arrival_time) }})</span>
              </div>
            </div>
            <div class="detail-row" v-if="trip.stops && trip.stops.length">
              <div class="detail-label">Остановки:</div>
              <div class="detail-value">{{ trip.stops.join(', ') }}</div>
            </div>
            <div class="detail-row seats-price-row">
              <div class="seats-info">
                <span class="seats-icon">🪑</span>
                <span>{{ trip.available_seats }} из {{ trip.total_seats }}</span>
              </div>
              <div class="price-info">
                <span class="price-label">Цена:</span>
                <span class="price-value">{{ trip.cost }} ₽</span>
                <span v-if="searchParams.passengers > 1" class="price-per-person">
                  ({{ Math.round(trip.cost / searchParams.passengers) }} ₽/чел.)
                </span>
              </div>
              <div class="price-info">
                <span class="price-label">Сумма бронирования:</span>
                <span class="price-value">{{ trip.cost*0.1 }} ₽</span>
                <span v-if="searchParams.passengers > 1" class="price-per-person">
                  ({{ Math.round(trip.cost*0.1 / searchParams.passengers) }} ₽/чел.)
                </span>
              </div>
            </div>
            <div class="trip-features" v-if="trip.pets || trip.luggage || trip.big_size_luggage || trip.child_seat">
              <div class="feature-tag" v-if="trip.pets"><span class="feature-icon">🐾</span> Животные</div>
              <div class="feature-tag" v-if="trip.luggage"><span class="feature-icon">🧳</span> Багаж</div>
              <div class="feature-tag" v-if="trip.big_size_luggage"><span class="feature-icon">🧳</span> Крупный багаж</div>
              <div class="feature-tag" v-if="trip.child_seat"><span class="feature-icon">👶</span> Детское кресло</div>
            </div>
          </div>

          <div class="trip-actions">
            <button
              class="btn-primary"
              @click="initiateBooking(trip)"
              :disabled="trip.available_seats < searchParams.passengers"
              :aria-label="trip.available_seats >= searchParams.passengers ? 'Забронировать поездку' : 'Недостаточно мест'"
            >
              {{ trip.available_seats >= searchParams.passengers ? 'Забронировать' : 'Недостаточно мест' }}
            </button>
            <button class="btn-secondary" @click="showTripDetails(trip)" aria-label="Подробности поездки">Подробности</button>
          </div>
        </div>
      </div>

      <!-- Passengers Modal -->
      <div v-if="showPassengersModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" role="dialog" aria-labelledby="passengers-modal-title">
          <button class="modal-close" @click="closeModal" aria-label="Закрыть модальное окно">×</button>
          <h3 id="passengers-modal-title">Пассажиры ({{ modalLocationType === 'departure' ? 'Отправление' : 'Прибытие' }})</h3>
          <p class="location-info">{{ currentLocation }}</p>

          <div class="passengers-filter">
            <label>
              <input type="checkbox" v-model="showOnlyMyBookings" aria-label="Показать только мои бронирования" />
              Показать только мои бронирования
            </label>
          </div>

          <div class="passengers-list">
            <div v-if="isLoadingPassengers" class="loading-indicator">
              <div class="spinner"></div>
              <p>Загрузка пассажиров...</p>
            </div>
            <div v-else-if="errorLoadingPassengers" class="error-message">
              {{ errorLoadingPassengers }}
            </div>
            <div v-else-if="filteredPassengers.length === 0" class="no-passengers">
              <p>Пассажиры не забронированы.</p>
            </div>
            <div v-else v-for="(passenger, index) in filteredPassengers" :key="index" class="passenger-item">
              <router-link :to="`/profile/${passenger.user_id}`" :aria-label="`Профиль пассажира ${passenger.name} ${passenger.surname}`">
                <img
                  :src="passenger.avatarUrl || '/images/default-avatar.jpg'"
                  alt="Аватар пассажира"
                  class="passenger-avatar"
                  @error="handleImageError"
                />
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
                  <span class="passenger-seats">Места: {{ passenger.seats_booked || 1 }}</span>
                  <span class="passenger-price">{{ passenger.cost || 'Не указано' }} ₽</span>
                </div>
                <div v-if="passenger.comment" class="passenger-comment">"{{ passenger.comment }}"</div>
              </div>
            </div>
          </div>

          <div class="passengers-summary">
            <p>Всего пассажиров: {{ filteredPassengers.length }}</p>
            <p>Всего мест: {{ totalBookedSeats }}</p>
          </div>
        </div>
      </div>

      <div class="back-button-container">
        <button class="btn-secondary" @click="goBack" aria-label="Вернуться назад">← Назад</button>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/config/api";
import mitt from 'mitt';

const emitter = mitt();

export default {
  components: { AppNavbar },
  data() {
    return {
      searchParams: { from: "", to: "", date: "", passengers: 1 },
      trips: [],
      sortedTrips: [],
      filteredTrips: [],
      sortBy: "default",
      loading: false,
      error: null,
      filters: { pets: false, luggage: false, childSeat: false, big_size_luggage: false },
      showFilters: false,
      showPassengersModal: false,
      showOnlyMyBookings: false,
      showPaymentModal: false,
      showPaymentConfirmation: false,
      currentBookingTrip: null,
      passengers: [],
      currentLocation: "",
      modalLocationType: "departure",
      paymentError: "",
      transactionId: "",
      transactionDate: "",
      locale: "ru-RU",
      paymentDetails: {
        cardNumber: "",
        expiry: "",
        cvv: "",
      },
      paymentErrors: {
        cardNumber: "",
        expiry: "",
        cvv: "",
      },
      isPaymentProcessing: false,
      isLoadingPassengers: false,
      errorLoadingPassengers: null,
    };
  },
  computed: {
    filteredPassengers() {
      return this.showOnlyMyBookings
        ? this.passengers.filter((p) => p.user_id === Cookies.get("user_id"))
        : this.passengers;
    },
    totalBookedSeats() {
      return this.filteredPassengers.reduce((sum, p) => sum + (p.seats_booked || 0), 0);
    },
  },
  watch: {
    filters: {
      handler() {
        this.applyFilters();
      },
      deep: true,
    },
    sortBy() {
      this.sortTrips();
    },
  },
  created() {
    this.loadSearchParams();
    this.fetchTrips();
  },
  methods: {
    async loadSearchParams() {
      try {
        const params = Cookies.get("searchParams");
        if (params) {
          const parsed = JSON.parse(params);
          this.searchParams = {
            from: parsed.from || parsed.departure_location || "",
            to: parsed.to || parsed.arrival_location || "",
            date: parsed.date || parsed.trip_date || "",
            passengers: parsed.passengers || parsed.seats_needed || 1,
          };
        }
      } catch (error) {
        console.error("Ошибка загрузки параметров поиска:", error);
        this.error = "Не удалось загрузить параметры поиска";
      }
    },
    async fetchTrips() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(API_CONFIG.BASE_URL + "/trip/searchResult", {
          params: {
            departure_location: this.searchParams.from,
            arrival_location: this.searchParams.to,
            date: this.searchParams.date,
            seats: this.searchParams.passengers,
          },
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
        if (response.data.success) {
          this.trips = response.data.trips || [];
          this.sortedTrips = [...this.trips];
          this.filteredTrips = [...this.trips];
          if (!this.trips.length) {
            this.error = "Поездки не найдены. Попробуйте изменить параметры поиска.";
          }
        } else {
          this.error = response.data.message || "Неверный ответ сервера";
        }
      } catch (error) {
        this.error = this.getErrorMessage(error);
        this.trips = [];
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            this.$router.push("/login");
            return "Требуется авторизация";
          case 400:
            return error.response.data?.message || "Неверные параметры поиска";
          case 404:
            return "Сервис поиска недоступен";
          case 500:
            return "Ошибка сервера";
          default:
            return "Ошибка сервера";
        }
      }
      return error.request ? "Нет соединения с сервером" : "Ошибка запроса";
    },
    applyFilters() {
      this.filteredTrips = this.sortedTrips.filter((trip) => {
        if (this.filters.pets && !trip.pets) return false;
        if (this.filters.luggage && !trip.luggage) return false;
        if (this.filters.big_size_luggage && !trip.big_size_luggage) return false;
        if (this.filters.childSeat && !trip.child_seat) return false;
        return trip.available_seats >= this.searchParams.passengers;
      });
    },
    sortTrips() {
      this.sortedTrips = [...this.trips];
      switch (this.sortBy) {
        case "experience":
          this.sortedTrips.sort((a, b) => new Date(a.license_issue_date) - new Date(b.license_issue_date));
          break;
        case "rating":
          this.sortedTrips.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "price-asc":
          this.sortedTrips.sort((a, b) => a.cost - b.cost);
          break;
        case "price-desc":
          this.sortedTrips.sort((a, b) => b.cost - a.cost);
          break;
      }
      this.applyFilters();
    },
    formatDate(dateString) {
      if (!dateString || isNaN(new Date(dateString).getTime())) return "Не указано";
      return new Date(dateString).toLocaleDateString(this.locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    formatDateTime(datetimeString) {
      if (!datetimeString || isNaN(new Date(datetimeString).getTime())) return "Не указано";
      const date = new Date(datetimeString);
      return date.toLocaleString(this.locale, {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    calculateAge(birthDate) {
      if (!birthDate || isNaN(new Date(birthDate).getTime())) return "Не указан";
      const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
      return age >= 0 ? age : "Неверная дата";
    },
    calculateDrivingExperience(licenseDate) {
      if (!licenseDate || isNaN(new Date(licenseDate).getTime())) return "Не указан";
      const experience = new Date().getFullYear() - new Date(licenseDate).getFullYear();
      return experience <= 0 ? "Менее года" : `${experience} ${this.declension(experience, ["год", "года", "лет"])}`;
    },
    calculateTravelTime(departure, arrival) {
      if (!departure || !arrival || isNaN(new Date(departure).getTime()) || isNaN(new Date(arrival).getTime())) return "Не указано";
      const diff = new Date(arrival) - new Date(departure);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return hours ? `${hours}ч ${minutes}м` : `${minutes}м`;
    },
    declension(number, titles) {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)]];
    },
    initiateBooking(trip) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      this.currentBookingTrip = trip;
      this.showPaymentModal = true;
      this.resetPaymentForm();
    },
    resetPaymentForm() {
      this.paymentDetails = { cardNumber: "", expiry: "", cvv: "" };
      this.paymentErrors = { cardNumber: "", expiry: "", cvv: "" };
      this.paymentError = "";
      this.isPaymentProcessing = false;
    },
    formatCardNumber() {
      let value = this.paymentDetails.cardNumber.replace(/\D/g, "");
      value = value.slice(0, 16);
      value = value.replace(/(.{4})/g, "$1 ").trim();
      this.paymentDetails.cardNumber = value;
    },
    formatExpiry() {
      let value = this.paymentDetails.expiry.replace(/\D/g, "");
      value = value.slice(0, 4);
      if (value.length > 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
      this.paymentDetails.expiry = value;
    },
    formatCvv() {
      this.paymentDetails.cvv = this.paymentDetails.cvv.replace(/\D/g, "").slice(0, 3);
    },
    validatePaymentDetails() {
      this.paymentErrors = { cardNumber: "", expiry: "", cvv: "" };
      let isValid = true;

      const cardNumber = this.paymentDetails.cardNumber.replace(/\s/g, "");
      if (!/^\d{16}$/.test(cardNumber)) {
        this.paymentErrors.cardNumber = "Введите 16-значный номер карты";
        isValid = false;
      }

      const expiry = this.paymentDetails.expiry;
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        this.paymentErrors.expiry = "Введите срок действия в формате ММ/ГГ";
        isValid = false;
      } else {
        const [month, year] = expiry.split("/").map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
          this.paymentErrors.expiry = "Срок действия истек или неверный";
          isValid = false;
        }
      }

      if (!/^\d{3}$/.test(this.paymentDetails.cvv)) {
        this.paymentErrors.cvv = "Введите 3-значный CVV код";
        isValid = false;
      }

      return isValid;
    },
    async processDemoPayment() {
      if (!this.validatePaymentDetails()) return;

      this.isPaymentProcessing = true;
      this.paymentError = "";

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const paymentData = {
          PaymentId: `DEMO-${Date.now()}`,
          Status: "succeeded",
        };
        this.handlePaymentSuccess(paymentData);
      } catch (error) {
        this.paymentError = "Не удалось обработать платеж. Попробуйте снова.";
        this.isPaymentProcessing = false;
        console.error("Ошибка демо-оплаты:", error);
      }
    },
    async handlePaymentSuccess(paymentData) {
      this.transactionId = paymentData.PaymentId;
      this.transactionDate = new Date().toLocaleString(this.locale);
      this.showPaymentConfirmation = true;
      this.isPaymentProcessing = false;
      await this.sendPaymentConfirmation(paymentData);
    },
    async sendPaymentConfirmation(paymentData) {
      try {
        const token = Cookies.get("token");
        await axios.post(
          API_CONFIG.BASE_URL + "/payment/confirm",
          {
            trip_id: this.currentBookingTrip.id,
            payment_id: paymentData.PaymentId,
            amount: this.currentBookingTrip.cost,
            status: "succeeded",
            payment_data: paymentData,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Ошибка подтверждения платежа:", error);
        this.paymentError = "Ошибка подтверждения платежа";
      }
    },
    async completeBooking() {
      try {
        const token = Cookies.get("token");
        const trip = this.currentBookingTrip;

        const chatResponse = await axios.post(
          API_CONFIG.BASE_URL + "/chat/create",
          { trip_id: trip.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chatId = chatResponse.data.chatId;

        const bookingResponse = await axios.post(
          API_CONFIG.BASE_URL + "/booking/create",
          {
            trip_id: trip.id,
            chat_id: chatId,
            seats_booked: this.searchParams.passengers,
            transaction_id: this.transactionId,
            departure_location: trip.departure_location,
            arrival_location: trip.arrival_location,
            departure_time: trip.departure_time,
            stops: trip.stops || [],
            driver_id: trip.driver_id || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Эмитируем событие с полными данными бронирования
        emitter.emit('bookingCreated', {
          booking_id: bookingResponse.data.booking_id,
          trip_id: trip.id,
          departure_location: trip.departure_location,
          arrival_location: trip.arrival_location,
          departure_time: trip.departure_time,
          seats_booked: this.searchParams.passengers,
          stops: trip.stops || [],
          driver_id: trip.driver_id,
        });

        await this.fetchTrips();
        this.closeModal();

        const userResponse = await axios.get(
          API_CONFIG.BASE_URL +'/user/get-id',
          { headers: { 'Authorization': `Bearer ${this.token}` } }
        );

        // Отправка сообщения водителю о бронированииAdd commentMore actions
        try {
          const messageContent = `Вашу поездку забронировали на ${this.searchParams.passengers} мест. Осталось свободных мест: ${trip.total_seats - trip.available_seats - this.searchParams.passengers}`;
          
          // Отправка через HTTP API
          await axios.post(
            `${API_CONFIG.BASE_URL}/chat/${chatId}/messages`,
            {
              content: messageContent,
              sender_id: userResponse.data.user_id
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          console.log('Уведомление водителю отправлено');
        } catch (error) {
          console.error('Ошибка при отправке уведомления водителю:', error);
        }

        this.$router.push(`/chat/${chatId}`);
      } catch (error) {
        this.$notify({
          title: "Ошибка",
          text: "Не удалось завершить бронирование",
          type: "error",
        });
        console.error("Ошибка завершения бронирования:", error);
      }
    },
    async showPassengers(trip, locationType) {
      this.modalLocationType = locationType;
      this.currentLocation = locationType === "departure" ? trip.departure_location : trip.arrival_location;
      this.isLoadingPassengers = true;
      this.errorLoadingPassengers = null;
      try {
        const response = await axios.get(API_CONFIG.BASE_URL + "/user/get-all", {
          params: { trip_id: trip.id },
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
        this.passengers = (response.data.passengers || []).map((p) => ({
          ...p,
          name: p.name || "Не указано",
          surname: p.surname || "",
          gender: p.gender || "unknown",
          passenger_rating: p.passenger_rating ? parseFloat(p.passenger_rating) : null,
          seats_booked: p.seats_booked || 1,
          birthday: p.birthday || null,
          //cost: p.cost || trip.cost,
          user_id: p.id || null,
          //comment: p.comment || "",
          avatarUrl: p.avatarUrl || "/images/default-avatar.jpg",
        }));
        this.showPassengersModal = true;
      } catch (error) {
        this.errorLoadingPassengers = "Не удалось загрузить пассажиров";
        this.$notify({ title: "Ошибка", text: this.errorLoadingPassengers, type: "error" });
      } finally {
        this.isLoadingPassengers = false;
      }
    },
    closeModal() {
      this.showPaymentModal = false;
      this.showPassengersModal = false;
      this.showPaymentConfirmation = false;
      this.paymentError = "";
      this.currentBookingTrip = null;
      this.transactionId = "";
      this.transactionDate = "";
      this.resetPaymentForm();
      this.passengers = [];
      this.errorLoadingPassengers = null;
    },
    showTripDetails(trip) {
      this.$router.push(`/trip/${trip.id}`);
    },
    goBack() {
      this.$router.go(-1);
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    resetFilters() {
      this.filters = { pets: false, luggage: false, childSeat: false, big_size_luggage: false };
      this.sortBy = "default";
    },
    handleImageError(event) {
      event.target.src = "/images/default-avatar.jpg";
    },
  },
};
</script>

<style scoped>
:root {
  --primary-color: #3498db;
  --secondary-color: #f5f7fa;
  --success-color: #2ecc71;
  --error-color: #e74c3c;
  --text-color: #2d3436;
  --border-color: #e0e0e0;
  --background-color: #ffffff;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

.search-results-container {
  font-family: 'Inter', sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
}

.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-color);
  text-align: center;
}

.search-params-container {
  background: var(--background-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}

.search-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  font-size: 16px;
  color: var(--text-color);
}

.search-params p {
  margin: 0;
  line-height: 1.6;
}

.sort-filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.sort-select {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-select label {
  font-size: 16px;
  color: var(--text-color);
}
.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.btn-confirm {
  padding: 14px 24px;
  background: #ffffff;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 20px;
  width: 100%;
}

.btn-confirm:hover {
  background: var(--primary-color);
  color: #ffffff;
  transform: translateY(-2px);
}

.receipt-summary p {
  margin: 12px 0;
  font-size: 16px;
  color: var(--text-color);
  line-height: 1.6;
}
.sort-select select {
  padding: 10px 36px 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  background: var(--background-color);
  transition: var(--transition);
}

.sort-select select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  outline: none;
}

.sort-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--text-color);
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: var(--primary-color);
  transition: var(--transition);
}

.filter-toggle:hover {
  background: var(--secondary-color);
  border-color: var(--primary-color);
}

.additional-filters {
  background: var(--background-color);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: var(--shadow);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  cursor: pointer;
}

.filter-option input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.trip-list {
  display: grid;
  gap: 24px;
}

.trip-item {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.trip-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.driver-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.driver-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.driver-name {
  font-weight: 600;
  font-size: 18px;
  color: var(--text-color);
}

.driver-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #636e72;
}

.star {
  color: #f1c40f;
}

.car-info {
  font-size: 16px;
  color: #636e72;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-details {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}


.detail-label {
  color: #636e72;
  min-width: 120px;
  font-weight: 500;
}

.detail-value {
  color: var(--text-color);
  text-align: right;
  flex-grow: 1;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.location-link {
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: var(--transition);
}

.location-link:hover {
  text-decoration: underline;
  color: #2980b9;
}

.route-arrow {
  color: #b2bec3;
}

.seats-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.seats-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.price-value {
  font-weight: 600;
  font-size: 20px;
  color: var(--success-color);
}

.price-per-person {
  font-size: 14px;
  color: #636e72;
}

.trip-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e8f4fd;
  color: #135c8d;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
}

.trip-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  text-align: center;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #b2bec3;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--background-color);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background: #e8f4fd;
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.012);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: fadeIn 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

#payment-modal-title,
#passengers-modal-title {
  color: var(--text-color);
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.location-info {
  color: #636e72;
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
}

.safety-notification {
  background: #fff8e6;
  border-left: 4px solid #ffb74d;
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 8px;
  display: flex;
  gap: 16px;
}

.safety-content h4 {
  color: #e65100;
  margin: 0 0 12px;
  font-size: 18px;
}

.safety-checklist li {
  color: #424242;
}

.payment-form {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 12px;
  margin-top: 24px;
}

.form-group label {
  color: #424242;
  font-weight: 600;
}

input {
  background: #ffffff !important;
  border: 1px solid #e0e0e0;
}

.passengers-list {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 0;
}

.passenger-item {
  background: #ffffff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.confirmation-screen {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid var(--border-color);
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: var(--success-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.confirmation-text {
  color: var(--text-color);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.receipt-summary {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin: 24px 0;
  text-align: left;
  border: 1px solid var(--border-color);
}

.receipt-summary p {
  margin: 8px 0;
  font-size: 16px;
  color: var(--text-color);
}

.btn-confirm {
  padding: 14px 24px;
  background: #ffffff;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 20px;
  width: 100%;
}

.btn-confirm:hover {
  background: var(--primary-color);
  color: #ffffff;
  transform: translateY(-2px);
}
.confirmation-text {
  color: var(--text-color);
  font-size: 20px;
  font-weight: 600;
}

.receipt-summary {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin: 24px 0;
}

.receipt-summary p {
  color: #424242;
  font-size: 16px;
}

.modal-close {
  background: #f5f5f5;
  color: #424242;
  font-weight: bold;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #e0e0e0;
  color: #212121;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #dfe6e9;
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
  transition: var(--transition);
}

.modal-close:hover {
  background: #b2bec3;
  color: #fff;
}

.safety-notification {
  background: #fff3cd;
  border-left: 4px solid #ffca28;
  padding: 20px;
  margin-bottom: 24px;
  border-radius: 8px;
  display: flex;
  gap: 16px;
}

.safety-icon {
  font-size: 28px;
  color: #e67e22;
}

.safety-content h4 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #d35400;
}

.safety-checklist {
  padding-left: 24px;
  margin: 12px 0;
}

.safety-checklist li {
  margin-bottom: 10px;
  font-size: 16px;
  position: relative;
  padding-left: 16px;
  color: var(--text-color);
}

.safety-checklist li::before {
  content: "•";
  color: #e67e22;
  position: absolute;
  left: 0;
}

.payment-form {
  margin-top: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half-width {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background: #f9f9f9;
  transition: var(--transition);
}

input:focus {
  border-color: var(--primary-color);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.input-error {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.error-text {
  color: var(--error-color);
  font-size: 14px;
  margin-top: 6px;
}

.btn-pay {
  width: 100%;
  padding: 14px;
  background: var(--success-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: var(--transition);
}

.btn-pay:hover {
  background: #27ae60;
  transform: translateY(-2px);
}

.btn-pay:disabled {
  background: #b2bec3;
  cursor: not-allowed;
  transform: none;
}

.spinner.small {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
}

.confirmation-screen {
  text-align: center;
  padding: 24px;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: var(--success-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.confirmation-text {
  color: var(--text-color);
  font-size: 18px;
  margin-bottom: 24px;
}

.receipt-summary {
  background: var(--secondary-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: left;
}

.receipt-summary p {
  margin: 8px 0;
  font-size: 16px;
  color: var(--text-color);
}

.btn-close {
  padding: 12px 24px;
  background: var(--secondary-color);
  color: var(--text-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-close:hover {
  background: #dfe6e9;
  transform: translateY(-2px);
}

.passengers-list {
  margin: 20px 0;
}

.passenger-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
}

.passenger-item:hover {
  background: var(--secondary-color);
  border-radius: 8px;
}

.passenger-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.passenger-name {
  font-weight: 600;
  font-size: 18px;
  color: var(--text-color);
}

.passenger-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #636e72;
}

.passenger-gender.male {
  background: #e3f2fd;
  color: #1565c0;
  padding: 4px 8px;
  border-radius: 6px;
}

.passenger-gender.female {
  background: #fce4ec;
  color: #ad1457;
  padding: 4px 8px;
  border-radius: 6px;
}

.passenger-rating {
  color: #f1c40f;
}

.passenger-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-color);
}

.passenger-comment {
  font-size: 14px;
  color: #636e72;
  font-style: italic;
  padding: 12px;
  background: var(--secondary-color);
  border-radius: 8px;
  margin-top: 8px;
}

.no-passengers {
  text-align: center;
  padding: 24px;
  color: #636e72;
  font-size: 16px;
}

.passengers-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  font-size: 16px;
  color: var(--text-color);
}

.loading-indicator {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #ffebee;
  color: var(--error-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-size: 16px;
}

.no-trips {
  text-align: center;
  padding: 40px;
  color: #636e72;
  font-size: 16px;
}

.back-button-container {
  margin-top: 24px;
  text-align: center;
}

.slide-fade-enter-active,
.slide-fade-exit-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-exit-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (max-width: 768px) {
  .search-results {
    padding: 20px 15px;
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
    gap: 6px;
  }
  .detail-value {
    text-align: left;
  }
  .seats-price-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .form-row {
    flex-direction: column;
    gap: 24px;
  }
  .half-width {
    width: 100%;
  }
  .modal-content {
    padding: 24px;
  }
}
</style>