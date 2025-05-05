<template>
  <div>
    <AppNavbar />

    <div class="search-container">
      <!-- Поле "Откуда" -->
      <div class="input-container">
        <input
          type="text"
          placeholder="Откуда"
          v-model="fromLocation"
          @input="onFromLocationChange"
        />
        <ul
          v-if="fromLocation && fromAddressSuggestions.length"
          class="suggestions-list"
        >
          <li
            v-for="(suggestion, index) in fromAddressSuggestions"
            :key="index"
            @click="selectLocation('from', suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
        <span v-if="!isFromAddressValid && fromLocation" class="error-message">Выберите адрес из списка</span>
      </div>

      <!-- Поле "Куда" -->
      <div class="input-container">
        <input
          type="text"
          placeholder="Куда"
          v-model="toLocation"
          @input="onToLocationChange"
        />
        <ul
          v-if="toLocation && toAddressSuggestions.length"
          class="suggestions-list"
        >
          <li
            v-for="(suggestion, index) in toAddressSuggestions"
            :key="index"
            @click="selectLocation('to', suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
        <span v-if="!isToAddressValid && toLocation" class="error-message">Выберите адрес из списка</span>
      </div>

      <!-- Поле "Дата" -->
      <div class="input-container">
        <input type="date" placeholder="Дата" v-model="drivingDate" />
      </div>

      <!-- Кнопки -->
      <div class="passenger-btn-container">
        <!-- Кнопка для изменения количества пассажиров -->
        <button class="search-btn" @click="incrementPassenger">
          {{ passengerCount }} пассажир{{ passengerCount === 1 ? "" : "а" }}
        </button>

        <!-- Кнопка для перехода на страницу поиска -->
        <button class="search-btn" @click="goToSearch">Поиск</button>
      </div>
    </div>

    <!-- Уведомление -->
    <div v-if="notificationVisible" :class="['notification', notificationType]">
      {{ notificationMessage }}
    </div>

    <!-- Информационный раздел -->
    <div class="info-section">
      <div class="info-block">
        <img src="/pngwing.com (7).png" alt="Ваша поездка по низкой цене" />
        <h3>Ваша поездка по низкой цене</h3>
        <p>
          Неважно, куда вы направляетесь, вы сможете найти подходящий маршрут среди множества вариантов и добраться до места по самой выгодной цене.
        </p>
      </div>
      <div class="info-block">
        <img src="/pngwing.com (8).png" alt="Доверяйте своим попутчикам" />
        <h3>Доверяйте своим попутчикам</h3>
        <p>
          С UniGo вы путешествуете с проверенными попутчиками.
          Все участники приложения — это проверенные представители организации,
          что гарантирует вам безопасность и комфорт во время поездки.
        </p>
      </div>
      <div class="info-block">
        <img src="/pngwing.com (9).png" alt="В дорогу за пару кликов!" />
        <h3>В дорогу за пару кликов!</h3>
        <p>
          С UniGo вы сэкономите время и начнёте поездку за считанные минуты!
        </p>
      </div>
    </div>

    <!-- Подвал с контактной информацией и копирайтом -->
    <div class="footer">
      <div class="contact-info">
        <p>Контактная информация: <a href="mailto:info@unigo.com">info@unigo.com</a></p>
        <p><a href="/privacy-policy">Политика конфиденциальности</a></p>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 UniGO. Все права защищены.</p>
        <p>Версия 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from 'js-cookie';

const API_TOKEN = "72a0f8ef0a9e1bd454cf61b1d040c7b875965ed6";
const SUGGESTIONS_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      fromLocation: "",
      toLocation: "",
      drivingDate: "",
      passengerCount: 1,
      fromAddressSuggestions: [],
      toAddressSuggestions: [],
      notificationVisible: false,
      notificationMessage: "",
      notificationType: "",
      isFromAddressValid: true, // Изменено на true по умолчанию
      isToAddressValid: true,    // Изменено на true по умолчанию
    };
  },
  computed: {
    isFormValid() {
      return this.fromLocation && this.toLocation && this.drivingDate;
    },
  },
  
  methods: {
    incrementPassenger() {
      if (this.passengerCount < 4) {
        this.passengerCount++;
      } else {
        this.showNotification(
          "Вы не можете добавить больше 4 пассажиров.",
          "error"
        );
      }
    },

    goToSearch() {
      if (!this.isFormValid) {
        this.showNotification(
          "Пожалуйста, укажите все данные для поиска.",
          "error"
        );
        return;
      }

      const searchParams = {
        from: this.fromLocation,
        to: this.toLocation,
        date: this.drivingDate,
        passengers: this.passengerCount,
      };
      Cookies.set("searchParams", JSON.stringify(searchParams), { expires: 1 });

      this.$router.push({ name: "search-results" });
    },
    data() {
  return {
    mobileMenuVisible: false
  };
},
methods: {
  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
  }
},

    showNotification(message, type) {
      if (!message || !type) return;
      this.notificationMessage = message;
      this.notificationType = type;
      this.notificationVisible = true;
      setTimeout(() => {
        this.notificationVisible = false;
      }, 3000);
    },

    async getSuggestions(query) {
      if (!query || query.length < 2) return [];
      try {
        const response = await fetch(SUGGESTIONS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${API_TOKEN}`,
          },
          body: JSON.stringify({ query }),
        });
        if (!response.ok) {
          console.error("Ошибка при получении подсказок");
          return [];
        }
        const data = await response.json();
        return data.suggestions.map((suggestion) => suggestion.value);
      } catch (error) {
        console.error("Ошибка при запросе подсказок:", error);
        return [];
      }
    },

    async onFromLocationChange() {
      this.fromAddressSuggestions = await this.getSuggestions(this.fromLocation);
      this.isFromAddressValid = !this.fromLocation || this.fromAddressSuggestions.includes(this.fromLocation);
    },

    async onToLocationChange() {
      this.toAddressSuggestions = await this.getSuggestions(this.toLocation);
      this.isToAddressValid = !this.toLocation || this.toAddressSuggestions.includes(this.toLocation);
    },

    selectLocation(field, suggestion) {
      if (field === "from") {
        this.fromLocation = suggestion;
        this.isFromAddressValid = true;
        this.fromAddressSuggestions = [];
      } else if (field === "to") {
        this.toLocation = suggestion;
        this.isToAddressValid = true;
        this.toAddressSuggestions = [];
      }
    },
  },
};
</script>

<style scoped>
.background {
  background-image: url("/public/фон.jpg"); /* Используйте относительный путь */
}

/* Основные стили */
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
}

/* Навигационная панель */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  padding: 0 5%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.logo {
  display: flex;
  align-items: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}

.logo-img {
  height: 40px;
  margin-right: 12px;
}

/* Контейнер поиска */
.search-container {
  max-width: 1200px;
  margin: 120px auto 40px;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 66, 129, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.input-container {
  position: relative;
}

.input-container input {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.input-container input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
  background-color: white;
}

.input-container input[type="date"] {
  padding: 13px 20px;
}

/* Список подсказок */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  z-index: 100;
  margin-top: -2px;
}

.suggestions-list li {
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestions-list li:hover {
  background-color: #f8fafc;
}

/* Кнопки */
.passenger-btn-container {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-btn {
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.search-btn:first-child {
  background-color: #f1f5f9;
  color: #1e293b;
  border: 2px solid #e2e8f0;
}

.search-btn:last-child {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-btn:active {
  transform: translateY(0);
}

/* Уведомления */
.notification {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.4s ease-out;
}

.notification.success {
  background-color: #10b981;
  color: white;
}

.notification.error {
  background-color: #ef4444;
  color: white;
}

/* Информационные блоки */
.info-section {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.info-block {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.info-block:hover {
  transform: translateY(-5px);
}

.info-block img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 20px;
}

.info-block h3 {
  color: #1e3a8a;
  font-size: 20px;
  margin-bottom: 15px;
}

.info-block p {
  color: #64748b;
  line-height: 1.6;
}

/* Подвал */
.footer {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  padding: 40px 5%;
}

.contact-info {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.contact-info a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.contact-info a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.footer-bottom {
  max-width: 1200px;
  margin: 20px auto 0;
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* Анимации */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Мобильная адаптация */
@media (max-width: 1024px) {
  .search-container {
    margin-top: 100px;
    padding: 25px;
  }
  
  .info-section {
    padding: 0 20px;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 70px;
    padding: 0 20px;
  }
  
  .logo {
    font-size: 20px;
  }
  
  .logo-img {
    height: 30px;
  }
  
  .search-container {
    margin: 90px 20px 30px;
    padding: 20px;
    grid-template-columns: 1fr;
  }
  
  .passenger-btn-container {
    grid-column: 1 / -1;
    flex-direction: column;
  }
  
  .info-section {
    grid-template-columns: 1fr;
    margin-bottom: 40px;
  }
  
  .info-block {
    padding: 25px;
  }
  
  .footer {
    padding: 30px 20px;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .navbar {
    height: 60px;
    padding: 0 15px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .search-container {
    margin: 80px 15px 20px;
    padding: 15px;
  }
  
  .input-container input {
    padding: 12px 16px;
    font-size: 15px;
  }
  
  .search-btn {
    padding: 12px 16px;
    font-size: 15px;
  }
  
  .info-block {
    padding: 20px;
  }
  
  .info-block h3 {
    font-size: 18px;
  }
  
  .notification {
    top: 80px;
    width: 90%;
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #0f172a;
    color: #e2e8f0;
  }
  
  .search-container,
  .info-block {
    background-color: #1e293b;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
  }
  
  .input-container input {
    background-color: #334155;
    border-color: #475569;
    color: #e2e8f0;
  }
  
  .suggestions-list {
    background-color: #1e293b;
  }
  
  .suggestions-list li {
    border-color: #334155;
    color: #e2e8f0;
  }
  
  .suggestions-list li:hover {
    background-color: #334155;
  }
  
  .search-btn:first-child {
    background-color: #334155;
    color: #e2e8f0;
    border-color: #475569;
  }
  
  .info-block h3 {
    color: #93c5fd;
  }
  
  .info-block p {
    color: #94a3b8;
  }
}
</style>