import { createApp } from 'vue';
import App from './App.vue';
import AppNavbar from './components/AppNavbar.vue'; // Импорт компонента Navbar
import router from './router';
import store from './store';
import Notifications from '@kyvg/vue3-notification';

const app = createApp(App);

// Регистрируем компонент Navbar
app.component('AppNavbar', AppNavbar);

// Подключаем уведомления, роутер и store
app.use(Notifications);
app.use(router);
app.use(store);

// Монтируем приложение в элемент с id="app"
app.mount('#app');