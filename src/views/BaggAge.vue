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
/* Container styling with modern gradient and responsive padding */
.baggage-container {
  text-align: center;
  padding: 2.5rem 1.5rem;
  max-width: 40rem;
  margin: 7rem auto 2rem;
  background: linear-gradient(135deg, rgba(200, 220, 255, 0.2) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 1rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Title styling with improved typography */
.baggage-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a2a44;
  line-height: 1.2;
}

/* General text styling for paragraphs */
p {
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 1.25rem;
}

/* Radio button container styling */
.baggage-options,
.oversized-baggage,
.child-seat,
.animals {
  margin-bottom: 2rem;
}

/* Radio button label styling with better spacing and interaction */
.baggage-options label,
.oversized-baggage label,
.child-seat label,
.animals label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: #2d3748;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

/* Highlight selected radio button */
input[type="radio"]:checked + span {
  font-weight: 500;
  color: #0056b3;
}

/* Style radio buttons */
input[type="radio"] {
  accent-color: #0056b3;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

/* Textarea styling with improved focus and responsiveness */
.comment-textarea {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
  resize: vertical;
  transition: all 0.3s ease;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Focus state for textarea */
.comment-textarea:focus {
  border-color: #0056b3;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.2);
}

/* Button styling with modern gradient and hover effects */
button {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  background: linear-gradient(90deg, #0056b3 0%, #007bff 100%);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Disabled button state */
button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
}

/* Button hover and active states */
button:hover:not(:disabled) {
  background: linear-gradient(90deg, #003d80 0%, #0056b3 100%);
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Improved fade transition for textareas */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive design for smaller screens */
@media (max-width: 600px) {
  .baggage-container {
    padding: 1.5rem 1rem;
    margin: 5rem auto 1rem;
  }

  .baggage-title {
    font-size: 1.75rem;
  }

  p {
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 0.75rem;
  }
}
</style>