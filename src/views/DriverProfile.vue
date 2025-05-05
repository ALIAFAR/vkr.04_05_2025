<template>
    <div class="driver-profile">
      <!-- Шапка профиля -->
      <div class="profile-header">
        <button class="back-button" @click="goBack">← Назад</button>
        
        <div class="driver-main-info">
          <img 
            :src="driver.avatar || '/default-avatar.jpg'" 
            alt="Аватар водителя" 
            class="driver-avatar"
            @error="handleImageError"
          >
          
          <div class="driver-text-info">
            <h1>{{ driver.name }} {{ driver.surname }}</h1>
            <div class="driver-rating">
              <span class="star">★</span>
              <span class="rating-value">{{ driver.rating || 'Нет оценки' }}</span>
              <span class="reviews-count">({{ driver.reviews_count || 0 }} отзывов)</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Основная информация -->
      <div class="profile-section">
        <h2>Основная информация</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Возраст:</span>
            <span class="info-value">{{ calculateAge(driver.birth_date) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Стаж вождения:</span>
            <span class="info-value">{{ calculateDrivingExperience(driver.license_issue_date) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">На сервисе с:</span>
            <span class="info-value">{{ formatDate(driver.registration_date) }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Всего поездок:</span>
            <span class="info-value">{{ driver.total_trips || 0 }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Отменено поездок:</span>
            <span class="info-value">{{ driver.canceled_trips || 0 }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Перенесено поездок:</span>
            <span class="info-value">{{ driver.rescheduled_trips || 0 }}</span>
          </div>
        </div>
      </div>
  
      <!-- Информация об автомобиле -->
      <div v-if="driver.car" class="profile-section">
        <h2>Автомобиль</h2>
        <div class="car-info">
          <div class="car-image-placeholder">
            <span class="car-icon">🚗</span>
          </div>
          
          <div class="car-details">
            <div class="car-model">
              {{ driver.car.brand }} {{ driver.car.model }} 
              <span v-if="driver.car.year">({{ driver.car.year }})</span>
            </div>
            
            <div class="car-specs">
              <span v-if="driver.car.color">Цвет: {{ driver.car.color }}</span>
              <span v-if="driver.car.plate_number">Номер: {{ driver.car.plate_number }}</span>
            </div>
            
            <div class="car-features" v-if="driver.car.features && driver.car.features.length > 0">
              <div class="feature-tag" v-for="(feature, index) in driver.car.features" :key="index">
                <span class="feature-icon">{{ getFeatureIcon(feature) }}</span>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Отзывы -->
      <div class="profile-section">
        <h2>Отзывы</h2>
        
        <div v-if="driver.reviews && driver.reviews.length > 0" class="reviews-list">
          <div v-for="(review, index) in driver.reviews" :key="index" class="review-item">
            <div class="review-header">
              <img 
                :src="review.passenger_avatar || '/default-avatar.jpg'" 
                alt="Аватар пассажира" 
                class="reviewer-avatar"
                @error="handleImageError"
              >
              
              <div class="reviewer-info">
                <div class="reviewer-name">{{ review.passenger_name }}</div>
                <div class="review-rating">
                  <span class="star">★</span>
                  <span class="rating-value">{{ review.rating }}</span>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
              </div>
            </div>
            
            <div class="review-text" v-if="review.comment">
              "{{ review.comment }}"
            </div>
          </div>
        </div>
        
        <div v-else class="no-reviews">
          Пока нет отзывов
        </div>
      </div>
  
      <!-- Кнопка чата -->
      <div class="chat-button-container">
        <button class="chat-button" @click="startChat">
          Написать сообщение
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Cookies from 'js-cookie';
  
  export default {
    name: 'DriverProfile',
    data() {
      return {
        driver: {
          name: '',
          surname: '',
          avatar: '',
          birth_date: '',
          license_issue_date: '',
          registration_date: '',
          rating: null,
          reviews_count: 0,
          total_trips: 0,
          canceled_trips: 0,
          rescheduled_trips: 0,
          car: null,
          reviews: []
        },
        loading: true,
        error: null
      };
    },
    async created() {
      await this.fetchDriverData();
    },
    methods: {
      async fetchDriverData() {
        this.loading = true;
        this.error = null;
        
        try {
          const driverId = this.$route.params.id;
          const response = await axios.get(`https://unigo.onrender.com/api/drivers/${driverId}`, {
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`
            }
          });
          
          this.driver = response.data.driver || {};
        } catch (error) {
          console.error('Ошибка при загрузке данных водителя:', error);
          
          if (error.response) {
            if (error.response.status === 401) {
              this.error = 'Для просмотра профиля необходимо авторизоваться';
              this.$router.push('/login');
            } else if (error.response.status === 404) {
              this.error = 'Профиль водителя не найден';
            }
          } else {
            this.error = 'Произошла ошибка при загрузке данных';
          }
        } finally {
          this.loading = false;
        }
      },
      
      calculateAge(birthDate) {
        if (!birthDate) return 'Не указан';
        const birthYear = new Date(birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear + ' лет';
      },
      
      calculateDrivingExperience(licenseDate) {
        if (!licenseDate) return 'Не указано';
        
        const licenseYear = new Date(licenseDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const experience = currentYear - licenseYear;
        
        if (experience === 0) return 'Менее года';
        return `${experience} ${this.declension(experience, ['год', 'года', 'лет'])}`;
      },
      
      formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
      },
      
      declension(number, titles) {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[
          number % 100 > 4 && number % 100 < 20 
            ? 2 
            : cases[number % 10 < 5 ? number % 10 : 5]
        ];
      },
      
      getFeatureIcon(feature) {
        const icons = {
          'Детское кресло': '👶',
          'Перевозка животных': '🐾',
          'Негабаритный багаж': '🧳'
        };
        
        return icons[feature] || '✅';
      },
      
      startChat() {
        const token = Cookies.get('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        this.$router.push(`/chat/${this.$route.params.id}`);
      },
      
      goBack() {
        this.$router.go(-1);
      },
      
      handleImageError(event) {
        event.target.src = '/pngwing.com (5).png';
      }
    }
  };
  </script>
  
  <style scoped>
  .driver-profile {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }
  
  /* Шапка профиля */
  .profile-header {
    margin-bottom: 30px;
    position: relative;
  }
  
  .back-button {
    background: none;
    border: none;
    color: #3498db;
    font-size: 16px;
    cursor: pointer;
    padding: 5px 0;
    margin-bottom: 20px;
  }
  
  .back-button:hover {
    text-decoration: underline;
  }
  
  .driver-main-info {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .driver-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #3498db;
  }
  
  .driver-text-info h1 {
    margin: 0;
    font-size: 24px;
  }
  
  .driver-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
  }
  
  .star {
    color: #ffc107;
    font-size: 18px;
  }
  
  .rating-value {
    font-weight: bold;
    font-size: 18px;
  }
  
  .reviews-count {
    color: #666;
    font-size: 14px;
  }
  
  /* Секции профиля */
  .profile-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .profile-section h2 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  /* Основная информация */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }
  
  .info-label {
    color: #666;
  }
  
  .info-value {
    font-weight: bold;
  }
  
  /* Информация об автомобиле */
  .car-info {
    display: flex;
    gap: 20px;
    align-items: center;
    background-color: #f5f9fd;
    padding: 15px;
    border-radius: 8px;
  }
  
  .car-image-placeholder {
    width: 80px;
    height: 80px;
    background-color: #e0e9f3;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }
  
  .car-details {
    flex-grow: 1;
  }
  
  .car-model {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 5px;
  }
  
  .car-specs {
    display: flex;
    gap: 15px;
    color: #555;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .car-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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
  
  /* Отзывы */
  .reviews-list {
    display: grid;
    gap: 15px;
  }
  
  .review-item {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
  }
  
  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  
  .reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .reviewer-info {
    flex-grow: 1;
  }
  
  .reviewer-name {
    font-weight: bold;
  }
  
  .review-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #666;
    font-size: 14px;
  }
  
  .review-date {
    color: #888;
    font-size: 13px;
    margin-left: 8px;
  }
  
  .review-text {
    font-style: italic;
    padding: 10px;
    background-color: white;
    border-radius: 5px;
    border-left: 3px solid #0a619b;
  }
  
  .no-reviews {
    text-align: center;
    color: #777;
    padding: 20px;
  }
  
  /* Кнопка чата */
  .chat-button-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }
  
  .chat-button {
    background-color: #0a5384;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 30px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s;
  }
  
  .chat-button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  /* Адаптация для мобильных устройств */
  @media (max-width: 768px) {
    .driver-profile {
      padding: 15px;
    }
    
    .driver-main-info {
      flex-direction: column;
      text-align: center;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .car-info {
      flex-direction: column;
      text-align: center;
    }
    
    .car-specs {
      flex-direction: column;
      gap: 5px;
    }
    
    .chat-button-container {
      position: static;
      margin-top: 20px;
      text-align: center;
    }
    
    .chat-button {
      width: 100%;
      border-radius: 5px;
    }
  }
  </style>
