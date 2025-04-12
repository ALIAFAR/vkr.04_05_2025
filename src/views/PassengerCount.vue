<template>
    <AppNavbar />
    <div class="passenger-count-container">
      <h1 class="section-title">Выберите количество пассажиров</h1>
      <input type="number" v-model="passengerCount" min="1" max="10" />
      <button @click="submitPassengerCount">Подтвердить</button>
    </div>
  </template>
  
  <script>
  import AppNavbar from "@/components/AppNavbar.vue";
  import Cookies from 'js-cookie';
  
  export default {
    components: {
      AppNavbar,
    },
    data() {
      return {
        passengerCount: 1,
      };
    },
    created() {
      // Проверяем, есть ли данные о поездке в cookies
      const tripData = Cookies.get("tripData");
      if (!tripData) {
        // Если данных нет, перенаправляем на страницу выбора даты прибытия
        this.$router.push({ name: "ArrivalDate" });
      }
    },
    methods: {
      submitPassengerCount() {
        if (!this.passengerCount || this.passengerCount < 1) {
          alert("Пожалуйста, выберите корректное количество пассажиров!");
          return;
        }
  
        // Загружаем данные о поездке из cookies
        const tripData = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : {};
  
        // Обновляем данные о поездке с выбранным количеством пассажиров
        const updatedTrip = {
          ...tripData,
          passengerCount: this.passengerCount,
        };
  
        // Сохраняем обновленные данные в cookies
        Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 });
  
        // Переход на страницу с расчетом стоимости (или другую нужную страницу)
        this.$router.push({ name: "CarSelection" }).catch((error) => {
          console.error("Ошибка при переходе:", error);
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .passenger-count-container {
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
  
  input[type="number"] {
    width: 80%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 10px;
    background-color: #f7f7f7;
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
  }
  
  button:hover {
    background-color: #003365;
  }
  
  button:active {
    background-color: #002549;
  }
  </style>