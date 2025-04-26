<template>
    <modal name="booking-confirmation" height="auto" :adaptive="true">
      <div class="booking-confirmation-modal">
        <h3>Подтверждение бронирования</h3>
        
        <div class="safety-warning">
          <h4>Важно для вашей безопасности:</h4>
          <ul>
            <li>Перед поездкой обязательно проверьте номерной знак автомобиля</li>
            <li>Убедитесь, что водитель соответствует фотографии в профиле</li>
            <li>Сайт не несет ответственность за действия водителя</li>
            <li>Сообщайте о любых несоответствиях в службу поддержки</li>
          </ul>
        </div>
        
        <div class="payment-methods" v-if="trip.instant_booking">
          <h4>Выберите способ оплаты:</h4>
          <div class="payment-option" @click="selectPayment('card')">
            <input type="radio" id="card" v-model="paymentMethod" value="card">
            <label for="card">Банковская карта</label>
          </div>
          </div>
        </div>
        
        <div class="confirmation-buttons">
          <button class="btn-confirm" @click="confirmBooking">
            Подтвердить бронирование
          </button>
          <button class="btn-cancel" @click="$modal.hide('booking-confirmation')">
            Отмена
          </button>
        </div>
      </modal>
  </template>
  
  <script>
  export default {
    name: 'BookingConfirmationModal',
    props: {
      trip: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        paymentMethod: 'card'
      }
    },
    methods: {
      selectPayment(method) {
        this.paymentMethod = method;
      },
      confirmBooking() {
        // здесь логика подтверждения бронирования
        console.log('Booking confirmed with method:', this.paymentMethod);
        this.$modal.hide('booking-confirmation');
      }
    }
  }
  </script>
  
  <style scoped>
  .booking-confirmation-modal {
    padding: 20px;
  }
  
  .safety-warning {
    background-color: #fff3cd;
    border-left: 4px solid #ffeeba;
    padding: 10px;
    margin-bottom: 20px;
  }
  
  .payment-option {
    margin-bottom: 10px;
    cursor: pointer;
  }
  
  .confirmation-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  
  .btn-confirm {
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border: none;
    cursor: pointer;
  }
  
  .btn-cancel {
    background-color: #dc3545;
    color: white;
    padding: 10px 15px;
    border: none;
    cursor: pointer;
  }
  </style>
  