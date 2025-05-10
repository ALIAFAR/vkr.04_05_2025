<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Оплата прошла успешно!</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-content">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div class="payment-details">
            <div class="detail-row">
              <span class="detail-label">Сумма:</span>
              <span class="detail-value">{{ amount }} ₽</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Номер платежа:</span>
              <span class="detail-value">{{ paymentId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Маршрут:</span>
              <span class="detail-value">{{ route }}</span>
            </div>
          </div>
          
          <div class="additional-info">
            <p>Чек отправлен на вашу почту. Водитель свяжется с вами в ближайшее время.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-primary" @click="closeModal">Отлично!</button>
          <button class="btn-secondary" @click="downloadReceipt">Скачать чек (PDF)</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      amount: {
        type: Number,
        required: true
      },
      paymentId: {
        type: String,
        required: true
      },
      route: {
        type: String,
        required: true
      }
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
      downloadReceipt() {
    // Просто вызываем родительский метод
    this.$emit('download-receipt');
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .modal-container {
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    color: #2ecc71;
    font-size: 22px;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #777;
    padding: 0;
    line-height: 1;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .modal-content {
    padding: 25px;
    text-align: center;
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background-color: #f0fdf4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .success-icon svg {
    width: 48px;
    height: 48px;
    fill: #2ecc71;
  }
  
  .payment-details {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    text-align: left;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .detail-row:last-child {
    margin-bottom: 0;
  }
  
  .detail-label {
    color: #666;
    font-weight: 500;
  }
  
  .detail-value {
    color: #333;
    font-weight: 600;
  }
  
  .additional-info {
    color: #555;
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 15px;
  }
  
  .modal-footer {
    display: flex;
    padding: 15px;
    border-top: 1px solid #eee;
    gap: 10px;
  }
  
  .btn-primary {
    flex: 1;
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: #27ae60;
  }
  
  .btn-secondary {
    flex: 1;
    background-color: white;
    color: #2ecc71;
    border: 1px solid #2ecc71;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover {
    background-color: #f0fdf4;
  }
  
  /* Адаптация для мобильных */
  @media (max-width: 600px) {
    .modal-container {
      margin: 0 15px;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn-primary, .btn-secondary {
      width: 100%;
    }
  }
  </style>