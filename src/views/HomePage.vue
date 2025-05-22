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
        <ul v-if="fromLocation && fromAddressSuggestions.length" class="suggestions-list">
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
        <ul v-if="toLocation && toAddressSuggestions.length" class="suggestions-list">
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
      <input type="date" id="trip-date" class="date-input" />
      <label for="trip-date" class="placeholder-label">Дата</label>
      </div>


      <!-- Счётчик пассажиров (+ 1 -) -->
      <div class="passenger-control">
        <button class="passenger-btn" @click="decrementPassenger" :disabled="passengerCount <= 1">−</button>
        <span class="passenger-count">{{ passengerCount }}</span>
        <button class="passenger-btn" @click="incrementPassenger" :disabled="passengerCount >= 4">+</button>
      </div>

      <!-- Кнопка "Поиск" -->
      <button class="search-btn" @click="goToSearch">Поиск</button>
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
    if (this.passengerCount < 20) {
      this.passengerCount++;
    } else {
      this.showNotification(
        "Максимальное количество пассажиров - 20",
        "error"
      );
    }
  },
  decrementPassenger() {
    if (this.passengerCount > 1) {
      this.passengerCount--;
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
/* Основные стили для страницы */
body {
  font-family: Arial, sans-serif;
  background-image: url("/public/фон.jpg") no-repeat center center fixed;
  background-size: cover;
  margin: 0;
  padding-top: 80px;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slideIn 0.5s ease;
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.616);
}

.notification.error {
  background-color: rgba(189, 15, 15, 0.61);
}

@keyframes slideIn {
  from {
    top: -50px;
    opacity: 0;
  }
  to {
    top: 20px;
    opacity: 1;
  }
}

/* Навигационная панель */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 80px;
  font-size: 36px;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: rgba(0, 66, 129, 1);
}

.logo-img {
  width: 100px;
  height: auto;
  margin-right: 10px;
}

.menu {
  display: flex;
  gap: 20px;
  margin-right: 40px;
}

.menu-item {
  background-color: transparent;
  border: none;
  color: rgba(0, 66, 129, 0.8);
  font-size: 16px;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Стили для профиля */
.profile {
  position: relative;
  margin-left: auto;
}

.profile-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgba(0, 66, 129, 0.8);
  color: black;
  box-shadow: 0px 4px 6px rgba(0, 66, 129, 0.8);
}

.dropdown-menu button {
  background: transparent;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
}

/* Основной контейнер для поиска */
.search-container {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 10px;
  max-width: 1200px;
  margin: 100px auto 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Контейнеры для полей ввода */
.input-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  height: 50px;
}

.input-container input {
  width: 100%;
  height: 100%;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

/* Стили для счётчика пассажиров */
.passenger-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 8px;
  padding: 0 15px;
  height: 50px;
  border: 1px solid #ddd;
  min-width: 180px;
}

.passenger-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.passenger-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(0, 66, 129, 0.3);
  background-color: transparent;
  color: rgba(0, 66, 129, 0.8);
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.passenger-btn:hover:not(:disabled) {
  background-color: rgba(0, 66, 129, 0.1);
  border-color: rgba(0, 66, 129, 0.5);
}

.passenger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.passenger-count {
  min-width: 30px;
  text-align: center;
  font-size: 16px;
  color: rgba(0, 66, 129, 0.8);
}

/* Стили для кнопки поиска */
.search-btn {
  height: 50px;
  padding: 0 25px;
  background-color: rgba(0, 66, 129, 1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.search-btn:hover {
  background-color: rgba(0, 66, 129, 0.9);
}

/* Выпадающие подсказки */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 1000;
}

.suggestions-list li {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.suggestions-list li:hover {
  background-color: rgba(0, 66, 129, 0.1);
}

/* Информационный раздел */
.info-section {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 40px;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 10px;
  margin: 40px auto;
  max-width: 1200px;
  flex-wrap: wrap;
}

.info-block {
  flex: 1 1 calc(33% - 20px);
  text-align: center;
  box-sizing: border-box;
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.info-block img {
  width: 80px;
  height: auto;
  margin-bottom: 15px;
}

.info-block h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: rgba(0, 66, 129, 1);
}

.info-block p {
  font-size: 14px;
  color: #444;
}

/* Подвал */
.footer {
  background-color: rgba(107, 151, 193, 0.299);
  padding: 20px 0;
  text-align: center;
  font-size: 14px;
}

.contact-info p {
  margin: 5px 0;
}

.contact-info a {
  color: rgba(0, 66, 129, 0.8);
  text-decoration: none;
}

.contact-info a:hover {
  text-decoration: underline;
}

.footer-bottom {
  margin-top: 10px;
  font-size: 12px;
  color: #555;
}

/* Мобильная адаптация */
@media (max-width: 1024px) {
  .search-container {
    flex-wrap: wrap;
    margin-top: 120px;
  }
  
  .input-container,
  .passenger-control {
    flex: 1 1 45%;
    min-width: 200px;
  }
  
  .search-btn {
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  body {
    padding-top: 60px;
  }

  .navbar {
    height: 60px;
    padding: 10px 15px;
  }

  .logo {
    font-size: 24px;
    margin-right: 20px;
  }

  .logo-img {
    width: 60px;
  }

  .menu {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
    background: none;
    border: none;
    font-size: 24px;
    color: rgba(0, 66, 129, 0.8);
    cursor: pointer;
    margin-left: auto;
    margin-right: 15px;
  }

  .profile-photo {
    width: 32px;
    height: 32px;
  }

  .mobile-menu {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 999;
    display: none;
  }

  .mobile-menu.show {
    display: block;
  }

  .mobile-menu-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    text-align: center;
    color: rgba(0, 66, 129, 0.8);
  }

  .search-container {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    margin: 100px auto 20px;
    width: 90%;
  }

  .input-container,
  .passenger-control,
  .search-btn {
    width: 100%;
    margin-bottom: 0;
  }

  .input-container input,
  .search-btn {
    padding: 12px 15px;
    font-size: 16px;
  }

  .passenger-control {
    justify-content: center;
    padding: 0 10px;
  }

  .info-section {
    flex-direction: column;
    padding: 20px;
    margin: 20px auto;
    width: 90%;
    gap: 15px;
  }

  .info-block {
    width: 100%;
    margin-bottom: 15px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 20px;
  }

  .logo-img {
    width: 50px;
  }

  .search-container input,
  .search-btn {
    font-size: 14px;
  }

  .passenger-btn {
    width: 25px;
    height: 25px;
    font-size: 14px;
  }

  .passenger-count {
    font-size: 14px;
  }

  .info-block h3 {
    font-size: 16px;
  }

  .info-block p {
    font-size: 13px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  /* Кнопки меню */
  .menu-item {
    font-size: 14px;
    padding: 8px 12px;
  }

  /* Кнопки управления пассажирами */
  .passenger-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .passenger-control {
    padding: 0 10px;
    min-width: auto;
  }

  /* Кнопка поиска */
  .search-btn {
    width: 100%;
    font-size: 16px;
    padding: 12px;
  }

  /* Кнопки в выпадающем меню профиля */
  .dropdown-menu button {
    font-size: 14px;
    padding: 10px;
  }

  /* Мобильные кнопки */
  .mobile-menu-item {
    font-size: 16px;
    padding: 12px 0;
  }
}/* Стили для поля даты, чтобы выглядело как другие поля ввода */
input[type="date"] {
  width: 100%;
  height: 50px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: white;
  color: #333;
  font-family: inherit;
}

/* Убираем внутреннюю иконку календаря (опционально) */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5); /* подгоняем стиль под остальные элементы */
  cursor: pointer;
}

/* Адаптация для мобильных */
@media (max-width: 768px) {
  input[type="date"] {
    flex: 1 1 45%;
    min-width: 200px;
    appearance: none;
    -webkit-appearance: none;
    background-position: right 10px center;
    background-repeat: no-repeat;
    background-size: 20px 20px;
  }
}
/* Стили для поля даты */
.date-input {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 15px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  color: #333;
  z-index: 2;
}

.placeholder-label {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 16px;
  z-index: 1;
}

/* Скрывать псевдоплейсхолдер при выборе даты */
.date-input:valid + .placeholder-label,
.date-input:not(:placeholder-shown) + .placeholder-label {
  display: none;
}

/* Safari fix для пустого поля */
.date-input:invalid + .placeholder-label {
  display: block;
}


</style>