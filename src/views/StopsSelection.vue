<template>
  <div>
    <!-- Добавляем AppNavbar -->
    <AppNavbar />

    <div class="stops-selection-container">
      <h1 class="section-title">Добавьте остановки (необязательно)</h1>
      <form @submit.prevent="handleSubmit">
        <!-- Отображение начального и конечного адреса -->
        <div class="route-info">
          <p><strong>Откуда:</strong> {{ fromLocation }}</p>
          <p><strong>Куда:</strong> {{ toLocation }}</p>
        </div>

        <!-- Поле для добавления остановок -->
        <div class="input-group">
          <label for="stop">Добавить остановку</label>
          <input
            type="text"
            id="stop"
            v-model="stopInput"
            @input="fetchStopSuggestions"
            @focus="showStopSuggestions = true"
            placeholder="Введите адрес остановки"
          />
          <ul v-if="showStopSuggestions && stopSuggestions.length" class="suggestions-list">
            <li
              v-for="(suggestion, index) in stopSuggestions"
              :key="index"
              @click="selectStop(suggestion)"
            >
              {{ suggestion }}
            </li>
          </ul>
          <button type="button" @click="addStop" :disabled="!stopInput">Добавить остановку</button>
        </div>

        <!-- Список добавленных остановок -->
        <div class="stops-list" v-if="stops.length > 0">
          <h3>Остановки:</h3>
          <ul>
            <li v-for="(stop, index) in stops" :key="index">
              {{ stop }}
              <button @click="removeStop(index)" class="remove-stop-btn">Удалить</button>
            </li>
          </ul>
        </div>

        <!-- Кнопка подтверждения маршрута -->
        <button type="submit" class="confirm-btn">Подтвердить маршрут</button>
      </form>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue"; // Импортируем AppNavbar
import Cookies from 'js-cookie';

const API_TOKEN = "72a0f8ef0a9e1bd454cf61b1d040c7b875965ed6";
const SUGGESTIONS_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

export default {
  components: {
    AppNavbar, // Регистрируем AppNavbar
  },
  data() {
    return {
      fromLocation: "",
      toLocation: "",
      stopInput: "",
      stopSuggestions: [],
      showStopSuggestions: false,
      stops: [],
    };
  },
  created() {
    // Если переданы параметры через query, используем их
    if (this.$route.query.from && this.$route.query.to) {
      this.fromLocation = this.$route.query.from;
      this.toLocation = this.$route.query.to;
    } else {
      // Если параметров нет, загружаем из cookies
      const trip = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : null;
      if (trip) {
        this.fromLocation = trip.from;
        this.toLocation = trip.to;
      }

      // Загружаем остановки из cookies
      const stopsCount = Cookies.get("stops_count") || 0;
      for (let i = 1; i <= stopsCount; i++) {
        const stop = Cookies.get(`stop_${i}`);
        if (stop) {
          this.stops.push(stop);
        }
      }
    }
  },
  methods: {
    // Получение подсказок для остановок
    async fetchStopSuggestions() {
      if (this.stopInput.length < 2) {
        this.stopSuggestions = [];
        return;
      }
      this.stopSuggestions = await this.getSuggestions(this.stopInput);
    },

    // Выбор остановки из списка подсказок
    selectStop(suggestion) {
      this.stopInput = suggestion;
      this.showStopSuggestions = false;
    },

    // Добавление остановки в список
    addStop() {
      if (this.stopInput && !this.stops.includes(this.stopInput)) {
        this.stops.push(this.stopInput);
        this.stopInput = "";
        this.stopSuggestions = [];
      }
    },

    // Удаление остановки из списка
    removeStop(index) {
      this.stops.splice(index, 1);
    },

    // Получение подсказок от API
    async getSuggestions(query) {
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

    // Обработка подтверждения маршрута
    handleSubmit() {
      // Сохраняем маршрут с остановками в cookies
      const trip = {
        from: this.fromLocation,
        to: this.toLocation,
      };

      // Сохраняем остановки как отдельные ключи
      this.stops.forEach((stop, index) => {
        Cookies.set(`stop_${index + 1}`, stop, { expires: 7 });
      });

      // Сохраняем количество остановок
      Cookies.set("stops_count", this.stops.length, { expires: 7 });

      // Сохраняем основную информацию о поездке
      Cookies.set("tripData", JSON.stringify(trip), { expires: 7 });

      // Переход на следующую страницу с выбором даты
      this.$router.push({ path: "/date-selection" });
    },
  },
};
</script>

<style scoped>
.stops-selection-container {
  text-align: center;
  padding: 50px 20px;
  max-width: 600px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.route-info {
  margin-bottom: 20px;
  text-align: left;
}

.input-group {
  margin-bottom: 20px;
  position: relative;
}

input {
  width: 90%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  background-color: #f7f7f7;
  text-align: left;
}

input:focus {
  outline: none;
  background-color: #e3e3e3;
  border-color: #004281;
  box-shadow: 0 0 5px rgba(0, 66, 129, 0.5);
}

.suggestions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: white;
  border: 1px solid #ccc;
  max-height: 100px;
  overflow-y: auto;
  position: absolute;
  z-index: 10;
  text-align: left;
  width: 90%;
}

.suggestions-list li {
  padding: 10px;
  cursor: pointer;
  text-align: left;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

button {
  padding: 12px;
  font-size: 16px;
  background-color: #004281;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #003365;
}

button:active:not(:disabled) {
  background-color: #002549;
}

.stops-list {
  margin-top: 20px;
  text-align: left;
}

.stops-list ul {
  list-style: none;
  padding: 0;
}

.stops-list li {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-stop-btn {
  background-color: #a71f1f;
  padding: 5px 10px;
  font-size: 14px;
}

.confirm-btn {
  margin-top: 20px;
  width: 100%;
}
</style>