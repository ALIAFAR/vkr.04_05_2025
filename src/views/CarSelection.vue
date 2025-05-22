<template>
  <div>
    <AppNavbar />
    <div class="display-data-container">
      <!-- Блок для отображения сообщений -->
      <div v-if="showMessage" ref="messageBox" class="message error">
        {{ messageText }}
      </div>

      <!-- Данные о транспортных средствах -->
      <div v-for="(car, index) in carData" :key="index" class="car-item">
        <div class="data-item">
          <label>Госномер:</label>
          <span>{{ car.carNumber }}</span>
        </div>
        <div class="data-item">
          <label>Свидетельство о регистрации (СТС):</label>
          <span>{{ car.carSTS }}</span>
        </div>
        <div class="data-item">
          <label>Марка авто:</label>
          <span>{{ car.carBrand }}</span>
        </div>
        <div class="data-item">
          <label>Модель авто:</label>
          <span>{{ car.carModel }}</span>
        </div>
        <button @click="deleteVehicle(index)" class="btn-delete">Выбрать это транспортное средство</button>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG } from '@/config/api'

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      carData: [], // Данные о транспортных средствах
      showMessage: false, // Видимость сообщения
      messageText: "", // Текст сообщения
      messageType: "error", // Тип сообщения (error или success)
    };
  },
  async created() {
    // Загрузка данных о транспортных средствах при создании компонента
    await this.fetchCarData();
  },
  methods: {
    // Загрузка данных о транспортных средствах из базы данных
    async fetchCarData() {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(API_CONFIG.BASE_URL +'/car/profileCar', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.carData = response.data.car.map(car => ({
          carBrand: car.mark, // Марка авто
          carModel: car.brand, // Модель авто
          carNumber: car.car_number, // Госномер
          carSTS: car.sts_number, // Свидетельство о регистрации (СТС)
          color: car.color // Цвет (если нужно)
        }));
      } catch (error) {
        console.error("Ошибка при загрузке данных о транспортных средствах:", error);
        this.showMessage = true;
        this.messageText = "Ошибка при загрузке данных.";
        this.messageType = "error";
      }
    },

    // Удаление транспортного средства
    async deleteVehicle(index) {
      const carNumber = this.carData[index].carNumber; // Получаем госномер
      const tripData = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : {};

      // Обновляем данные о поездке с выбранной машиной
      const updatedTrip = {
        ...tripData,
        selectedCar: carNumber,
      };
  
      // Сохраняем обновленные данные в cookies
      Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 });

      // Переход на следующую страницу (например, страницу подтверждения)
        this.$router.push({ name: "PriceInput" }).catch((error) => {
            console.error("Ошибка при переходе:", error);
        });        
    },
  },
};
</script>

<style scoped>
/* Стили для сообщений */
.message {
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #c62828;
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #2e7d32;
}

/* Контейнер для данных */
.display-data-container {
  max-width: 900px;
  margin: 120px auto 0;
  padding: 20px;
  background-color: rgba(107, 151, 193, 0.2);
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* Элемент данных */
.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: rgba(240, 240, 240, 0.9);
  border-radius: 5px;
  margin-bottom: 10px;
}

.data-item label {
  font-weight: bold;
  color: #2c3e50;
  flex: 1;
}

.data-item span {
  color: #555;
  flex: 2;
  text-align: right;
}

/* Кнопка удаления */
.btn-delete {
  padding: 12px;
  font-size: 18px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 10px;
}

.btn-delete:hover {
  background-color: #cc0000;
}

.btn-delete:active {
  background-color: #990000;
}
</style>