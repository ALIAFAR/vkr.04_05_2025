<template>
  <AppNavbar />
  <div class="comment-container">
    <h1 class="section-title">Хотите сказать о поездке что-то еще?</h1>
    <textarea
      v-model="comment"
      placeholder="Напишите свой комментарий здесь (необязательно)"
      rows="5"
      cols="40"
    ></textarea>
    <button @click="submitComment" :disabled="isSubmitting">
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
      comment: "", // Комментарий пользователя
      isPublished: false, // Флаг успешной публикации
      isSubmitting: false, // Флаг для блокировки кнопки во время отправки
    };
  },
  created() {
    // Загружаем данные о поездке из cookies
    const tripData = Cookies.get("tripData");
    if (!tripData) {
      // Если данных нет, перенаправляем на страницу выбора багажа
      this.$router.push({ name: "BaggAge" });
    }
  },
  methods: {
    submitComment() {
      this.isSubmitting = true;

      // Загружаем данные о поездке из cookies
      const tripData = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : {};

      // Обновляем данные о поездке с комментарием
      const updatedTrip = {
        ...tripData,
        comment: this.comment,
      };

      // Сохраняем обновленные данные в cookies
      Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 });

      // Имитация задержки для UX
      setTimeout(() => {
        this.isSubmitting = false;
        this.isPublished = true; // Показываем сообщение об успешной публикации
        console.log("Комментарий пользователя:", this.comment);
        console.log("Поездка опубликована:", updatedTrip);

        // Переход на страницу выбора типа бронирования
        this.goHome();
      }, 1000);
    },
    goHome() {
      // Переход на страницу выбора типа бронирования
      this.$router.push({ name: "BookingType" });
    },
  },
};
</script>

<style scoped>
.comment-container {
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

textarea {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  transition: border-color 0.3s;
}

textarea:focus {
  border-color: #004281;
  outline: none;
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
</style>