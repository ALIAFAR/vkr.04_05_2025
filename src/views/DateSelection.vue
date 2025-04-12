<template>
  <AppNavbar />
  <div class="date-selection-container">
    <h1 class="section-title">Выберите дату поездки</h1>

    <!-- Поле выбора даты -->
    <input type="date" v-model="selectedDate" :min="minDate" />

    <!-- Кнопка подтверждения -->
    <button @click="submitDate" :disabled="isSubmitting">
      {{ isSubmitting ? 'Подтверждение...' : 'Подтвердить' }}
    </button>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from 'js-cookie'; // Импорт библиотеки для работы с cookies

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      selectedDate: "",
      minDate: new Date().toISOString().split("T")[0], // Минимальная дата — сегодня
      trip: {
        from: "",
        to: "",
      },
      isSubmitting: false, // Флаг для блокировки кнопки во время отправки
    };
  },
  created() {
    // Загружаем данные о поездке из cookies
    const trips = Cookies.get("publishedTrips") ? JSON.parse(Cookies.get("publishedTrips")) : [];
    
    if (trips.length > 0) {
      // Берем последнюю поездку
      const lastTrip = trips[trips.length - 1];
      this.trip.from = lastTrip.from;
      this.trip.to = lastTrip.to;
    } else {
      // Если данных нет, перенаправляем на страницу публикации поездки
      this.$router.push({ name: "publish-trip-page" });
    }
  },
  methods: {
    // Подтверждение выбора даты
    submitDate() {
      if (!this.selectedDate) {
        alert("Пожалуйста, выберите дату!");
        return;
      }

      this.isSubmitting = true;

      // Обновляем данные о поездке с выбранной датой
      const updatedTrip = {
        ...this.trip,
        date: this.selectedDate,
      };

      // Сохраняем обновленные данные в cookies
      Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 }); // Сохраняем на 7 дней

      // Имитация задержки для UX
      setTimeout(() => {
        this.isSubmitting = false;

        // Переход на страницу выбора времени
        this.$router.push({ name: "PickUpTime" });
      }, 1000);
    },
  },
};
</script>


<style scoped>
.date-selection-container {
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

.trip-details {
  margin-bottom: 20px;
  text-align: left;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.trip-details p {
  margin: 10px 0;
  font-size: 16px;
  color: #333;
}

.trip-details strong {
  color: #004281;
}

input[type="date"] {
  width: 80%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  background-color: #f7f7f7;
}

input[type="date"]:focus {
  outline: none;
  background-color: #e3e3e3;
  border-color: #004281;
  box-shadow: 0 0 5px rgba(0, 66, 129, 0.5);
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
</style>