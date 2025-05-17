<template>
    <div class="payment-page">
      <AppNavbar />
      
      <div class="payment-container">
        <div class="payment-header">
          <h1>Оплата поездки</h1>
          <div class="trip-summary">
            <p><strong>Маршрут:</strong> {{ trip.departure_location }} → {{ trip.arrival_location }}</p>
            <p><strong>Дата:</strong> {{ formatDateTime(trip.departure_time) }}</p>
            <p><strong>Мест:</strong> {{ passengers }}</p>
            <p><strong>Цена:</strong> {{ totalPrice }} ₽</p>
          </div>
        </div>
  
        <div class="payment-methods">
          <h2>Выберите способ оплаты</h2>
          
          <div class="methods-list">
            <div 
              class="method-card"
              :class="{ 'active': selectedMethod === 'card' }"
              @click="selectMethod('card')"
            >
              <div class="method-icon">💳</div>
              <div class="method-info">
                <h3>Банковская карта</h3>
                <p>Оплата картой Visa, Mastercard или МИР</p>
              </div>
            </div>
            
            <div 
              class="method-card"
              :class="{ 'active': selectedMethod === 'sbp' }"
              @click="selectMethod('sbp')"
            >
              <div class="method-icon">📱</div>
              <div class="method-info">
                <h3>СБП (Система быстрых платежей)</h3>
                <p>Оплата через мобильное приложение банка</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Форма оплаты картой -->
        <div v-if="selectedMethod === 'card'" class="card-payment-form">
          <div class="form-group">
            <label>Номер карты</label>
            <input 
              type="text" 
              v-model="card.number" 
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              @input="formatCardNumber"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Срок действия</label>
              <input 
                type="text" 
                v-model="card.expiry" 
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiry"
              >
            </div>
            
            <div class="form-group">
              <label>CVV/CVC</label>
              <input 
                type="password" 
                v-model="card.cvv" 
                placeholder="123"
                maxlength="3"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label>Имя владельца карты</label>
            <input 
              type="text" 
              v-model="card.name" 
              placeholder="IVAN IVANOV"
            >
          </div>
        </div>
  
        <!-- SBP оплата -->
        <div v-if="selectedMethod === 'sbp'" class="sbp-payment">
          <div class="sbp-qr-container">
            <div class="qr-code-placeholder" v-if="!paymentData.qrCode">
              <div class="qr-loading">
                <div class="loader"></div>
                <p>Генерация QR-кода...</p>
              </div>
            </div>
            <div class="qr-code" v-else>
              <img :src="paymentData.qrCode" alt="QR-код для оплаты">
              <p class="qr-amount">{{ totalPrice }} ₽</p>
            </div>
            
            <div class="sbp-instructions">
              <h3>Как оплатить через СБП:</h3>
              <ol>
                <li>Откройте приложение вашего банка</li>
                <li>Выберите раздел "Оплата по QR"</li>
                <li>Наведите камеру на код</li>
                <li>Подтвердите платеж</li>
              </ol>
              
              <div class="sbp-banks">
                <p>Поддерживаемые банки:</p>
                <div class="banks-logos">
                  <img src="@/assets/sbp-banks/sber.png" alt="Сбербанк">
                  <img src="@/assets/sbp-banks/tinkoff.png" alt="Тинькофф">
                  <img src="@/assets/sbp-banks/alfa.png" alt="Альфа-Банк">
                  <img src="@/assets/sbp-banks/vtb.png" alt="ВТБ">
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="payment-actions">
          <button 
            class="btn-pay"
            @click="processPayment"
            :disabled="processingPayment || (selectedMethod === 'card' && !isCardValid)"
          >
            <span v-if="!processingPayment">Оплатить {{ totalPrice }} ₽</span>
            <span v-else>
              <span class="spinner"></span> Обработка платежа...
            </span>
          </button>
          
          <button 
            class="btn-cancel"
            @click="cancelPayment"
            :disabled="processingPayment"
          >
            Отменить
          </button>
        </div>
      </div>
  
      <!-- Модальное окно успешной оплаты -->
      <PaymentSuccessModal 
        v-if="paymentSuccess"
        :booking="bookingData"
        @close="redirectToTrips"
      />
    </div>
  </template>
  
  <script>
  import AppNavbar from '@/components/AppNavbar.vue';
  import PaymentSuccessModal from '@/components/PaymentSuccessModal.vue';
  import axios from 'axios';
  import Cookies from 'js-cookie';
  import { API_CONFIG } from '@/config/api'
  
  const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://unigo.onrender.com';
  
  export default {
    components: {
      AppNavbar,
      PaymentSuccessModal
    },
    data() {
      return {
        trip: {
          id: '',
          departure_location: '',
          arrival_location: '',
          departure_time: '',
          cost: 0,
          driver: {}
        },
        passengers: 1,
        selectedMethod: 'card',
        card: {
          number: '',
          expiry: '',
          cvv: '',
          name: ''
        },
        paymentData: {
          qrCode: null,
          paymentId: null
        },
        processingPayment: false,
        paymentSuccess: false,
        bookingData: null,
        checkStatusInterval: null
      };
    },
    computed: {
      totalPrice() {
        return this.trip.cost * this.passengers;
      },
      
      isCardValid() {
        // Простая валидация карты
        const cardNumberValid = this.card.number.replace(/\s/g, '').length === 16;
        const expiryValid = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(this.card.expiry);
        const cvvValid = this.card.cvv.length === 3;
        const nameValid = this.card.name.trim().length > 0;
        
        return cardNumberValid && expiryValid && cvvValid && nameValid;
      }
    },
    async created() {
      await this.loadTripData();
      
      // Если выбран SBP, сразу генерируем QR-код
      if (this.selectedMethod === 'sbp') {
        this.generateSbpQr();
      }
    },
    beforeDestroy() {
      if (this.checkStatusInterval) {
        clearInterval(this.checkStatusInterval);
      }
    },
    methods: {
      async loadTripData() {
        const tripId = this.$route.query.tripId;
        this.passengers = parseInt(this.$route.query.passengers) || 1;
        
        if (!tripId) {
          this.$router.push('/');
          return;
        }
  
        try {
          const response = await axios.get(`${API_BASE_URL}/api/trip/${tripId}`, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          if (response.data.success) {
            this.trip = response.data.trip;
          } else {
            throw new Error('Не удалось загрузить данные поездки');
          }
        } catch (error) {
          console.error('Ошибка загрузки данных поездки:', error);
          this.$notify({
            title: 'Ошибка',
            text: 'Не удалось загрузить данные поездки',
            type: 'error'
          });
          this.$router.push('/');
        }
      },
      
      selectMethod(method) {
        this.selectedMethod = method;
        
        if (method === 'sbp' && !this.paymentData.qrCode) {
          this.generateSbpQr();
        }
      },
      
      formatCardNumber() {
        this.card.number = this.card.number.replace(/\D/g, '')
          .replace(/(\d{4})(?=\d)/g, '$1 ')
          .substring(0, 19);
      },
      
      formatExpiry() {
        this.card.expiry = this.card.expiry.replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '$1/$2')
          .substring(0, 5);
      },
      
      async generateSbpQr() {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/payment/generate-qr`, {
            amount: this.totalPrice,
            tripId: this.trip.id,
            passengers: this.passengers
          }, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          if (response.data.success) {
            this.paymentData.qrCode = response.data.qrCode;
            this.paymentData.paymentId = response.data.paymentId;
            
            // Начинаем проверку статуса оплаты
            this.checkPaymentStatus();
          }
        } catch (error) {
          console.error('Ошибка генерации QR-кода:', error);
          this.$notify({
            title: 'Ошибка',
            text: 'Не удалось сгенерировать QR-код для оплаты',
            type: 'error'
          });
        }
      },
      
      async checkPaymentStatus() {
        if (!this.paymentData.paymentId) return;
        
        this.checkStatusInterval = setInterval(async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/payment/status/${this.paymentData.paymentId}`, {
              headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`
              }
            });
            
            if (response.data.status === 'succeeded') {
              clearInterval(this.checkStatusInterval);
              await this.createBooking();
            }
          } catch (error) {
            console.error('Ошибка проверки статуса платежа:', error);
          }
        }, 5000);
      },
      
      async processPayment() {
        if (this.selectedMethod === 'sbp') {
          // Для SBP просто ждем callback от checkPaymentStatus
          return;
        }
        
        this.processingPayment = true;
        
        try {
          // 1. Создаем платеж
          const paymentResponse = await axios.post(`${API_BASE_URL}/api/payment/process`, {
            method: this.selectedMethod,
            amount: this.totalPrice,
            card: this.selectedMethod === 'card' ? this.card : null,
            tripId: this.trip.id,
            passengers: this.passengers
          }, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          if (!paymentResponse.data.success) {
            throw new Error('Ошибка обработки платежа');
          }
          
          // 2. Создаем бронирование после успешной оплаты
          await this.createBooking();
          
        } catch (error) {
          console.error('Ошибка оплаты:', error);
          this.$notify({
            title: 'Ошибка',
            text: 'Не удалось обработать платеж. Пожалуйста, попробуйте еще раз.',
            type: 'error'
          });
        } finally {
          this.processingPayment = false;
        }
      },
      
      async createBooking() {
        try {
          // 1. Создаем бронирование
          const bookingResponse = await axios.post(`${API_BASE_URL}/api/bookings`, {
            trip_id: this.trip.id,
            seats_booked: this.passengers,
            total_cost: this.totalPrice
          }, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          if (!bookingResponse.data.success) {
            throw new Error('Ошибка создания бронирования');
          }
          
          const bookingId = bookingResponse.data.booking.id;
          
          // 2. Создаем чат с водителем
          await axios.post(`${API_BASE_URL}/api/chats`, {
            trip_id: this.trip.id,
            booking_id: bookingId,
            recipient_id: this.trip.driver.id
          }, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          // 3. Получаем полные данные бронирования для отображения
          const bookingDetails = await axios.get(`${API_BASE_URL}/api/bookings/${bookingId}`, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          this.bookingData = bookingDetails.data.booking;
          this.paymentSuccess = true;
          
        } catch (error) {
          console.error('Ошибка создания бронирования:', error);
          this.$notify({
            title: 'Ошибка',
            text: 'Платеж прошел, но возникла проблема с созданием бронирования. Свяжитесь с поддержкой.',
            type: 'error'
          });
        }
      },
      
      cancelPayment() {
        if (this.checkStatusInterval) {
          clearInterval(this.checkStatusInterval);
        }
        this.$router.go(-1);
      },
      
      redirectToTrips() {
        this.$router.push('/my-trips');
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
      }
    }
  };
  </script>
  
  <style scoped>
  .payment-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .payment-container {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .payment-header {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .payment-header h1 {
    margin-top: 0;
    color: #333;
  }
  
  .trip-summary p {
    margin: 8px 0;
    color: #555;
  }
  
  .payment-methods {
    margin-bottom: 30px;
  }
  
  .payment-methods h2 {
    margin-bottom: 15px;
    font-size: 20px;
  }
  
  .methods-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .method-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .method-card:hover {
    border-color: #3498db;
  }
  
  .method-card.active {
    border-color: #3498db;
    background-color: #f0f7fd;
  }
  
  .method-icon {
    font-size: 30px;
  }
  
  .method-info h3 {
    margin: 0 0 5px;
    font-size: 18px;
  }
  
  .method-info p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
  
  /* Форма оплаты картой */
  .card-payment-form {
    margin: 30px 0;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  }
  
  .form-group input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  /* SBP оплата */
  .sbp-payment {
    margin: 30px 0;
  }
  
  .sbp-qr-container {
    display: flex;
    gap: 30px;
  }
  
  .qr-code-placeholder {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #eee;
    text-align: center;
    width: 250px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .qr-loading {
    text-align: center;
  }
  
  .loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .qr-code {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #eee;
    text-align: center;
  }
  
  .qr-code img {
    width: 200px;
    height: 200px;
    display: block;
    margin: 0 auto;
  }
  
  .qr-amount {
    font-size: 20px;
    font-weight: bold;
    margin: 10px 0 0;
  }
  
  .sbp-instructions {
    flex: 1;
  }
  
  .sbp-instructions h3 {
    margin-top: 0;
  }
  
  .sbp-instructions ol {
    padding-left: 20px;
  }
  
  .sbp-instructions li {
    margin-bottom: 10px;
  }
  
  .sbp-banks {
    margin-top: 20px;
  }
  
  .sbp-banks p {
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .banks-logos {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .banks-logos img {
    height: 30px;
    width: auto;
  }
  
  /* Кнопки оплаты */
  .payment-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
  }
  
  .btn-pay, .btn-cancel {
    padding: 14px 25px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    flex: 1;
  }
  
  .btn-pay {
    background-color: #3498db;
    color: white;
    border: none;
  }
  
  .btn-pay:hover {
    background-color: #2980b9;
  }
  
  .btn-pay:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
  
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
  }
  
  .btn-cancel {
    background-color: white;
    color: #3498db;
    border: 1px solid #3498db;
  }
  
  .btn-cancel:hover {
    background-color: #f5f9fd;
  }
  
  .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Адаптация для мобильных */
  @media (max-width: 768px) {
    .payment-container {
      padding: 20px;
    }
    
    .methods-list {
      grid-template-columns: 1fr;
    }
    
    .sbp-qr-container {
      flex-direction: column;
    }
    
    .payment-actions {
      flex-direction: column;
    }
    
    .btn-pay, .btn-cancel {
      width: 100%;
    }
  }
  </style>