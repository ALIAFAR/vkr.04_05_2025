<template>
  <div class="payment-page">
    <AppNavbar />
    
    <div class="payment-container">
      <div class="payment-header">
        <h1>Оплата поездки</h1>
        <div class="trip-summary">
          <p><strong>Маршрут:</strong> {{ trip.departure_location }} → {{ trip.arrival_location }}</p>
          <p><strong>Дата:</strong> {{ formatDateTime(trip.departure_time) }}</p>
          <p><strong>Цена:</strong> {{ totalPrice }} ₽</p>
        </div>
      </div>

      <div class="payment-methods">
        <h2>Выберите способ оплаты</h2>
        
        <div class="methods-list">
          <div 
            class="method-card"
            :class="{ 'active': selectedMethod === 'yoomoney' }"
            @click="selectMethod('yoomoney')"
          >
            <div class="method-icon">🟣</div>
            <div class="method-info">
              <h3>ЮMoney</h3>
              <p>Оплата через кошелек или карту</p>
            </div>
          </div>
          
          <div 
            class="method-card"
            :class="{ 'active': selectedMethod === 'qr' }"
            @click="selectMethod('qr')"
          >
            <div class="method-icon">📱</div>
            <div class="method-info">
              <h3>QR-код</h3>
              <p>Оплата через мобильное приложение</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Форма ЮMoney -->
      <div v-if="selectedMethod === 'yoomoney'" class="yoomoney-payment">
        <div class="payment-description">
          <p>Вы будете перенаправлены на безопасную страницу оплаты ЮMoney.</p>
        </div>
        
        <form 
          method="POST" 
          action="https://yoomoney.ru/quickpay/confirm.xml"
          target="_blank"
          @submit.prevent="submitYoomoneyForm"
        >
          <input type="hidden" name="receiver" :value="yoomoneyWallet">
          <input type="hidden" name="formcomment" :value="`Поездка ${trip.departure_location} → ${trip.arrival_location}`">
          <input type="hidden" name="label" :value="paymentId">
          <input type="hidden" name="quickpay-form" value="shop">
          <input type="hidden" name="sum" :value="totalPrice" data-type="number">
          
          <button type="submit" class="btn-pay">
            Перейти к оплате
          </button>
        </form>
      </div>

      <!-- QR-оплата -->
      <div v-if="selectedMethod === 'qr'" class="qr-payment">
        <div class="qr-container">
          <div v-if="!qrCode" class="qr-loading">
            <div class="loader"></div>
            <p>Генерация QR-кода...</p>
          </div>
          <div v-else class="qr-code">
            <img :src="qrCode" alt="QR-код для оплаты">
            <p class="qr-amount">{{ totalPrice }} ₽</p>
          </div>
        </div>

        <div class="payment-instructions">
          <h3>Как оплатить:</h3>
          <ol>
            <li>Откройте приложение ЮMoney</li>
            <li>Нажмите "Оплатить по QR-коду"</li>
            <li>Наведите камеру на код</li>
            <li>Подтвердите платеж</li>
          </ol>
        </div>
      </div>

      <div class="payment-actions">
        <button 
          class="btn-cancel"
          @click="cancelPayment"
        >
          Отменить
        </button>
      </div>
    </div>

    <!-- Модальное окно успешной оплаты -->
    <PaymentSuccessModal 
    v-if="paymentSuccess"
    :amount="totalPrice"
    :payment-id="paymentId"
    :route="`${trip.departure_location} → ${trip.arrival_location}`"
    @close="redirectToTrips"
    @download-receipt="generateReceipt"
  />
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import PaymentSuccessModal from '@/components/PaymentSuccessModal.vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://your-api-url.com';

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
        cost: 0
      },
      selectedMethod: 'yoomoney',
      yoomoneyWallet: '4100119137893957',
      paymentId: '',
      qrCode: '',
      paymentSuccess: false,
      checkStatusInterval: null
    };
  },
  computed: {
    totalPrice() {
      return this.trip.cost;
    }
  },
  async created() {
    await this.loadTripData();
    this.generatePaymentId();
  },
  beforeDestroy() {
    if (this.checkStatusInterval) {
      clearInterval(this.checkStatusInterval);
    }
  },
  methods: {
    async loadTripData() {
      const tripId = this.$route.query.tripId;
      if (!tripId) {
        this.$router.push('/');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/trip/${tripId}`, {
          headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        });
        this.trip = response.data.trip;
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        this.$router.push('/');
      }
    },

    generatePaymentId() {
      this.paymentId = `trip_${this.trip.id}_${Date.now()}`;
    },
    async generateReceipt() {
    try {
      // 1. Создаем новый PDF документ
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([400, 600]);
      
      // 2. Загружаем стандартные шрифты
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // 3. Добавляем логотип (опционально)
      // const logoUrl = '/logo.png';
      // const logoImage = await pdfDoc.embedPng(await fetch(logoUrl).then(res => res.arrayBuffer());
      // page.drawImage(logoImage, { x: 150, y: 520, width: 100, height: 50 });
      
      // 4. Рисуем заголовок
      page.drawText('Чек об оплате', {
        x: 50,
        y: 500,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // 5. Добавляем информацию о платеже
      const textLines = [
        `Номер платежа: ${this.paymentId}`,
        `Дата: ${new Date().toLocaleString('ru-RU')}`,
        `Маршрут: ${this.trip.departure_location} → ${this.trip.arrival_location}`,
        `Сумма: ${this.totalPrice} ₽`,
        `Способ оплаты: ЮMoney`,
        `Статус: Успешно`,
      ];
      
      textLines.forEach((line, index) => {
        page.drawText(line, {
          x: 50,
          y: 450 - (index * 25),
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      });
      
      // 6. Добавляем QR-код (опционально)
      if (this.qrCode) {
        const qrResponse = await fetch(this.qrCode);
        const qrImage = await pdfDoc.embedPng(await qrResponse.arrayBuffer());
        page.drawImage(qrImage, {
          x: 150,
          y: 200,
          width: 100,
          height: 100,
        });
        page.drawText('QR для проверки', {
          x: 150,
          y: 190,
          size: 10,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      
      // 7. Добавляем подпись
      page.drawText('Спасибо за использование нашего сервиса!', {
        x: 50,
        y: 100,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // 8. Генерируем PDF и скачиваем
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Чек_${this.paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Ошибка генерации чека:', error);
      this.$notify({
        title: 'Ошибка',
        text: 'Не удалось сгенерировать чек',
        type: 'error'
      });
    }
  },
    selectMethod(method) {
      this.selectedMethod = method;
      if (method === 'qr' && !this.qrCode) {
        this.generateQrCode();
      }
    },

    async generateQrCode() {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/payment/qr`, {
          amount: this.totalPrice,
          paymentId: this.paymentId
        }, {
          headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        });
        
        this.qrCode = response.data.qrCode;
        this.startPaymentStatusCheck();
      } catch (error) {
        console.error('Ошибка генерации QR:', error);
      }
    },

    async submitYoomoneyForm() {
      this.startPaymentStatusCheck();
    },

    startPaymentStatusCheck() {
      this.checkStatusInterval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/payment/status/${this.paymentId}`,
            { headers: { 'Authorization': `Bearer ${Cookies.get('token')}` } }
          );
          
          if (response.data.status === 'succeeded') {
            clearInterval(this.checkStatusInterval);
            this.paymentSuccess = true;
          }
        } catch (error) {
          console.error('Ошибка проверки статуса:', error);
        }
      }, 5000);
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
      return date.toLocaleString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
.payment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.payment-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.payment-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.payment-header h1 {
  margin: 0 0 15px;
  font-size: 24px;
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
  margin-bottom: 20px;
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
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-card:hover {
  border-color: #7B68EE;
}

.method-card.active {
  border-color: #7B68EE;
  background-color: #f5f3ff;
}

.method-icon {
  font-size: 28px;
}

.method-info h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.method-info p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.yoomoney-payment,
.qr-payment {
  margin: 30px 0;
  text-align: center;
}

.payment-description {
  margin-bottom: 20px;
  color: #555;
}

.btn-pay {
  background-color: #7B68EE;
  color: white;
  border: none;
  padding: 14px 25px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: block;
}

.btn-pay:hover {
  background-color: #6A5ACD;
}

.qr-container {
  margin: 0 auto 30px;
  max-width: 300px;
}

.qr-loading {
  padding: 40px 0;
  text-align: center;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #7B68EE;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.qr-code {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-code img {
  width: 100%;
  height: auto;
  display: block;
}

.qr-amount {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.payment-instructions {
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
}

.payment-instructions h3 {
  margin-top: 0;
}

.payment-instructions ol {
  padding-left: 20px;
}

.payment-instructions li {
  margin-bottom: 8px;
}

.payment-actions {
  margin-top: 30px;
  text-align: center;
}

.btn-cancel {
  background: none;
  color: #7B68EE;
  border: 1px solid #7B68EE;
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #f5f3ff;
}

@media (max-width: 600px) {
  .methods-list {
    grid-template-columns: 1fr;
  }
  
  .payment-container {
    padding: 20px;
  }
}
</style>