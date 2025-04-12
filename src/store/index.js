import { createStore } from 'vuex';
import axios from 'axios';

const store = createStore({
  state: {
    trips: [],
    error: "", // Для хранения ошибок
    isLoading: false, // Для отслеживания загрузки данных
  },
  mutations: {
    setTrips(state, trips) {
      state.trips = trips;
    },
    setError(state, errorMessage) {
      state.error = errorMessage;
    },
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
  },
  actions: {
    async fetchTrips({ commit }) {
      commit("setLoading", true); // Устанавливаем статус загрузки
      commit("setError", ""); // Очищаем предыдущие ошибки

      try {
        // Используем переменную окружения для URL
        const response = await axios.get(
          process.env.VUE_APP_API_URL + "/api/trips"
        );
        const trips = response.data;
        commit("setTrips", trips);
      } catch (error) {
        console.error("Ошибка при загрузке поездок:", error);
        commit("setError", "Не удалось загрузить поездки. Попробуйте позже.");
      } finally {
        commit("setLoading", false); // Завершаем загрузку
      }
    },
  },
  getters: {
    allTrips: (state) => state.trips,
    isLoading: (state) => state.isLoading,
    errorMessage: (state) => state.error,
  },
});

export default store;
