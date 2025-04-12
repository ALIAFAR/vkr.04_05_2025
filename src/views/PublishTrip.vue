<template>
  <AppNavbar />
  <div class="publish-trip-container">
    <h1 class="section-title">Публикация поездки</h1>
    <form @submit.prevent="handleSubmit">
      <!-- Поле "Откуда" -->
      <div class="input-group">
        <label for="departure">Откуда</label>
        <input
          type="text"
          id="departure"
          v-model="departure"
          @input="fetchFromSuggestions"
          @blur="validateFromAddress"
          @focus="showFromSuggestions = true"
          placeholder="Введите место отправления"
          required
        />
        <ul v-if="showFromSuggestions && fromAddressSuggestions.length" class="suggestions-list">
          <li
            v-for="(suggestion, index) in fromAddressSuggestions"
            :key="index"
            @click="selectFromSuggestion(suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
        <span v-if="!isFromAddressValid && departure" class="error-message">Выберите адрес из списка</span>
      </div>

      <!-- Поле "Куда" -->
      <div class="input-group">
        <label for="destination">Куда</label>
        <input
          type="text"
          id="destination"
          v-model="destination"
          @input="fetchToSuggestions"
          @blur="validateToAddress"
          @focus="showToSuggestions = true"
          placeholder="Введите пункт назначения"
          required
        />
        <ul v-if="showToSuggestions && toAddressSuggestions.length" class="suggestions-list">
          <li
            v-for="(suggestion, index) in toAddressSuggestions"
            :key="index"
            @click="selectToSuggestion(suggestion)"
          >
            {{ suggestion }}
          </li>
        </ul>
        <span v-if="!isToAddressValid && destination" class="error-message">Выберите адрес из списка</span>
      </div>

      <!-- Кнопка публикации -->
      <button type="submit" :disabled="isSubmitting || !isFormValid">
        {{ isSubmitting ? 'Публикация...' : 'Опубликовать' }}
      </button>
    </form>
  </div>
  <img src="/машина.webp" alt="Машина" class="car-image" />
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
      departure: "",
      destination: "",
      fromAddressSuggestions: [],
      toAddressSuggestions: [],
      showFromSuggestions: false,
      showToSuggestions: false,
      isSubmitting: false,
      isFromAddressValid: false,
      isToAddressValid: false,
    };
  },
  computed: {
    isFormValid() {
      return this.isFromAddressValid && this.isToAddressValid;
    },
  },
  methods: {
    async fetchFromSuggestions() {
      if (this.departure.length < 2) {
        this.fromAddressSuggestions = [];
        return;
      }
      this.fromAddressSuggestions = await this.getSuggestions(this.departure);
    },

    async fetchToSuggestions() {
      if (this.destination.length < 2) {
        this.toAddressSuggestions = [];
        return;
      }
      this.toAddressSuggestions = await this.getSuggestions(this.destination);
    },

    selectFromSuggestion(suggestion) {
      this.departure = suggestion;
      this.isFromAddressValid = true;
      this.showFromSuggestions = false;
    },

    selectToSuggestion(suggestion) {
      this.destination = suggestion;
      this.isToAddressValid = true;
      this.showToSuggestions = false;
    },

    validateFromAddress() {
      if (!this.fromAddressSuggestions.includes(this.departure)) {
        this.departure = "";
        this.isFromAddressValid = false;
      }
    },

    validateToAddress() {
      if (!this.toAddressSuggestions.includes(this.destination)) {
        this.destination = "";
        this.isToAddressValid = false;
      }
    },

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

    async handleSubmit() {
  if (!this.isFormValid) {
    alert("Пожалуйста, выберите адреса из списка.");
    return;
  }

  this.isSubmitting = true;

  // Создаем объект поездки с тем же форматом, что и в StopsSelection
  const tripData = {
    from: this.departure,
    to: this.destination,
    stops: [] // Пока пустой массив, остановки будут добавлены позже
  };

  // Сохраняем в cookies под ключом tripData
  Cookies.set("tripData", JSON.stringify(tripData), { expires: 7 });
  Cookies.set("from_route", this.departure, { expires: 0.0104167 });
  Cookies.set("to_route", this.destination, { expires: 0.0104167 });
  console.log(tripData)
  console.log("ааааа",Cookies.get("tripData") )
  console.log("this.departure",this.departure)
  console.log("this.destination",this.destination)


  // Также сохраняем количество остановок (пока 0)
  Cookies.set("stops_count", 0, { expires: 7 });

  // Переход на страницу выбора остановок с передачей адресов через query
  this.$router.push({
    path: "/stops-selection",
    query: {
      from: this.departure,
      to: this.destination,
    },
  });

  this.departure = "";
  this.destination = "";
  this.isSubmitting = false;
}

  },
};
</script>

<style scoped>
.publish-trip-container {
  text-align: center;
  padding: 50px 20px;
  max-width: 600px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
  position: relative;
}

label {
  font-size: 18px;
  margin-bottom: 5px;
  display: block;
  text-align: left;
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
  font-size: 18px;
  background-color: #004281;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
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

.car-image {
  max-width: 30%;
  height: auto;
  position: absolute;
  right: 0%;
  bottom: 20%;
  z-index: 2;
}

.error-message {
  color: rgb(129, 6, 6);
  font-size: 14px;
  display: block;
  text-align: left;
  margin-top: 5px;
}
</style>