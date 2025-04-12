<template>
    <div>
      <AppNavbar />
      <div class="select-car-container">
        <h1 class="section-title">Выберите модель автомобиля:</h1>
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label for="carModel">Модель:</label>
            <select
              id="carModel"
              v-model="selectedCarModel"
              required
            >
              <option value="" disabled>Выберите модель</option>
              <option v-for="model in filteredModels" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn-login">Далее</button>
        </form>
      </div>
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
        selectedCarModel: '', // Выбранная модель автомобиля
        searchQuery: '', // Поисковый запрос
        carModels: [
          "Polo", "Passat", "Golf", "Tiguan", "Jetta", "Arteon", "Up!", "Touareg", "ID.3", "ID.4",
          "A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "R8", "S3", "S4", "S5",
          "S6", "S7", "S8", "RS3", "RS4", "RS5", "RS7", "Q2", "Q3", "Q5", "Q7", "Q8", "Tiguan Allspace",
          "Kodiaq", "Superb", "Octavia", "Fabia", "Scala", "Yeti", "Rapid", "Karoq", "Ateca", "Arona",
          "Ibiza", "Leon", "Toledo", "Mii", "Seat Tarraco", "Leon Cupra", "Civic", "Accord", "Jazz",
          "HR-V", "CR-V", "Pilot", "Insight", "Element", "Odyssey", "Mazda3", "Mazda6", "CX-5", "CX-30",
          "CX-9", "MX-5", "Miata", "Fiesta", "Focus", "Mustang", "Escape", "Edge", "F-150", "Ranger",
          "Bronco", "Explorer", "Expedition", "Navigator", "Expedition MAX", "Explorer ST", "F-250",
          "F-350", "Transit", "C-Max", "Fusion", "Kuga", "Mondeo", "S-Max", "Galaxy", "Transit Connect",
          "Fiat 500", "Punto", "Tipo", "Doblo", "Panda", "Alfa Romeo Giulietta", "Stelvio", "Giulia",
          "Fiat Panda", "Fiat Tipo", "Fiat 500X", "Renegade", "Cherokee", "Grand Cherokee", "Wagoneer"
        ], // Полный список моделей
        filteredModels: [] // Отфильтрованный список моделей
      };
    },
    created() {
      this.filteredModels = this.carModels; // Инициализируем отфильтрованный список
    },
    methods: {
      filterModels() {
        this.filteredModels = this.carModels.filter((model) =>
          model.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      handleSubmit() {
        if (this.selectedCarModel) {
          Cookies.set("model", this.selectedCarModel, { expires: 10 / (24 * 60) });
          this.$router.push('/choose-color'); // Переход на следующий этап
        } else {
          alert('Пожалуйста, выберите модель автомобиля');
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
  
  .car-image {
    max-width: 30%;
    height: auto;
    position: absolute;
    right: 0;
    bottom: 20%;
    z-index: 2;
  }
  </style>
  