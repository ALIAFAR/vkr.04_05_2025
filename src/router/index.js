import { createRouter, createWebHistory } from "vue-router";
import RegistrationChoice from "@/views/RegistrationChoice.vue"; // Страница выбора регистрации
import UserDetails from "@/views/UserDetails.vue"; // Страница ввода данных пользователя
import Login from "@/views/UserLogin.vue"; // Страница входа
import PublishTrip from "@/views/PublishTrip.vue"; // Страница публикации поездки
import SearchTrip from "@/views/SearchTrip.vue"; // Страница поиска поездок
import HomePage from "@/views/HomePage.vue"; // Главная страница
import UserProfile from "@/views/UserProfile.vue"; // Страница профиля
import DateSelection from "@/views/DateSelection.vue"; // Импорт компонента выбора даты
import PickUpTime from "@/views/PickUpTime.vue"; // Страница выбора времени забора пассажиров
import ArrivalTime from "@/views/ArrivalTime.vue"; // Страница выбора времени прибытия
import PriceInput from "@/views/PriceInput.vue"; // Страница установки цены
import BaggAge from "@/views/BaggAge.vue"; // Страница с выбором багажа
import CommentConfirmation from "@/views/CommentConfirmation.vue";
import MyTrips from "@/views/MyTrips.vue"; // Импортируем новый компонент
import ArrivalDate from "@/views/ArrivalDate.vue"; // Импортируем новый компонент
import ProfilePage from "@/views/ProfilePage.vue"; // Страница профиля (если это отдельный компонент)
import ChatsMy from "@/views/ChatsMy.vue";
import SelectCarManufacturer from "@/views/SelectCarManufacturer.vue";
import MarkaCar from '@/views/MarkaCar.vue';
import ChooseColorPage from '@/views/ChooseColorPage.vue'; // Импорт компонента
import AddCar from "@/views/AddCar.vue";
import PersonalInformation from '@/views/PersonalInformation.vue';
import EditData from '@/views/EditData.vue';
import TripBooking from "@/views/TripBooking.vue"; // Страница бронирования
import SearchResults from '@/views/SearchResults.vue'; // Импортируем компонент
import ChatPage from "@/views/ChatPage.vue"; // Импортируем компонент страницы чата
import StopsSelection from "@/views/StopsSelection.vue"; // Импортируем компонент выбора остановок
import PassengerCount from '@/views/PassengerCount.vue';
import CarSelection from '@/views/CarSelection.vue'; // Импортируем компонент выбора машин
import BookingType from '@/views/BookingType.vue';
import SetPassword from '@/views/SetPassword.vue'; // Импортируем компонент страницы смены пароля
import OperatorPanel from '@/views/OperatorPanel.vue';
import EditDriverLicense from "@/views/EditDriverLicense.vue";
import NotificationsPage from '@/views/NotificationsPage.vue'; // Импортируйте ваш компонент
import UserVerification from "@/views/UserVerification.vue";
import CarVerification from "@/views/CarVerification.vue"; // Страница проверки автомобилей
  

const routes = [
  { path: "/", name: "HomePage", component: HomePage }, // Главная страница
  { path: "/publish-trip", name: "publish-trip-page", component: PublishTrip }, // Страница публикации поездки
  { path: "/search", name: "search", component: SearchTrip }, // Страница поиска поездок
  { path: "/user-profile", name: "user-profile-page", component: UserProfile }, // Страница профиля
  { path: "/pick-up-time", name: "PickUpTime", component: PickUpTime }, // Страница выбора времени забора пассажиров
  { path: "/arrival-time", name: "ArrivalTime", component: ArrivalTime }, // Страница выбора времени прибытия
  { path: "/price", name: "price-input-page", component: PriceInput }, // Страница установки цены
  { path: "/baggage", name: "baggage-page", component: BaggAge }, // Страница с выбором багажа
  { path: "/my-trips", name: "my-trips-page", component: MyTrips }, // Страница "Мои поездки"
  {path: "/chat", name: "chat", component: ChatsMy,},
  { path: "/booking", name: "booking-page", component: TripBooking }, // Новый маршрут для бронирования
  {
    path: "/arrival-date",  // путь для страницы выбора даты прибытия
    name: "ArrivalDate",  // имя маршрута
    component: ArrivalDate,  // компонент для страницы
  },
  {
    path: "/edit-driver-license",
    name: "EditDriverLicense",
    component: EditDriverLicense,
  },
  {
    path: '/car-selection',
    name: 'CarSelection',
    component: CarSelection,
  },
  {
    path: "/operator-panel",
    name: "OperatorPanel",
    component:OperatorPanel,
  },
  {
    path: "/car-verification",
    name: "CarVerification",
    component: CarVerification,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsPage
  },
  {
    path: "/user-verification", // Новый путь для страницы проверки пользователей
    name: "UserVerification",
    component: UserVerification,
  },
  {
    path: '/set-password',
    name: 'SetPassword',
    component: SetPassword,
  },
  {
    path: '/passenger-count',
    name: 'PassengerCount',
    component: PassengerCount,
  },
  {
    path: "/stops-selection",
    name: "stops-selection",
    component: StopsSelection,
  },
  {
    path: '/booking-type',
    name: 'BookingType',
    component: BookingType,
  },
  {
    path: '/search-results', // Путь для страницы с результатами поиска
    name: 'search-results', // Имя маршрута
    component: SearchResults, // Компонент для отображения
  },
  {
    path: '/personal-information',
    name: 'PersonalInformation',
    component: PersonalInformation,
  },
  {
    path: "/edit-data",
    name: "EditData",
    component: EditData,
  },
  {
    path: '/add-car',
    name: 'AddCar',
    component: AddCar, // Указываем компонент для маршрута
  },
  {
    path: "/select-car-manufacturer",
    name: "SelectCarManufacturer",
    component: SelectCarManufacturer,
  },{

  path: '/marka-car',
  name: 'MarkaCar',
  component: MarkaCar
},
{
  path: '/choose-color',
  name: 'ChooseColor',
  component: ChooseColorPage, // Указание компонента для маршрута
},

  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
  },
  {
    
    path: "/price-input",
    name: "PriceInput",
    component: PriceInput,
  },
  {
    path: "/chat/:id", // Динамический параметр :id
    name: "ChatPage",
    component: ChatPage,
  },
  {
      path: "/date-selection",
      name: "DateSelection",
      component: DateSelection // Компонент выбора даты
    },
  {
    path: "/registration-choice", // Путь для страницы выбора регистрации
    name: "RegistrationChoice",
    component: RegistrationChoice,
  },
  {
    path: "/baggage",
    name: "BaggAge", // Убедитесь, что имя маршрута совпадает с тем, что используется в коде
    component: BaggAge,
  },
  {
    path: "/comment-confirmation",
    name: 'CommentConfirmation',
    component: CommentConfirmation,
  }, // Страница подтверждения комментариев
  {
    path: "/date-selection",
    name: "date-selection-page",
    component: DateSelection,
  }, // Страница выбора даты
  {
    path: "/registration",
    name: "registration-choice-page",
    component: RegistrationChoice,
  }, // Страница выбора регистрации
  { path: "/user-details", name: "user-details-page", component: UserDetails }, // Страница ввода данных пользователя
  { path: "/login", name: "login-page", component: Login }, // Страница входа
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
