<template>
    <div>
      <AppNavbar />
      <div class="select-car-container">
        <h1 class="section-title">Выберите марку автомобиля:</h1>
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label for="manufacturer">Марка:</label>
            <select
              id="manufacturer"
              v-model="selectedManufacturer"
              required
            >
              <option value="" disabled>Выберите марку</option>
              <option v-for="manufacturer in manufacturers" :key="manufacturer" :value="manufacturer">
                {{ manufacturer }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn-login">Далее</button>
        </form>
      </div>
      <!-- Картинка машинки -->
      <img src="/машина.webp" alt="Машина" class="car-image" />
    </div>
  </template>
  
  <script>
  import AppNavbar from "@/components/AppNavbar.vue";
  import Cookies from "js-cookie"; // Импортируем библиотеку для работы с кукисами
  
  export default {
    components: {
      AppNavbar,
    },
    data() {
      return {
        selectedManufacturer: '', // Выбранный производитель
        manufacturers: [ // Список производителей
          "Toyota",
          "Honda",
          "Ford",
          "Chevrolet",
          "BMW",
          "Mercedes-Benz",
          "Audi",
          "Volkswagen",
          "Nissan",
          "Hyundai",
          "Kia",
          "Volvo",
          "Lexus",
          "Mazda",
          "Subaru",
          "Tesla",
          "Porsche",
          "Jaguar",
          "Land Rover",
          "Ferrari",
          "Lamborghini",
          "Mitsubishi",
          "Peugeot",
          "Renault",
          "Skoda",
          "Suzuki",
          "Alfa Romeo",
          "Aston Martin",
          "Bentley",
          "Bugatti",
          "Cadillac",
          "Chrysler",
          "Dodge",
          "Fiat",
          "Genesis",
          "Infiniti",
          "Jeep",
          "Maserati",
          "Mini",
          "Rolls-Royce",
          "Saab",
          "Smart",
          "Tata",
          "Tesla",
          "Volkswagen",
          "Volvo"
        ],
      };
    },
    methods: {
      handleSubmit() {
        if (this.selectedManufacturer) {
          Cookies.set("mark", this.selectedManufacturer, { expires: 10 / (24 * 60) });
          this.$router.push('/marka-car'); // Переход на следующий этап
        } else {
          alert('Пожалуйста, выберите производителя автомобиля');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .select-car-container {
    text-align: center;
    padding: 50px 20px;
    max-width: 600px;
    margin: 120px auto 0;
    background-color: rgba(107, 151, 193, 0.299);
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative; /* Для позиционирования картинки */
  }
  
  .section-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
  
  .input-group {
    margin-bottom: 20px;
  }
  
  label {
    font-size: 18px;
    margin-bottom: 5px;
    display: block;
    text-align: left;
  }
  
  select {
    width: 90%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 5px;
    background-color: #f7f7f7;
    text-align: left;
  }
  
  select:focus {
    outline: none;
    background-color: #e3e3e3;
    border-color: #004281;
    box-shadow: 0 0 5px rgba(0, 66, 129, 0.5);
  }
  
  .btn-login {
    padding: 12px;
    font-size: 18px;
    background-color: #004281;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
  }
  
  .btn-login:hover {
    background-color: #003365;
  }
  
  .btn-login:active {
    background-color: #002549;
  }
  
  /* Стиль для картинки с машиной */
  .car-image {
    max-width: 30%;
    height: auto;
    position: absolute;
    right: 0;
    bottom: 20%; /* Позиционируем ниже контейнера */
    z-index: 2; /* Картинка не должна закрывать форму */
  }
  </style>