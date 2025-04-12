<template>
  <AppNavbar />
  <div class="baggage-container">
    <h2 class="baggage-title">Информация о багаже</h2>
    <p>Можно ли будет взять багаж с вами в поездку?</p>
    <div class="baggage-options">
      <label>
        <input type="radio" v-model="canTakeBaggage" value="yes" /> Да
      </label>
      <label>
        <input type="radio" v-model="canTakeBaggage" value="no" /> Нет
      </label>
    </div>

    <div class="oversized-baggage">
      <p>У вас есть возможность перевозить велосипед или другой негабаритный багаж?</p>
      <label>
        <input type="radio" v-model="hasOversizedBaggage" value="yes" /> Да, есть
      </label>
      <label>
        <input type="radio" v-model="hasOversizedBaggage" value="no" /> Нет
      </label>
      <transition name="fade">
        <textarea
          v-if="hasOversizedBaggage === 'yes'"
          v-model="oversizedBaggageComment"
          placeholder="Добавьте комментарий о негабаритном багаже"
          rows="3"
          class="comment-textarea"
        ></textarea>
      </transition>
    </div>

    <div class="child-seat">
      <p>Есть ли у вас детское кресло?</p>
      <label>
        <input type="radio" v-model="needsChildSeat" value="yes" /> Да
      </label>
      <label>
        <input type="radio" v-model="needsChildSeat" value="no" /> Нет
      </label>
      <transition name="fade">
        <textarea
          v-if="needsChildSeat === 'yes'"
          v-model="childSeatComment"
          placeholder="Добавьте комментарий о детском кресле"
          rows="3"
          class="comment-textarea"
        ></textarea>
      </transition>
    </div>

    <div class="animals">
      <p>Можно ли будет перевозить животных с вами в поездку?</p>
      <label>
        <input type="radio" v-model="canTakeAnimals" value="yes" /> Да
      </label>
      <label>
        <input type="radio" v-model="canTakeAnimals" value="no" /> Нет
      </label>
      <transition name="fade">
        <textarea
          v-if="canTakeAnimals === 'yes'"
          v-model="animalsComment"
          placeholder="Добавьте комментарий о перевозке животных"
          rows="3"
          class="comment-textarea"
        ></textarea>
      </transition>
    </div>

    <button @click="submitBaggage" :disabled="isSubmitting">
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
  data() {
    return {
      canTakeBaggage: null,
      hasOversizedBaggage: null,
      oversizedBaggageComment: "",
      needsChildSeat: null,
      childSeatComment: "",
      canTakeAnimals: null,
      animalsComment: "",
      isSubmitting: false,
    };
  },
  created() {
    const tripData = Cookies.get("tripData");
    if (!tripData) {
      this.$router.push({ name: "PriceInput" });
    }
  },
  methods: {
    submitBaggage() {
      if (!this.canTakeBaggage || !this.hasOversizedBaggage || !this.needsChildSeat || !this.canTakeAnimals) {
        alert("Пожалуйста, ответьте на все вопросы!");
        return;
      }

      this.isSubmitting = true;

      const tripData = Cookies.get("tripData") ? JSON.parse(Cookies.get("tripData")) : {};

      const updatedTrip = {
        ...tripData,
        baggage: {
          canTakeBaggage: this.canTakeBaggage,
          hasOversizedBaggage: this.hasOversizedBaggage,
          oversizedBaggageComment: this.oversizedBaggageComment,
          needsChildSeat: this.needsChildSeat,
          childSeatComment: this.childSeatComment,
          canTakeAnimals: this.canTakeAnimals,
          animalsComment: this.animalsComment,
        },
      };

      Cookies.set("tripData", JSON.stringify(updatedTrip), { expires: 7 });

      setTimeout(() => {
        this.isSubmitting = false;
        this.$router.push({ name: "CommentConfirmation" }).catch((error) => {
          console.error("Ошибка при переходе:", error);
        });
      }, 1000);
    },
  },
};
</script>

<style scoped>
.baggage-container {
  text-align: center;
  padding: 50px 20px;
  max-width: 600px;
  margin: 120px auto 0;
  background-color: rgba(107, 151, 193, 0.299);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.baggage-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.baggage-options label,
.oversized-baggage label,
.child-seat label,
.animals label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
}

.comment-textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  transition: border-color 0.3s, opacity 0.3s, transform 0.3s;
}

.comment-textarea:focus {
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

button:active:not(:disabled) {
  background-color: #002549;
}

/* Анимация для раскрывающихся комментариев */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>