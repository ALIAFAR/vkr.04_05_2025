<template>
  <div>
    <AppNavbar />
    <div class="details-container">
      <!-- Основной контент -->
      <div class="form-container">
        <h2>Введите ваши данные</h2>
        <form class="details-form" @submit.prevent="handleSubmit">
          <!-- Фамилия -->
          <div class="input-group">
            <label for="lastName">Фамилия</label>
            <input
              type="text"
              id="lastName"
              placeholder="Введите вашу фамилию"
              class="input-field"
              v-model="userData.lastName"
              required
              readonly
            />
          </div>
          <!-- Имя -->
          <div class="input-group">
            <label for="firstName">Имя</label>
            <input
              type="text"
              id="firstName"
              placeholder="Введите ваше имя"
              class="input-field"
              v-model="userData.firstName"
              required
              readonly
            />
          </div>
          <!-- Отчество -->
          <div class="input-group">
            <label for="middleName">Отчество</label>
            <input
              type="text"
              id="middleName"
              placeholder="Введите ваше отчество"
              class="input-field"
              v-model="userData.middleName"
              readonly
            />
          </div>
          <!-- Дата рождения -->
          <div class="input-group">
            <label for="dob">Дата рождения</label>
            <input
              type="date"
              id="dob"
              class="input-field"
              v-model="userData.dob"
              required
            />
          </div>
          <!-- Пол -->
          <div class="input-group">
            <label for="gender">Пол</label>
            <select
              id="gender"
              class="input-field"
              v-model="userData.gender"
              required
            >
              <option value="" disabled>Выберите пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          <!-- Номер телефона -->
          <div class="input-group">
            <label for="phoneNumber">Номер телефона</label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="+7XXXXXXXXXX"
              class="input-field"
              v-model="userData.phoneNumber"
              pattern="\+7\d{10}"
              inputmode="numeric"
              required
            />
          </div>
          <!-- Отдел -->
          <div class="input-group">
            <label for="department">Отдел</label>
            <input
              type="text"
              id="department"
              placeholder="Введите ваш отдел"
              class="input-field"
              v-model="userData.department"
              required
              readonly
            />
          </div>
          <!-- Должность -->
          <div class="input-group">
            <label for="position">Должность</label>
            <input
              type="text"
              id="position"
              placeholder="Введите вашу должность"
              class="input-field"
              v-model="userData.position"
              required
              readonly
            />
          </div>
          
          <!-- Чекбоксы согласия -->
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="dataProcessing"
                v-model="consent.dataProcessing"
                required
              />
              <label for="dataProcessing">
                Я даю согласие на обработку моих персональных данных
              </label>
            </div>
            <div class="checkbox-item">
              <input
                type="checkbox"
                id="dataAccuracy"
                v-model="consent.dataAccuracy"
                required
              />
              <label for="dataAccuracy">
                Подтверждаю, что все данные соответствуют действительности
              </label>
            </div>
          </div>
          
          <button type="submit" class="btn-submit">Завершить</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import AppNavbar from "@/components/AppNavbar.vue";
import axios from "axios";
import { onMounted, reactive } from "vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";

export default {
  components: {
    AppNavbar,
  },
  name: "UserDetails",
  setup() {
    const toast = useToast();
    const router = useRouter();

    // Данные пользователя
    const userData = reactive({
      lastName: "",
      firstName: "",
      middleName: "",
      dob: "",
      gender: "",
      phoneNumber: "",
      department: "",
      position: "",
    });

    // Согласия
    const consent = reactive({
      dataProcessing: false,
      dataAccuracy: false,
    });

    // Метод для получения данных пользователя из базы данных
    const fetchUserData = async () => {
      try {
        const user_id = Cookies.get("user_id");
        if (!user_id) {
          toast.error("ID пользователя не найден в куки!");
          return;
        }

        const response = await axios.get("https://unigo.onrender.com/api/user/get_byFormId", {
          params: { user_id },
        });

        if (response.data) {
          userData.lastName = response.data.surname || "";
          userData.firstName = response.data.name || "";
          userData.middleName = response.data.middlename || "";
          userData.department = response.data.department || "";
          userData.position = response.data.position || "";
        }
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        toast.error("Не удалось загрузить данные пользователя.");
      }
    };

    // Метод для отправки данных
    const handleSubmit = async () => {
      // Проверка заполнения всех обязательных полей
      if (
        !userData.lastName ||
        !userData.firstName ||
        !userData.dob ||
        !userData.gender ||
        !userData.phoneNumber ||
        !userData.department ||
        !userData.position
      ) {
        toast.error("Пожалуйста, заполните все обязательные поля!");
        return;
      }

      // Проверка согласий
      if (!consent.dataProcessing || !consent.dataAccuracy) {
        toast.error("Необходимо дать все согласия для продолжения!");
        return;
      }

      // Получаем данные из куки
      const email = Cookies.get("email");
      const newPassword = Cookies.get("newPassword");
      const user_id = Cookies.get("user_id");

      if (!email || !newPassword || !user_id) {
        toast.error("Данные с предыдущей страницы не найдены!");
        return;
      }

      // Подготавливаем данные для отправки
      const payload = {
        form_id: user_id,
        phone_number: userData.phoneNumber,
        email: email,
        birthday: userData.dob,
        login: email,
        password: newPassword,
        gender: userData.gender === "female" ? 1 : 0,
      };

      try {
        const response = await axios.post("https://unigo.onrender.com/api/user/registration", payload);
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 12 * 60 * 60 * 1000);
        Cookies.set("token", response.data.token, { expires: expirationDate });

        if (response.data.token) {
          toast.success("Регистрация прошла успешно!");
          Cookies.remove("email");
          Cookies.remove("newPassword");
          Cookies.remove("user_id");
          await router.push("/");
        } else {
          toast.error("Ошибка при регистрации: " + response.data.message);
        }
      } catch (error) {
        console.error("Ошибка при отправке данных:", error);
        toast.error("Ошибка при регистрации. Попробуйте снова.");
      }
    };

    onMounted(fetchUserData);

    return {
      toast,
      userData,
      consent,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  background: url("/public/фон.jpg") no-repeat center center fixed;
  background-size: cover;
  font-family: Arial, sans-serif;
}

.details-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: rgba(244, 244, 249, 0.8);
  max-width: 500px;
  margin: 120px auto 0 auto;
}

.form-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin-top: 30px;
  text-align: center;
}

.checkbox-group {
  margin: 20px 0;
  text-align: left;
}

.checkbox-item {
  margin-bottom: 15px;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 10px;
}

.checkbox-item label {
  font-size: 14px;
  cursor: pointer;
}

.btn-submit {
  background-color: #004281;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;
}

.btn-submit:hover {
  background-color:#004281;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>