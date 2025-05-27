<template>
  <div class="search-results-container">
    <AppNavbar />

    <div class="search-results">
      <h1>Результаты поиска</h1>

      <!-- Search Parameters -->
      <div class="search-params-container">
        <div class="search-params">
          <p><strong>Откуда:</strong> {{ searchParams.from }}</p>
          <p><strong>Куда:</strong> {{ destination }}</p>
          <p><strong>Дата:</strong> {{ formatDate(searchParams.date) }}</p>
          <p><strong>Места:</strong> {{ searchParams.passengers }}</p>
        </div>
      </div>

      <!-- Payment Modal -->
      <div v-if="showPaymentModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal" aria-label="Закрыть">×</button>

          <template v-if="!showPaymentConfirmation && !show3DSModal">
            <h3>Оплата</h3>

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

            <!-- Payment Method Selector -->
            <div class="payment-methods">
              <button
                class="payment-method"
                :class="{ active: paymentData.method === 'card' }"
                @click="selectPaymentMethod('card')"
              >
                <i class="fas fa-credit-card"></i> Карта
              </button>
              <button
                class="payment-method"
                :class="{ active: paymentData.method === 'applepay' }"
                @click="selectPaymentMethod('applepay')"
                :disabled="!isApplePayAvailable"
                :title="isApplePayAvailable ? '' : 'Apple Pay недоступен на этом устройстве'"
              >
                <i class="fab fa-apple-pay"></i> Apple Pay
              </button>
              <button
                class="payment-method"
                :class="{ active: paymentData.method === 'sberpay' }"
                @click="selectPaymentMethod('sberpay')"
              >
                <i class="fas fa-ruble-sign"></i> SberPay
              </button>
            </div>

            <!-- Card Payment Form -->
            <transition name="fade">
              <div v-if="paymentData.method === 'card'" class="payment-form">
                <div class="form-group">
                  <label for="card-number">Номер карты</label>
                  <div class="card-input-wrapper">
                    <span class="card-type-icon">
                      <i :class="cardTypeIcon"></i>
                    </span>
                    <input
                      id="card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      v-model="paymentData.cardNumber"
                      maxlength="19"
                      @input="debouncedValidateCardNumber"
                      :class="{ 'input-error': paymentData.cardError }"
                      aria-describedby="card-error"
                      autocomplete="cc-number"
                    />
                  </div>
                  <p v-if="paymentData.cardError" id="card-error" class="error-text">{{ paymentData.cardError }}</p>
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
                      @input="debouncedValidateExpiryDate"
                      :class="{ 'input-error': paymentData.expiryError }"
                      aria-describedby="expiry-error"
                      autocomplete="cc-exp"
                    />
                    <p v-if="paymentData.expiryError" id="expiry-error" class="error-text">{{ paymentData.expiryError }}</p>
                  </div>
                  <div class="form-group half-width">
                    <label for="cvv">CVV/CVC</label>
                    <input
                      id="cvv"
                      type="password"
                      placeholder="•••"
                      v-model="paymentData.cvv"
                      maxlength="3"
                      @input="debouncedValidateCvv"
                      :class="{ 'input-error': paymentData.cvvError }"
                      aria-describedby="cvv-error"
                      autocomplete="cc-csc"
                    />
                    <p v-if="paymentData.cvvError" id="cvv-error" class="error-text">{{ paymentData.cvvError }}</p>
                  </div>
                </div>

                <div class="payment-actions">
                  <button
                    class="btn-primary"
                    @click="validatePayment"
                    :disabled="isPaymentLoading || !isPaymentValid || paymentData.retryCount >= 3"
                  >
                    {{ isPaymentLoading ? 'Обработка...' : 'Оплатить' }}
                  </button>
                  <button
                    v-if="paymentData.paymentError && paymentData.retryCount < 3"
                    class="btn-secondary"
                    @click="retryPayment"
                  >
                    Повторить оплату
                  </button>
                </div>
                <p v-if="paymentData.paymentError" class="error-text" aria-live="polite">
                  {{ paymentData.paymentError }} (Попытка {{ paymentData.retryCount }}/3)
                </p>
              </div>
            </transition>

            <!-- Apple Pay / SberPay Placeholder -->
            <transition name="fade">
              <div v-if="paymentData.method !== 'card'" class="alternative-payment">
                <p>Нажмите кнопку ниже для оплаты через {{ paymentData.method === 'applepay' ? 'Apple Pay' : 'SberPay' }}.</p>
                <button
                  class="btn-primary"
                  @click="validatePayment"
                  :disabled="isPaymentLoading"
                >
                  {{ isPaymentLoading ? 'Обработка...' : `Оплатить через ${paymentData.method === 'applepay' ? 'Apple Pay' : 'SberPay'}` }}
                </button>
              </div>
            </transition>
          </template>

          <!-- 3D Secure Modal -->
          <div v-if="show3DSModal" class="confirmation-screen">
            <h3>Подтверждение 3D Secure</h3>
            <p>Введите код подтверждения, отправленный на ваш телефон или email.</p>
            <div v-if="isPaymentLoading" class="loading-spinner"></div>
            <div class="form-group">
              <label for="3ds-code">Код подтверждения</label>
              <input
                id="3ds-code"
                type="text"
                v-model="paymentData.threeDSCode"
                maxlength="6"
                :class="{ 'input-error': paymentData.threeDSError }"
                :disabled="isPaymentLoading"
              />
              <p v-if="paymentData.threeDSError" class="error-text">{{ paymentData.threeDSError }}</p>
            </div>
            <button
              class="btn-primary"
              @click="confirm3DS"
              :disabled="isPaymentLoading || !paymentData.threeDSCode"
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
              <p><strong>Способ оплаты:</strong> {{ paymentMethodDisplay }} **** {{ paymentData.method === 'card' ? paymentData.cardNumber.slice(-4) : 'XXXX' }}</p>
            </div>
            <button class="btn-primary" @click="proceedToBooking">Продолжить</button>
          </div>
        </div>
      </div>

      <!-- Booking Confirmation Modal -->
      <div v-if="showBookingModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal" aria-label="Закрыть">×</button>
          <h3>Подтверждение бронирования</h3>

          <div class="booking-details">
            <h4>Детали поездки:</h4>
            <p><strong>Маршрут:</strong> {{ currentBookingTrip.departure_location }} → {{ currentBookingTrip.arrival_location }}</p>
            <p><strong>Дата:</strong> {{ formatDateTime(currentBookingTrip.departure_time) }}</p>
            <p><strong>Места:</strong> {{ searchParams.passengers }}</p>
            <p><strong>Стоимость:</strong> {{ currentBookingTrip.cost }} ₽</p>
            <p><strong>Водитель:</strong> {{ currentBookingTrip.name }} {{ currentBookingTrip.surname }}</p>
            <p><strong>Автомобиль:</strong> {{ currentBookingTrip.brand }} {{ currentBookingTrip.mark }} ({{ currentBookingTrip.car_year }})</p>
          </div>

          <div class="booking-actions">
            <button class="btn-secondary" @click="closeModal">Отмена</button>
            <button
              class="btn-primary"
              @click="confirmBooking"
              :disabled="isBookingLoading"
            >
              {{ isBookingLoading ? 'Бронирование...' : 'Подтвердить' }}
            </button>
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
                    {{ passenger.gender === 'male' ? 'Мужчина' : passenger.gender === 'female' ? 'Женщина' : 'Не указан' }}
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
import debounce from "lodash.debounce";

const paymentMixin = {
  data() {
    return {
      paymentData: {
        method: "card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardError: "",
        expiryError: "",
        cvvError: "",
        threeDSCode: "",
        threeDSError: "",
        paymentError: "",
        retryCount: 0,
      },
      cardType: "",
      cardTypeIcon: "",
      transactionId: "",
      transactionDate: "",
      isPaymentLoading: false,
    };
  },
  computed: {
    isPaymentValid() {
      if (this.paymentData.method !== "card") return true;
      return (
        !this.paymentData.cardError &&
        !this.paymentData.expiryError &&
        !this.paymentData.cvvError &&
        this.paymentData.cardNumber &&
        this.paymentData.expiryDate &&
        this.paymentData.cvv
      );
    },
    paymentMethodDisplay() {
      switch (this.paymentData.method) {
        case "applepay":
          return "Apple Pay";
        case "sberpay":
          return "SberPay";
        default:
          return this.cardType || "Карта";
      }
    },
    isApplePayAvailable() {
      return typeof window.ApplePaySession !== "undefined";
    },
  },
  methods: {
    selectPaymentMethod(method) {
      this.paymentData.method = method;
      this.resetPaymentErrors();
    },
    resetPaymentErrors() {
      this.paymentData.cardError = "";
      this.paymentData.expiryError = "";
      this.paymentData.cvvError = "";
      this.paymentData.threeDSError = "";
      this.paymentData.paymentError = "";
    },
    retryPayment() {
      this.resetPaymentErrors();
      this.paymentData.cardNumber = "";
      this.paymentData.expiryDate = "";
      this.paymentData.cvv = "";
    },
    detectCardType() {
      const cleaned = this.paymentData.cardNumber.replace(/\s/g, "");
      if (/^4/.test(cleaned)) {
        this.cardType = "Visa";
        this.cardTypeIcon = "fas fa-cc-visa";
      } else if (/^5[1-5]/.test(cleaned)) {
        this.cardType = "MasterCard";
        this.cardTypeIcon = "fas fa-cc-mastercard";
      } else {
        this.cardType = "";
        this.cardTypeIcon = "";
      }
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
    async validatePayment() {
      if (this.paymentData.method === "card" && !this.isPaymentValid) {
        this.$notify({ title: "Ошибка", text: "Проверьте данные карты", type: "error" });
        return;
      }
      this.isPaymentLoading = true;
      this.paymentData.retryCount++;
      try {
        let response;
        if (this.paymentData.method === "card") {
          response = await axios.post(
            API_CONFIG.BASE_URL + "/payment/process",
            {
              cardNumber: this.paymentData.cardNumber.replace(/\s/g, ""),
              expiryDate: this.paymentData.expiryDate,
              cvv: this.paymentData.cvv,
              amount: this.currentBookingTrip.cost,
              currency: "RUB",
              tripId: this.currentBookingTrip.id,
            },
            { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
          );
        } else if (this.paymentData.method === "applepay") {
          if (!this.isApplePayAvailable) throw new Error("Apple Pay недоступен");
          response = await axios.post(
            API_CONFIG.BASE_URL + "/payment/applepay",
            {
              amount: this.currentBookingTrip.cost,
              currency: "RUB",
              tripId: this.currentBookingTrip.id,
            },
            { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
          );
        } else if (this.paymentData.method === "sberpay") {
          response = await axios.post(
            API_CONFIG.BASE_URL + "/payment/sberpay",
            {
              amount: this.currentBookingTrip.cost,
              currency: "RUB",
              tripId: this.currentBookingTrip.id,
            },
            { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
          );
        }

        if (response.data.requires3DS && this.paymentData.method === "card") {
          this.show3DSModal = true;
        } else if (response.data.success) {
          this.transactionId = response.data.transactionId || `TXN-${Date.now()}`;
          this.transactionDate = new Date().toLocaleString(this.locale);
          this.showPaymentConfirmation = true;
        } else {
          throw new Error(response.data.message || "Ошибка обработки оплаты");
        }
      } catch (error) {
        let errorMessage = "Оплата не удалась";
        if (error.response?.data?.code) {
          switch (error.response.data.code) {
            case "INSUFFICIENT_FUNDS":
              errorMessage = "Недостаточно средств";
              break;
            case "INVALID_CARD":
              errorMessage = "Неверные данные карты";
              break;
            case "DECLINED":
              errorMessage = "Оплата отклонена";
              break;
          }
        } else if (error.message === "Apple Pay недоступен") {
          errorMessage = "Apple Pay недоступен";
        } else {
          errorMessage = error.message || "Ошибка сервера";
        }
        this.paymentData.paymentError = errorMessage;
        this.$notify({ title: "Ошибка", text: errorMessage, type: "error" });
      } finally {
        this.isPaymentLoading = false;
      }
    },
    async confirm3DS() {
      if (!/^\d{6}$/.test(this.paymentData.threeDSCode)) {
        this.paymentData.threeDSError = "Введите 6-значный код";
        return;
      }
      this.isPaymentLoading = true;
      try {
        const response = await axios.post(
          API_CONFIG.BASE_URL + "/payment/confirm-3ds",
          {
            transactionId: this.transactionId,
            threeDSCode: this.paymentData.threeDSCode,
          },
          { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
        );
        if (response.data.success) {
          this.transactionId = response.data.transactionId || this.transactionId;
          this.transactionDate = new Date().toLocaleString(this.locale);
          this.show3DSModal = false;
          this.showPaymentConfirmation = true;
        } else {
          throw new Error(response.data.message || "Ошибка подтверждения 3D Secure");
        }
      } catch (error) {
        this.paymentData.threeDSError = error.message || "Ошибка подтверждения 3D Secure";
        this.$notify({ title: "Ошибка", text: this.paymentData.threeDSError, type: "error" });
      } finally {
        this.isPaymentLoading = false;
      }
    },
  },
};

export default {
  components: { AppNavbar },
  mixins: [paymentMixin],
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
      showBookingModal: false,
      showPaymentConfirmation: false,
      show3DSModal: false,
      currentBookingTrip: null,
      passengers: [],
      currentLocation: "",
      modalLocationType: "departure",
      isBookingLoading: false,
      destination: "",
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
    this.debouncedValidateCardNumber = debounce(this.validateCardNumber, 300);
    this.debouncedValidateExpiryDate = debounce(this.validateExpiryDate, 300);
    this.debouncedValidateCvv = debounce(this.validateCvv, 300);
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
          this.destination = this.searchParams.to;
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
      const options = this.locale === "en-US"
        ? { year: "numeric", month: "short", day: "numeric" }
        : { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(this.locale, options);
    },
    formatDateTime(datetimeString) {
      if (!datetimeString) return "";
      const date = new Date(datetimeString);
      const options = this.locale === "en-US"
        ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true }
        : { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
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
    proceedToBooking() {
      this.showPaymentModal = false;
      this.showPaymentConfirmation = false;
      this.showBookingModal = true;
    },
    async confirmBooking() {
      this.isBookingLoading = true;
      try {
        const token = Cookies.get("token");
        const trip = this.currentBookingTrip;

        const chatResponse = await axios.post(
          API_CONFIG.BASE_URL + "/chat/create",
          { trip_id: trip.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chat_id = chatResponse.data.chatId;

        const bookingResponse = await axios.post(
          API_CONFIG.BASE_URL + "/booking/create",
          {
            trip_id: trip.id,
            chat_id,
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

        this.closeModal();
        this.$router.push(`/chat/${trip.driver_id}`);
      } catch (error) {
        this.$notify({
          title: "Ошибка",
          text: this.getErrorMessage(error),
          type: "error",
        });
      } finally {
        this.isBookingLoading = false;
      }
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
      this.showBookingModal = false;
      this.showPassengersModal = false;
      this.showPaymentConfirmation = false;
      this.show3DSModal = false;
      this.paymentData = {
        method: "card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardError: "",
        expiryError: "",
        cvvError: "",
        threeDSCode: "",
        threeDSError: "",
        paymentError: "",
        retryCount: 0,
      };
      this.currentBookingTrip = null;
      this.transactionId = "";
      this.transactionDate = "";
      this.cardType = "";
      this.cardTypeIcon = "";
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

.payment-methods {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.payment-method {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: #fff;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-method.active {
  border-color: var(--primary-color);
  background: #e6f3ff;
}

.payment-method:hover:not(:disabled) {
  background: #f5f9fd;
}

.payment-method:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-method i {
  margin-right: 8px;
  font-size: 16px;
}

.payment-actions {
  display: flex;
  gap: 10px;
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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

.card-input-wrapper {
  position: relative;
}

.card-type-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #666;
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

#card-number {
  padding-left: 40px;
}

.input-error {
  border-color: var(--error-color);
}

.error-text {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 5px;
}

.alternative-payment {
  text-align: center;
  padding: 20px;
}

.confirmation-screen {
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 15px auto;
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

.booking-details {
  background: var(--secondary-color);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.booking-details p {
  margin: 6px 0;
  font-size: 14px;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.fade-enter-active,
.fade-exit-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-exit-to {
  opacity: 0;
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
  .booking-actions {
    flex-direction: column;
  }
  .booking-actions button {
    width: 100%;
  }
  .payment-methods {
    flex-direction: column;
  }
  .payment-method {
    width: 100%;
  }
}
</style>
