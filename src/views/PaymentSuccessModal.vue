<template>
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="success-header">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h2>Оплата прошла успешно!</h2>
          <p class="success-message">Ваша поездка подтверждена. Детали отправлены на вашу почту.</p>
        </div>
  
        <div class="booking-details">
          <div class="detail-item">
            <span class="detail-label">Номер бронирования:</span>
            <span class="detail-value">{{ booking.id }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Маршрут:</span>
            <span class="detail-value">{{ booking.departure }} → {{ booking.arrival }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Дата и время:</span>
            <span class="detail-value">{{ formatDateTime(booking.date) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Мест:</span>
            <span class="detail-value">{{ booking.passengers }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value">{{ booking.price }} ₽</span>
          </div>
        </div>
  
        <div class="driver-info">
          <h3>Информация о водителе</h3>
          <div class="detail-item">
            <span class="detail-label">Имя:</span>
            <span class="detail-value">{{ booking.driverName }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Телефон:</span>
            <span class="detail-value">
              <a :href="'tel:' + booking.driverPhone">{{ booking.driverPhone }}</a>
            </span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Автомобиль:</span>
            <span class="detail-value">{{ booking.carModel }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Номер авто:</span>
            <span class="detail-value">{{ booking.carNumber }}</span>
          </div>
        </div>
  
        <div class="modal-actions">
          <button @click="openChat" class="btn-chat">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            Написать водителю
          </button>
          <button @click="close" class="btn-close">Закрыть</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      booking: {
        type: Object,
        required: true,
        default: () => ({
          id: '',
          departure: '',
          arrival: '',
          date: '',
          passengers: 1,
          price: 0,
          driverName: '',
          driverPhone: '',
          carModel: '',
          carNumber: ''
        })
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      
      openChat() {
        // Здесь логика открытия чата с водителем
        this.$router.push(`/chat/${this.booking.chatId}`);
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
      
      copyBookingNumber() {
        navigator.clipboard.writeText(this.booking.id);
        this.$notify({
          title: 'Скопировано',
          text: 'Номер бронирования скопирован в буфер обмена',
          type: 'success'
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    padding: 30px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.4s ease;
  }
  
  .success-header {
    text-align: center;
    margin-bottom: 25px;
  }
  
  .success-icon {
    width: 60px;
    height: 60px;
    background-color: #4CAF50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
  }
  
  .success-icon svg {
    width: 30px;
    height: 30px;
    color: white;
  }
  
  h2 {
    margin: 0 0 10px;
    color: #333;
    font-size: 24px;
  }
  
  .success-message {
    margin: 0;
    color: #666;
    font-size: 16px;
  }
  
  .booking-details, .driver-info {
    margin: 25px 0;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .driver-info h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 18px;
    color: #333;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
  
  .detail-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .detail-label {
    font-weight: 500;
    color: #555;
  }
  
  .detail-value {
    color: #333;
    text-align: right;
  }
  
  .detail-value a {
    color: #3498db;
    text-decoration: none;
  }
  
  .detail-value a:hover {
    text-decoration: underline;
  }
  
  .modal-actions {
    display: flex;
    gap: 15px;
    margin-top: 25px;
  }
  
  .btn-chat, .btn-close {
    flex: 1;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .btn-chat {
    background-color: #3498db;
    color: white;
    border: none;
  }
  
  .btn-chat:hover {
    background-color: #2980b9;
  }
  
  .btn-chat svg {
    width: 18px;
    height: 18px;
  }
  
  .btn-close {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
  }
  
  .btn-close:hover {
    background-color: #f5f5f5;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      transform: translateY(20px);
      opacity: 0;
    }
    to { 
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 600px) {
    .modal-content {
      width: 95%;
      padding: 20px;
    }
    
    .modal-actions {
      flex-direction: column;
    }
    
    .btn-chat, .btn-close {
      width: 100%;
    }
  }
  </style>