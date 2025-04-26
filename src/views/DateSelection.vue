<template>
  <AppNavbar />
  <div class="date-selection-container">
    <h1 class="section-title">Выберите дату и время поездки</h1>

    <!-- Поле выбора даты -->
    <input type="date" v-model="selectedDate" :min="minDate" />

    <!-- Поле выбора времени -->
    <input type="time" v-model="selectedTime" />

    <!-- Кнопка подтверждения -->
    <button @click="submitDate" :disabled="isSubmitting">
      {{ isSubmitting ? 'Подтверждение...' : 'Подтвердить' }}
    </button>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import Cookies from 'js-cookie';

export default {
  components: {
    AppNavbar,
  },
  methods: {
    submitDate() {
      if (!this.selectedDate || !this.selectedTime) {
        alert("Пожалуйста, выберите дату и время!");
        return;
      }

      this.isSubmitting = true;

      const updatedTrip = {
        ...this.trip,
        date: this.selectedDate,
        pickUpTime: this.selectedTime,
      };

      const tripData = JSON.parse(Cookies.get("tripData")); // 👈 вот тут нужно распарсить!

      Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 });
    
      console.log(tripData);

      setTimeout(() => {
        this.isSubmitting = false;
        this.$router.push({ name: "PassengerCount" });
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

input[type="date"],
input[type="time"] {
  width: 80%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  background-color: #f7f7f7;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

input[type="date"]:focus,
input[type="time"]:focus {
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
