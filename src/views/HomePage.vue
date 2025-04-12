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
import Cookies from 'js-cookie'; // Импорт библиотеки для работы с cookies

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
      isFromAddressValid: false, // Флаг для проверки валидности адреса "Откуда"
      isToAddressValid: false, // Флаг для проверки валидности адреса "Куда"
    };
  },
  computed: {
    // Проверка валидности всей формы
    isFormValid() {
      return this.isFromAddressValid && this.isToAddressValid && this.drivingDate;
    },
  },
  methods: {
    // Увеличение количества пассажиров
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

    // Переход на страницу поиска
    goToSearch() {
      if (!this.isFormValid) {
        this.showNotification(
          "Пожалуйста, укажите все данные для поиска и выберите адреса из списка.",
          "error"
        );
        return;
      }

      // Сохраняем параметры поиска в cookies
      const searchParams = {
        from: this.fromLocation,
        to: this.toLocation,
        date: this.drivingDate,
        passengers: this.passengerCount,
      };
      Cookies.set("searchParams", JSON.stringify(searchParams), { expires: 1 }); // Сохраняем на 1 день

      // Переход на страницу поиска
      this.$router.push({ name: "search-results" });
    },

    // Показать уведомление
    showNotification(message, type) {
      if (!message || !type) return;
      this.notificationMessage = message;
      this.notificationType = type;
      this.notificationVisible = true;
      setTimeout(() => {
        this.notificationVisible = false;
      }, 3000);
    },

    // Получение подсказок для адресов
    async getSuggestions(query) {
      if (!query || query.length < 2) return [];
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
    },

    // Обработка изменения поля "Откуда"
    async onFromLocationChange() {
      this.fromAddressSuggestions = await this.getSuggestions(this.fromLocation);
      this.isFromAddressValid = this.fromAddressSuggestions.includes(this.fromLocation); // Проверка, что адрес выбран из списка
    },

    // Обработка изменения поля "Куда"
    async onToLocationChange() {
      this.toAddressSuggestions = await this.getSuggestions(this.toLocation);
      this.isToAddressValid = this.toAddressSuggestions.includes(this.toLocation); // Проверка, что адрес выбран из списка
    },

    // Выбор адреса из подсказок
    selectLocation(field, suggestion) {
      if (field === "from") {
        this.fromLocation = suggestion;
        this.isFromAddressValid = true; // Адрес выбран из списка
      } else if (field === "to") {
        this.toLocation = suggestion;
        this.isToAddressValid = true; // Адрес выбран из списка
      }
      this.fromAddressSuggestions = [];
      this.toAddressSuggestions = [];
    },
  },
};
</script>

<style scoped>
.background {
  background-image: url("/public/logo.png"); /* Используйте относительный путь */
}

/* Основные стили для страницы */
body {
  font-family: Arial, sans-serif;
  background-image: url("/public/фон.jpg") no-repeat center center fixed;
  background-size: cover;
  margin: 0;
  padding-top: 80px; /* Пространство для панели */
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
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.616);
}

.notification.error {
  background-color: rgba(189, 15, 15, 0.61);
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
  font-size: 36px; /* Увеличенный размер шрифта */
  font-family: 'Poppins', sans-serif; /* Пример красивого шрифта */
  font-weight: bold; /* Сделать шрифт жирным */
  color: rgba(0, 66, 129, 1); /* Цвет шрифта */
}

/* Подключение шрифта Lora */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;700&display=swap');

.logo-img {
  width: 100px; /* Увеличьте ширину логотипа */
    height: auto; /* Сохраняет пропорции изображения */
    margin-right: 10px; /* Отступ между логотипом и текстом */
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
  justify-content: space-between;
  gap: 40px;
  padding: 20px;
  max-width: 1200px;
  margin: 160px auto 0 auto;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.passenger-btn-container {
  display: flex;
  justify-content: space-between; /* Распределение кнопок с одинаковыми промежутками */
  width: 100%; /* Обеспечивает использование всей доступной ширины */
  gap: 30px; /* Регулирует расстояние между кнопками */
}

.input-container {
  position: relative;
  flex: 1;
}

/* Поля ввода и кнопки */
.search-container input,
.search-container button {
  padding: 8px;
  margin: 10px;
  border-radius: 5px;
  width: 180px;
}

.search-btn {
  background-color: rgba(0, 66, 129, 1);
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 16px;
  cursor: pointer;
}

.suggestions-list {
  position: absolute;
  top: 35px;
  left: 10px;
  width: calc(100% - 20px);
  background-color: white;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 1000;
}

.suggestions-list li {
  padding: 8px;
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
  flex-wrap: wrap; /* Позволяет блокам переноситься на новую строку при необходимости */
}

.info-block {
  flex: 1 1 calc(33% - 20px); /* Каждый блок занимает 1/3 ширины */
  text-align: center;
  box-sizing: border-box;
  padding: 20px;
  background-color: #f7f7f7; /* Цвет фона блока */
  border-radius: 8px; /* Скругление углов */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Выравнивание по вертикали */
  align-items: center; /* Выравнивание по горизонтали */
  min-height: 200px; /* Обеспечивает одинаковую высоту для всех блоков */
}

.info-block img {
  width: 80px;
  height: auto;
  margin-bottom: 15px; /* Отступ между изображением и текстом */
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

@media (max-width: 768px) {
  .info-block {
    flex: 1 1 100%; /* Для мобильных устройств блоки занимают всю ширину */
  }
}


/* Подвал */
footer {
  text-align: center;
  margin: 20px 0;
  color: rgba(0, 66, 129, 0.8);
  font-size: 14px;
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
}

.notification.success {
  background-color: rgba(0, 128, 0, 0.616);
}

.notification.error {
  background-color: rgba(142, 13, 13, 0.61);
}
@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: center;
    padding: 15px;
  }
  
  .menu {
    display: none; /* Прячем меню на мобильных */
  }

  .profile-photo {
    width: 30px;
    height: 30px;
  }
  
  .passenger-btn-container {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
    margin-top: 10px;
  }
}
.notification {
  animation: slideIn 0.5s ease;
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

/* Стили для подвала */
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
</style>
