<template>
  <div>
    <AppNavbar />
    <div class="add-car-container">
      <h1 class="section-title">Введите данные о транспортном средстве:</h1>
      <form @submit.prevent="handleSubmit">
        <!-- Номерной знак -->
        <div class="input-group">
          <label for="licensePlate">Номерной знак:</label>
          <input
            type="text"
            id="licensePlate"
            v-model="licensePlate"
            placeholder="Пример: А123БВ777"
            required
          />
          <span v-if="!isLicensePlateValid && licensePlate" class="error-message">
            Введите номерной знак в формате: А123БВ777
          </span>
        </div>

        <!-- Серия и номер СТС -->
        <div class="input-group">
          <label for="carSTS">Серия и номер СТС:</label>
          <input
            type="text"
            id="carSTS"
            v-model="carSTS"
            placeholder="Введите 10 цифр"
            required
          />
          <span v-if="!isCarSTSValid && carSTS" class="error-message">
            СТС должен содержать 10 цифр
          </span>
        </div>

        <!-- Количество мест -->
        <div class="input-group">
          <label for="seats">Количество мест:</label>
          <input
            type="number"
            id="seats"
            v-model.number="seats"
            placeholder="Введите количество мест"
            min="1"
            max="10"
            required
          />
          <span v-if="!isSeatsValid && seats" class="error-message">
            Количество мест должно быть от 1 до 10
          </span>
        </div>
       <!-- Чекбокс подтверждения -->
        <div class="confirmation-checkbox">
          <input
            type="checkbox"
            id="confirmation"
            v-model="isConfirmed"
            required
          />
          <label for="confirmation">
            Я подтверждаю, что все данные указаны верно и соответствуют действительности
          </label>
        </div>

        <button 
          type="submit" 
          class="btn-login"
          :disabled="!isConfirmed"
        >
          Добавить транспортное средство
        </button>
      </form>
    </div>
    <img src="/машина.webp" alt="Машина" class="car-image" />
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import { useToast } from "vue-toastification"; // Для уведомлений
import axios from "axios"; // Импортируем axios для запросов на сервер
import Cookies from "js-cookie"; // Импортируем библиотеку для работы с кукисами

export default {
  components: {
    AppNavbar,
  },
  setup() {
    const toast = useToast(); // Инициализируем уведомления
    return { toast };
  },
  data() {
    return {
      licensePlate: "", // Номерной знак (номер + регион)
      carSTS: "", // Серия и номер СТС
      seats: null, // Количество мест
    };
  },
  computed: {
    // Валидация номерного знака (слитно, без пробела)
    isLicensePlateValid() {
      const regex = /^[АВЕКМНОРСТУХ]{1}\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/; // Формат: А123ВЕ777
      return regex.test(this.licensePlate);
    },

    // Валидация СТС
    isCarSTSValid() {
      const regex = /^\d{10}$/; // Формат: 10 цифр
      return regex.test(this.carSTS);
    },

    // Валидация количества мест
    isSeatsValid() {
      return this.seats >= 1 && this.seats <= 10;
    },
  },
  methods: {
    handleSubmit() {
      // Проверка валидности данных
      if (!this.isLicensePlateValid || !this.isCarSTSValid || !this.isSeatsValid) {
        this.toast.error("Пожалуйста, проверьте введенные данные.");
        return;
      }

      // Если данные валидны, сохраняем и переходим на следующий этап
      this.saveVehicleData();
    },

    // Метод для сохранения данных на сервере
    async saveVehicleData() {
  const vehicleData = {
    mark: Cookies.get("mark"),
    brand: Cookies.get("model"),
    color: Cookies.get("color"),
    car_number: this.licensePlate,
    sts_number: this.carSTS,
    seats: this.seats, // Добавляем количество мест
  };

  try {
    // Отправка данных на сервер
    const response = await axios.post(
      "http://localhost:5000/api/car/create", // Замените на ваш URL
      vehicleData,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // Токен авторизации
        },
      }
    );

    // Логирование ответа сервера
    console.log("Ответ сервера:", response.data);

    // Обработка успешного ответа
    if (response.data.success) {
      this.toast.success(response.data.message); // Используем сообщение от сервера
      this.$router.push("/personal-information"); // Перенаправление на следующую страницу
    } else {
      this.toast.error("Ошибка при сохранении данных: " + response.data.message);
    }
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    if (error.response) {
      // Сервер вернул ответ с ошибкой
      console.error("Данные ответа сервера:", error.response.data);
      console.error("Статус ответа:", error.response.status);
      console.error("Заголовки ответа:", error.response.headers);

      // Отображение сообщения об ошибке
      if (error.response.data.message) {
        this.toast.error(error.response.data.message);
      } else {
        this.toast.error("Ошибка при сохранении данных. Попробуйте снова.");
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен
      console.error("Запрос был отправлен, но ответ не получен:", error.request);
      this.toast.error("Ошибка сети. Проверьте подключение к интернету.");
    } else {
      // Ошибка при настройке запроса
      console.error("Ошибка при настройке запроса:", error.message);
      this.toast.error("Ошибка при настройке запроса. Попробуйте снова.");
    }
  }
},
  },
};
</script>

<style scoped>
.add-car-container {
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

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
  display: block;
  text-align: left;
}
.confirmation-checkbox {
  margin: 20px 0;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 0 5%;
}

.confirmation-checkbox input {
  width: auto;
  margin-right: 10px;
}

.confirmation-checkbox label {
  font-size: 14px;
  margin-bottom: 0;
  cursor: pointer;
}

.btn-login:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>