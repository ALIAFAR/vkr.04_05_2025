<template>
  <AppNavbar />
  <div class="price-container">
    <h1 class="section-title">Установите цену за место</h1>
    <p class="price-description">Введите цену (₽)</p>
    <input type="number" v-model="price" placeholder="Введите цену" min="0" />
    <button @click="submitPrice" :disabled="isSubmitting">
      {{ isSubmitting ? 'Подтверждение...' : 'Подтвердить' }}
    </button>
    <p class="description">
      Установите оптимальную цену за эту поездку! Пассажиры не заставят себя
      ждать.
    </p>
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
      price: "", // Цена, которую вводит пользователь
      isSubmitting: false, // Флаг для блокировки кнопки во время отправки
    };
  },
  created() {
    // Загружаем данные о поездке из cookies
    const tripData = Cookies.get("tripData");
    if (!tripData) {
      // Если данных нет, перенаправляем на страницу выбора времени прибытия
      this.$router.push({ name: "ArrivalTime" });
    }
  },
  methods: {
    submitPrice() {
      if (!this.price || isNaN(this.price) || this.price < 0) {
        alert("Пожалуйста, введите корректную цену!");
        return;
      }

      this.isSubmitting = true;

      // Загружаем данные о поездке из cookies
      const tripData = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : {};

      // Обновляем данные о поездке с выбранной ценой
      const updatedTrip = {
        ...tripData,
        price: this.price,
      };

      // Сохраняем обновленные данные в cookies
      Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 });

      // Имитация задержки для UX
      setTimeout(() => {
        this.isSubmitting = false;

        // Переход на страницу выбора багажа
        this.$router.push({ name: "BaggAge" }).catch((error) => {
          console.error("Ошибка при переходе:", error);
        });
      }, 1000);
    },
  },
};
</script>

<style scoped>
.price-container {
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

.price-description {
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
}

input[type="number"] {
  width: 80%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  background-color: #f7f7f7;
  transition: all 0.3s ease;
}

input[type="number"]:focus {
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

.description {
  font-size: 14px;
  color: gray;
  margin-top: 20px;
  line-height: 1.5;
}
</style>