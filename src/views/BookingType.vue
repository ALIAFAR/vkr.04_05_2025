<template>
  <AppNavbar />
  <div class="booking-type-container">
    <h1 class="section-title">Выберите тип бронирования</h1>
    <p>Как вы хотите, чтобы ваша поездка бронировалась?</p>
    <div class="booking-options">
      <label>
        <input type="radio" v-model="bookingType" value="instant" /> Мгновенное бронирование
      </label>
      <label>
        <input type="radio" v-model="bookingType" value="confirmation" /> Бронирование с подтверждением
      </label>
    </div>
    <button @click="submitBookingType" :disabled="isSubmitting">
      {{ isSubmitting ? 'Подтверждение...' : 'Подтвердить' }}
    </button>
  </div>
  <div v-if="isPublished" class="confirmation-message">
    <h2>Поездка успешно опубликована!</h2>
    <p>Спасибо за использование нашего сервиса.</p>
    <button @click="goHome">На главную</button>
  </div>
</template>

<script>
import AppNavbar from "@/components/AppNavbar.vue";
import axios from 'axios';
import Cookies from 'js-cookie';

export default {
  components: {
    AppNavbar,
  },
  data() {
    return {
      bookingType: null,
      isSubmitting: false,
      isPublished: false
    };
  },
  created() {
    const tripData = Cookies.get("tripData");
    if (!tripData) {
      this.$router.push({ name: "CommentConfirmation" });
    }
  },
  methods: {
    async submitBookingType() {
      if (!this.bookingType) {
        alert("Пожалуйста, выберите тип бронирования!");
        return;
      }

      this.isSubmitting = true;

      const tripData = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : {};
      const stopsCount = Cookies.get("stops_count") || 0;
      const stops = [];
      for (let i = 1; i <= stopsCount; i++) {
        const stop = Cookies.get(`stop_${i}`);
        if (stop) stops.push(stop);
      }

      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Токен не найден.");

        console.log("вы охуели")
        console.log(tripData)
        
        // Создаем маршрут
        const routeResponse = await axios.post("https://unigo.onrender.com/api/route/route", {
          from: Cookies.get("from_route"),
          to: Cookies.get("to_route"),
        });
        const routeId = routeResponse.data.routeId;

        console.log("вы охуели")
        console.log(Cookies.get("from_route"),Cookies.get("to_route"))

        // Создаем поездку
        console.log("check 2")
        const tripResponse = await axios.post("https://unigo.onrender.com/api/trip/trip", {
          route_id: routeId,
          departureDate: tripData.date,
          departureTime: tripData.pickUpTime,
          //arrivalDate: tripData.arrivalDate,
          arrivalTime: Cookies.get("trip_time"),
          passengersCount: tripData.passengerCount,
          car: tripData.selectedCar,
          price: tripData.price,
          oversizedLuggageComment: tripData.baggage?.hasOversizedBaggage === "yes" ? tripData.baggage.oversizedBaggageComment : "",
          childSeatComment: tripData.baggage?.needsChildSeat === "yes" ? tripData.baggage.childSeatComment : "",
          animalsComment: tripData.baggage?.canTakeAnimals === "yes" ? tripData.baggage.animalsComment : "",
          tripComment: tripData.comment,
          bookingType: this.bookingType,
          canTakeBaggage: tripData.baggage.canTakeBaggage,
          hasOversizedBaggage: tripData.baggage.hasOversizedBaggage,
          needsChildSeat: tripData.baggage.needsChildSeat,
          canTakeAnimals: tripData.baggage.canTakeAnimals,
        }, { headers: { Authorization: `Bearer ${token}` } });
        const tripId = tripResponse.data.tripId;

        console.log("check 3")

        // Создаем остановки
        for (const stop of stops) {
          await axios.post("https://unigo.onrender.com/api/stop/stop", {
            arrival_location: stop,
            trip_id: tripId,
          });
        }

        this.isPublished = true;
        console.log("remove")
        Cookies.remove("tripData");
        Cookies.remove("from_route")
        Cookies.remove("to_route")
        console.log("remove")
        for (let i = 1; i <= stopsCount; i++) {
          Cookies.remove(`stop_${i}`);
        }
        Cookies.remove("stops_count");
      } catch (error) {
        console.error("Ошибка при публикации поездки:", error);
        alert(`Ошибка при публикации: ${error.response ? error.response.data : error.message}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    goHome() {
      this.$router.push("/");
    }
  },
};
</script>


<style scoped>
.booking-type-container {
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

.booking-options label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
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

.confirmation-message {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
}
</style>