import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

// Подключаем роутер и store
app.use(router);
app.use(store);

// Монтируем приложение в элемент с id="app"
app.mount('#app');