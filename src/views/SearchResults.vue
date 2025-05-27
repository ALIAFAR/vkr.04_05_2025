
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
        <div class="modal-content">
          <button class="modal-close" @click="closeModal" aria-label="Закрыть">×</button>

          <template v-if="!showPaymentConfirmation && !showCodeInput">
            <h3>Оплата поездки</h3>

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

            <!-- Card Payment Form -->
            <div class="payment-form">
              <div class="form-group">
                <label for="card-number">Номер карты</label>
                <input
                  id="card-number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  v-model="paymentData.cardNumber"
                  maxlength="19"
                  @input="formatCardNumber"
                  :class="{ 'input-error': paymentData.cardError }"
                  @blur="validateCardNumber"
                  autocomplete="cc-number"
                />
                <p v-if="paymentData.cardError" class="error-text">{{ paymentData.cardError }}</p>
              </div>

              <div class="form-row">
                <div class="form-group half-width">
                  <label for="expiry-date">Срок действия</label>
                  <input
                    id="expiry-date"
                    type="text"
                    placeholder="ММ/ГГ"
                    v-model="paymentData.expiryDate"
                    maxlength="5"
                    @input="formatExpiryDate"
                    :class="{ 'input-error': paymentData.expiryError }"
                    @blur="validateExpiryDate"
                    autocomplete="cc-exp"
                  />
                  <p v-if="paymentData.expiryError" class="error-text">{{ paymentData.expiryError }}</p>
                </div>
                <div class="form-group half-width">
                  <label for="cvv">CVV/CVC</label>
                  <input
                    id="cvv"
                    type="password"
                    placeholder="•••"
                    v-model="paymentData.cvv"
                    maxlength="3"
                    :class="{ 'input-error': paymentData.cvvError }"
                    @blur="validateCvv"
                    autocomplete="cc-csc"
                  />
                  <p v-if="paymentData.cvvError" class="error-text">{{ paymentData.cvvError }}</p>
                </div>
              </div>

              <button
                class="btn-pay"
                @click="initiatePayment"
                :disabled="isPaymentLoading || !isPaymentValid"
              >
                {{ isPaymentLoading ? 'Обработка...' : 'Оплатить' }}
              </button>
              <p v-if="paymentData.paymentError" class="error-text">{{ paymentData.paymentError }}</p>
            </div>
          </template>

          <!-- Code Verification -->
          <div v-if="showCodeInput" class="code-confirmation">
            <h3>Подтверждение оплаты</h3>
            <p>Код подтверждения отправлен на ваш номер или email.</p>
            <div class="form-group">
              <label for="confirmation-code">Код подтверждения</label>
              <input
                id="confirmation-code"
                type="text"
                v-model="paymentData.confirmationCode"
                maxlength="6"
                placeholder="123456"
                :class="{ 'input-error': paymentData.codeError }"
                :disabled="isPaymentLoading"
              />
              <p v-if="paymentData.codeError" class="error-text">{{ paymentData.codeError }}</p>
            </div>
            <button
              class="btn-confirm"
              @click="confirmPayment"
              :disabled="isPaymentLoading || !paymentData.confirmationCode"
            >
              {{ isPaymentLoading ? 'Подтверждение...' : 'Подтвердить' }}
            </button>
          </div>

          <!-- Payment Confirmation -->
          <div v-if="showPaymentConfirmation" class="confirmation-screen">
            <div class="confirmation-icon">✓</div>
            <p class="confirmation-text">Оплата успешно завершена!</p>
            <div class="receipt-summary">
              <p><strong>Сумма:</strong> {{ currentBookingTrip.cost }} ₽</p>
              <p><strong>Номер транзакции:</strong> {{ transactionId }}</p>
              <p><strong>Дата:</strong> {{ transactionDate }}</p>
              <p><strong>Способ оплаты:</strong> Карта **** {{ paymentData.cardNumber.slice(-4) }}</p>
            </div>
            <button class="btn-close" @click="closeModal">Закрыть</button>
          </div>
        </div>
      </div>

      <!-- Sort and Filters -->
      <div class="sort-filter-container">
        <div class="sort-controls">
          <div class="sort-select">
            <label>Сортировать по:</label>
            <select v-model="sortBy" @change="sortTrips">
              <option value="default">По умолчанию</option>
              <option value="experience">Стаж вождения</option>
              <option value="rating">Рейтинг</option>
              <option value="price-asc">Цена (по возрастанию)</option>
              <option value="price-desc">Цена (по убыванию)</option>
            </select>
            <span class="sort-icon">▼</span>
          </div>
        </div>
        <div class="filter-toggle" @click="toggleFilters">
          <span>Фильтры</span>
          <span class="filter-icon">⚙️</span>
        </div>
      </div>

      <!-- Additional Filters -->
      <transition name="slide-fade">
        <div v-if="showFilters" class="additional-filters">
          <div class="filter-options">
            <label class="filter-option">
              <input type="checkbox" v-model="filters.pets" />
              <span class="filter-icon">🐾</span>
              <span>Разрешены животные</span>
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="filters.luggage" />
              <span class="filter-icon">🧳</span>
              <span>Багаж</span>
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="filters.big_size_luggage" />
              <span class="filter-icon">🧳</span>
              <span>Крупногабаритный багаж</span>
            </label>
            <label class="filter-option">
              <input type="checkbox" v-model="filters.childSeat" />
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
        <button @click="fetchTrips" class="btn-primary">Повторить</button>
      </div>

      <!-- Trip List -->
      <div class="trip-list">
        <div v-if="!loading && filteredTrips.length === 0" class="no-trips">
          <p>Поездки не найдены.</p>
          <button @click="resetFilters" class="btn-primary">Сбросить фильтры</button>
        </div>

        <div v-else v-for="(trip, index) in filteredTrips" :key="index" class="trip-item">
          <div class="trip-header">
            <div class="driver-info">
              <router-link :to="`/driver/${trip.driver_id}`">
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
                <span class="location-link" @click="showPassengers(trip, 'departure')">{{ trip.departure_location }}</span>
                <span class="route-arrow">→</span>
                <span class="location-link" @click="showPassengers(trip, 'arrival')">{{ trip.arrival_location }}</span>
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
              @click="bookTrip(trip)"
              :disabled="trip.available_seats < searchParams.passengers"
            >
              {{ trip.available_seats >= searchParams.passengers ? 'Забронировать' : 'Недостаточно мест' }}
            </button>
            <button class="btn-secondary" @click="showTripDetails(trip)">Подробности</button>
          </div>
        </div>
      </div>

      <!-- Passengers Modal -->
      <div v-if="showPassengersModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal" aria-label="Закрыть">×</button>
          <h3>Пассажиры ({{ modalLocationType === 'departure' ? 'Отправление' : 'Прибытие' }})</h3>
          <p class="location-info">{{ currentLocation }}</p>

          <div class="passengers-filter">
            <label>
              <input type="checkbox" v-model="showOnlyMyBookings" /> Показать только мои бронирования
            </label>
          </div>

          <div class="passengers-list">
            <div v-if="filteredPassengers.length === 0" class="no-passengers">
              <p>Пассажиры не забронированы.</p>
            </div>
            <div v-else v-for="(passenger, index) in filteredPassengers" :key="index" class="passenger-item">
              <router-link :to="`/profile/${passenger.user_id}`">
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
                    {{ passenger.gender === 'male' ? 'Мужчина' : 'Женщина' }}
                  </span>
                  <span class="passenger-age">{{ calculateAge(passenger.birthday) }} лет</span>
                  <span v-if="passenger.passenger_rating" class="passenger-rating">
                    ★ {{ passenger.passenger_rating.toFixed(1) }}
                  </span>
                </div>
                <div class="passenger-details">
                  <span class="passenger-seats">Места: {{ passenger.department }}</span>
                  <span class="passenger-price">{{ passenger.position }} ₽</span>
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
        <button class="btn-secondary" @click="goBack">← Назад</button>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/config/api";

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
      showCodeInput: false,
      showPaymentConfirmation: false,
      currentBookingTrip: null,
      passengers: [],
      currentLocation: "",
      modalLocationType: "departure",
      isPaymentLoading: false,
      paymentData: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        confirmationCode: "",
        cardError: "",
        expiryError: "",
        cvvError: "",
        codeError: "",
        paymentError: "",
      },
      transactionId: "",
      transactionDate: "",
      locale: "ru-RU",
    };
  },
  computed: {
    filteredPassengers() {
      return this.showOnlyMyBookings
        ? this.passengers.filter((p) => p.user_id === Cookies.get("user_id"))
        : this.passengers;
    },
    totalBookedSeats() {
      return this.filteredPassengers.reduce((sum, p) => sum + p.seats_booked, 0);
    },
    isPaymentValid() {
      return (
        !this.paymentData.cardError &&
        !this.paymentData.expiryError &&
        !this.paymentData.cvvError &&
        this.paymentData.cardNumber &&
        this.paymentData.expiryDate &&
        this.paymentData.cvv
      );
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
          this.error = "Неверный ответ сервера";
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
      if (!dateString) return "";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(this.locale, options);
    },
    formatDateTime(datetimeString) {
      if (!datetimeString) return "";
      const date = new Date(datetimeString);
      const options = { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return date.toLocaleString(this.locale, options);
    },
    calculateAge(birthDate) {
      if (!birthDate) return "Не указан";
      return new Date().getFullYear() - new Date(birthDate).getFullYear();
    },
    calculateDrivingExperience(licenseDate) {
      if (!licenseDate) return "Не указан";
      const experience = new Date().getFullYear() - new Date(licenseDate).getFullYear();
      return experience === 0 ? "Менее года" : `${experience} ${this.declension(experience, ["год", "года", "лет"])}`;
    },
    calculateTravelTime(departure, arrival) {
      if (!departure || !arrival) return "";
      const diff = new Date(arrival) - new Date(departure);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return hours ? `${hours}ч ${minutes}м` : `${minutes}м`;
    },
    declension(number, titles) {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)]];
    },
    async bookTrip(trip) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      this.currentBookingTrip = trip;
      this.showPaymentModal = true;
    },
    validateCardNumber() {
      const cleaned = this.paymentData.cardNumber.replace(/\s/g, "");
      if (!cleaned) {
        this.paymentData.cardError = "Введите номер карты";
        return;
      }
      if (!/^\d{16}$/.test(cleaned)) {
        this.paymentData.cardError = "Введите 16 цифр";
        return;
      }
      let sum = 0;
      let isEven = false;
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      this.paymentData.cardError = sum % 10 === 0 ? "" : "Неверный номер карты";
    },
    validateExpiryDate() {
      const match = this.paymentData.expiryDate.match(/^(\d{2})\/(\d{2})$/);
      if (!match) {
        this.paymentData.expiryError = "Формат: ММ/ГГ";
        return;
      }
      const month = parseInt(match[1], 10);
      const year = parseInt(match[2], 10) + 2000;
      const now = new Date();
      const expiry = new Date(year, month - 1);
      this.paymentData.expiryError = month >= 1 && month <= 12 && expiry >= now ? "" : "Неверная дата";
    },
    validateCvv() {
      this.paymentData.cvvError = /^\d{3}$/.test(this.paymentData.cvv) ? "" : "Введите 3 цифры";
    },
    formatCardNumber() {
      this.paymentData.cardNumber = this.paymentData.cardNumber
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    },
    formatExpiryDate() {
      this.paymentData.expiryDate = this.paymentData.expiryDate
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .substring(0, 5);
    },
    async initiatePayment() {
      if (!this.isPaymentValid) {
        this.$notify({ title: "Ошибка", text: "Проверьте данные карты", type: "error" });
        return;
      }

      this.isPaymentLoading = true;
      try {
        const token = Cookies.get("token");
        const userResponse = await axios.get(API_CONFIG.BASE_URL + "/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data.user;

        // Step 1: Initiate payment with Tinkoff
        const paymentResponse = await axios.post(
          API_CONFIG.BASE_URL + "/payment/initiate",
          {
            amount: this.currentBookingTrip.cost * 100, // Tinkoff expects amount in kopecks
            currency: "RUB",
            orderId: `ORDER-${Date.now()}`,
            customerEmail: user.email,
            customerPhone: user.phone,
            cardNumber: this.paymentData.cardNumber.replace(/\s/g, ""),
            expiryDate: this.paymentData.expiryDate,
            cvv: this.paymentData.cvv,
            description: `Payment for trip ${this.currentBookingTrip.id}`,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (paymentResponse.data.success && paymentResponse.data.requiresConfirmation) {
          // Step 2: Send SMS with verification code
          await axios.post(
            API_CONFIG.BASE_URL + "/sms/send",
            {
              phone: user.phone,
              message: `Ваш код подтверждения оплаты: ${paymentResponse.data.verificationCode}`,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          this.transactionId = paymentResponse.data.paymentId;
          this.showCodeInput = true;
        } else if (paymentResponse.data.success) {
          // Payment succeeded without confirmation (unlikely for real scenarios)
          this.transactionId = paymentResponse.data.paymentId;
          this.transactionDate = new Date().toLocaleString(this.locale);
          await this.createBookingAndChat();
          this.showPaymentConfirmation = true;
        } else {
          throw new Error(paymentResponse.data.message || "Ошибка инициации платежа");
        }
      } catch (error) {
        this.paymentData.paymentError = error.message || "Ошибка оплаты";
        this.$notify({ title: "Ошибка", text: this.paymentData.paymentError, type: "error" });
      } finally {
        this.isPaymentLoading = false;
      }
    },
    async confirmPayment() {
      if (!/^\d{6}$/.test(this.paymentData.confirmationCode)) {
        this.paymentData.codeError = "Введите 6-значный код";
        return;
      }

      this.isPaymentLoading = true;
      try {
        const token = Cookies.get("token");
        const confirmResponse = await axios.post(
          API_CONFIG.BASE_URL + "/payment/confirm",
          {
            paymentId: this.transactionId,
            confirmationCode: this.paymentData.confirmationCode,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (confirmResponse.data.success) {
          this.transactionDate = new Date().toLocaleString(this.locale);
          await this.createBookingAndChat();
          this.showCodeInput = false;
          this.showPaymentConfirmation = true;
        } else {
          throw new Error(confirmResponse.data.message || "Неверный код подтверждения");
        }
      } catch (error) {
        this.paymentData.codeError = error.message || "Ошибка подтверждения";
        this.$notify({ title: "Ошибка", text: this.paymentData.codeError, type: "error" });
      } finally {
        this.isPaymentLoading = false;
      }
    },
    async createBookingAndChat() {
      const token = Cookies.get("token");
      const trip = this.currentBookingTrip;

      // Create chat
      const chatResponse = await axios.post(
        API_CONFIG.BASE_URL + "/chat/create",
        { trip_id: trip.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const chatId = chatResponse.data.chatId;

      // Create booking
      const bookingResponse = await axios.post(
        API_CONFIG.BASE_URL + "/booking/create",
        {
          trip_id: trip.id,
          chat_id: chatId,
          seats_booked: this.searchParams.passengers,
          transaction_id: this.transactionId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTrip = bookingResponse.data.trip;
      const index = this.trips.findIndex((t) => t.id === updatedTrip.id);
      if (index !== -1) {
        this.trips.splice(index, 1, updatedTrip);
        this.sortTrips();
      }

      this.$notify({
        title: "Успех!",
        text: `Забронировано ${this.searchParams.passengers} мест`,
        type: "success",
      });

      // Redirect to chat
      this.$router.push(`/chat/${trip.driver_id}`);
    },
    async showPassengers(trip, locationType) {
      this.modalLocationType = locationType;
      this.currentLocation = locationType === "departure" ? trip.departure_location : trip.arrival_location;
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
          seats_booked: p.seats_booked,
          department: p.department,
          birthday: p.birthday,
          position: p.position || "?",
        }));
        this.showPassengersModal = true;
      } catch (error) {
        this.$notify({ title: "Ошибка", text: "Не удалось загрузить пассажиров", type: "error" });
      }
    },
    closeModal() {
      this.showPaymentModal = false;
      this.showPassengersModal = false;
      this.showCodeInput = false;
      this.showPaymentConfirmation = false;
      this.paymentData = {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        confirmationCode: "",
        cardError: "",
        expiryError: "",
        cvvError: "",
        codeError: "",
        paymentError: "",
      };
      this.currentBookingTrip = null;
      this.transactionId = "";
      this.transactionDate = "";
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
  --secondary-color: #ecf0f1;
  --success-color: #2ecc71;
  --error-color: #e74c3c;
  --text-color: #333;
  --border-color: #ddd;
  --background-color: #fff;
}

.search-results-container {
  font-family: 'Lora', sans-serif;
}

.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: var(--text-color);
}

.search-params-container {
  background: var(--secondary-color);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.search-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  font-size: 14px;
}

.sort-filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.sort-select {
  position: relative;
}

.sort-select select {
  padding: 8px 30px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
}

.sort-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--secondary-color);
  border-radius: 4px;
  cursor: pointer;
}

.filter-toggle:hover {
  background: #e0e0e0;
}

.additional-filters {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
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
}

.trip-list {
  display: grid;
  gap: 20px;
}

.trip-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.trip-item:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

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

.car-info {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
}

.trip-details {
  display: grid;
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
  color: var(--text-color);
  text-align: right;
  flex-grow: 1;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-end;
}

.location-link {
  color: var(--primary-color);
  cursor: pointer;
}

.location-link:hover {
  text-decoration: underline;
}

.route-arrow {
  color: #999;
}

.seats-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.seats-info {
  display: flex;
  align-items: center;
  gap: 5px;
}

.price-value {
  font-weight: bold;
  font-size: 18px;
  color: var(--success-color);
}

.price-per-person {
  font-size: 12px;
  color: #888;
}

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
  background: #e8f4fd;
  color: #135c8d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.trip-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
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
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-secondary:hover {
  background: #f5f9fd;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--background-color);
  border-radius: 8px;
  padding: 25px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #777;
}

.modal-close:hover {
  color: var(--text-color);
}

.safety-notification {
  background: #fff8e1;
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
  margin: 0 0 10px;
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

.payment-form {
  margin-top: 20px;
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
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
}

input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.input-error {
  border-color: var(--error-color);
}

.error-text {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 5px;
}

.btn-pay {
  width: 100%;
  padding: 14px;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-pay:hover {
  background-color: #27ae60;
}

.btn-pay:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.code-confirmation {
  text-align: center;
  padding: 20px;
}

.code-confirmation input {
  width: 150px;
  margin: 10px auto;
  text-align: center;
}

.btn-confirm {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-confirm:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.confirmation-screen {
  text-align: center;
  padding: 20px;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: var(--success-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.confirmation-text {
  color: #666;
  margin-bottom: 25px;
}

.receipt-summary {
  background: var(--secondary-color);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: left;
}

.receipt-summary p {
  margin: 6px 0;
  font-size: 14px;
}

.btn-close {
  padding: 10px 20px;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

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

.passenger-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.passenger-name {
  font-weight: bold;
}

.passenger-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #666;
}

.passenger-gender.male {
  background: #e3f2fd;
  color: #1565c0;
  padding: 2px 6px;
  border-radius: 4px;
}

.passenger-gender.female {
  background: #fce4ec;
  color: #ad1457;
  padding: 2px 6px;
  border-radius: 4px;
}

.passenger-rating {
  color: #ff9800;
}

.passenger-details {
  display: flex;
  gap: 15px;
  font-size: 13px;
}

.passenger-comment {
  font-size: 14px;
  color: #666;
  font-style: italic;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 5px;
  margin-top: 5px;
}

.no-passengers {
  text-align: center;
  padding: 20px;
  color: #777;
}

.passengers-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
}

.loading-indicator {
  text-align: center;
  padding: 30px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #ffebee;
  color: var(--error-color);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.no-trips {
  text-align: center;
  padding: 30px;
  color: #777;
}

.back-button-container {
  margin-top: 20px;
  text-align: center;
}

.slide-fade-enter-active,
.slide-fade-exit-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-exit-to {
  opacity: 0;
  transform: translateY(-10px);
}

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
  .detail-value {
    text-align: left;
  }
  .seats-price-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  .half-width {
    width: 100%;
  }
}
</style>
