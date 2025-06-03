<template>
  <div class="publish-trip">
    <AppNavbar />
    <h2>Построение маршрута с остановками</h2>

    <div class="route-points">
      <div class="point-wrapper">
        <div class="point-label">Точка отправления:</div>
        <div class="input-wrapper">
          <input 
            v-model="points[0].input" 
            @input="suggest(0)" 
            @focus="points[0].showSuggestions = true" 
            placeholder="Откуда (например, Уфа)"
            @keydown.enter.prevent="handleEnter(0)"
          />

          <div v-if="!isValid(points[0].input)" class="error">
            Введите полный адрес
          </div>

          <ul v-if="points[0].suggestions.length && points[0].showSuggestions" class="suggestions">
            <li v-for="(item, index) in points[0].suggestions" :key="index" @click="selectSuggestion(item, 0)">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div v-for="(point, index) in intermediatePoints" :key="'i'+index" class="point-wrapper">
        <div class="point-label">Остановка {{ index + 1 }}:</div>
        <div class="input-wrapper">
          <input 
            v-model="point.input" 
            @input="suggest(index + 1)" 
            @focus="point.showSuggestions = true" 
            :placeholder="'Остановка ' + (index + 1)"
            @keydown.enter.prevent="handleEnter(index + 1)"
          />

          <div v-if="!isValid(point.input)" class="error">
            Введите полный адрес
          </div>

          <ul v-if="point.suggestions.length && point.showSuggestions" class="suggestions">
            <li v-for="(item, idx) in point.suggestions" :key="idx" @click="selectSuggestion(item, index + 1)">
              {{ item }}
            </li>
          </ul>
        </div>
        <button class="remove-point" @click="removePoint(index)">×</button>
      </div>

      <div class="point-wrapper">
        <div class="point-label">Точка назначения:</div>
        <div class="input-wrapper">
          <input 
            v-model="points[points.length - 1].input" 
            @input="suggest(points.length - 1)" 
            @focus="points[points.length - 1].showSuggestions = true" 
            placeholder="Куда (например, Казань)"
            @keydown.enter.prevent="handleEnter(points.length - 1)"
          />

          <div v-if="!isValid(points[points.length - 1].input)" class="error">
            Введите полный адрес
          </div>

          <ul v-if="points[points.length - 1].suggestions.length && points[points.length - 1].showSuggestions" class="suggestions">
            <li v-for="(item, index) in points[points.length - 1].suggestions" :key="index" @click="selectSuggestion(item, points.length - 1)">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="addPoint" class="add-point">+ Добавить остановку</button>
      <button @click="buildRoute" :disabled="!isRouteValid">Построить маршрут</button>
      <button @click="goToDateSelection" :disabled="!routeBuilt" style="background-color: #4CAF50; color: white;">Перейти к выбору даты</button>
    </div>


    <div id="info" class="info"></div>
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
/* global ymaps */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()

const API_TOKEN = "72a0f8ef0a9e1bd454cf61b1d040c7b875965ed6";
const SUGGESTIONS_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";

const points = ref([
  { input: '', value: '', suggestions: [], showSuggestions: false }, // Start point
  { input: '', value: '', suggestions: [], showSuggestions: false }  // End point
])

let map = null
let multiRoute = null
let ymapsLoaded = ref(false)
const routeBuilt = ref(false) // флаг, что маршрут построен

onMounted(async () => {
  await loadYandexScript()

  window.ymaps.ready(() => {
    ymapsLoaded.value = true
    initMap()
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-wrapper')) {
      points.value.forEach(p => p.showSuggestions = false)
    }
  })
})

const intermediatePoints = computed(() => {
  return points.value.slice(1, -1)
})

const isRouteValid = computed(() => {
  return points.value.every(p => p.value) && points.value.length >= 2
})

function secondsToTimeFormat(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function isValid(value) {
  const hasStreetKeyword = /ул|пер/i.test(value);
  const hasNumber = /\d/.test(value);
  return hasStreetKeyword && hasNumber;
}

function loadYandexScript() {
  return new Promise((resolve, reject) => {
    if (window.ymaps) return resolve()

    const script = document.createElement('script')
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=ee5fb6ea-d714-499a-a904-92c27b3a2074'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function initMap() {
  map = new ymaps.Map("map", {
    center: [55.75, 37.57],
    zoom: 5
  })
}

function addPoint() {
  points.value.splice(points.value.length - 1, 0,
    { input: '', value: '', suggestions: [], showSuggestions: false }
  )
}

function removePoint(index) {
  points.value.splice(index + 1, 1)
}

async function suggest(index) {
  const query = points.value[index].input
  if (query.length < 3) {
    points.value[index].suggestions = []
    points.value[index].value = ''
    return
  }

  try {
    const response = await fetch(SUGGESTIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${API_TOKEN}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query: query,
        count: 5
      })
    })

    const data = await response.json()

    points.value[index].suggestions = data.suggestions.map(suggestion => suggestion.value)
  } catch (error) {
    console.error('Ошибка получения подсказок:', error)
    points.value[index].suggestions = []
  }
}

function selectSuggestion(item, index) {
  points.value[index].input = item
  points.value[index].value = item
  points.value[index].suggestions = []
  points.value[index].showSuggestions = false

  for (let i = 0; i < points.value.length; i++) {
    if (i !== index) {
      points.value[i].suggestions = []
      points.value[i].showSuggestions = false
    }
  }
}

function handleEnter(index) {
  if (points.value[index].suggestions.length > 0) {
    selectSuggestion(points.value[index].suggestions[0], index)
  }
}

function buildRoute() {
  if (!isRouteValid.value) {
    alert("Пожалуйста, заполните все точки маршрута")
    return
  }

  if (!ymapsLoaded.value) {
    alert("Карты ещё загружаются")
    return
  }

  const referencePoints = points.value
    .filter(p => p.value)
    .map(p => p.value)

  if (!multiRoute) {
    multiRoute = new ymaps.multiRouter.MultiRoute({
      referencePoints: referencePoints,
      params: { routingMode: 'auto' }
    }, {
      boundsAutoApply: true,
      wayPointDraggable: true,
      viaPointDraggable: true
    })

    multiRoute.model.events.add("requestsuccess", () => {
      const activeRoute = multiRoute.getActiveRoute()
      if (!activeRoute) {
        alert('Не удалось построить маршрут')
        return
      }

      const bounds = activeRoute.getBounds()
      map.setBounds(bounds)

      const distance = activeRoute.properties.get("distance").value
      const time = activeRoute.properties.get("duration").value

      document.getElementById('info').innerHTML =
        `🛣️ Общее расстояние: ${(distance / 1000).toFixed(1)} км<br>` +
        `🕒 Общее время в пути: ${formatDuration(time)}`

      const tripData = {
        from: points.value[0].value,
        to: points.value[points.value.length - 1].value,
        stops: intermediatePoints.value.map(p => p.value),
        time: secondsToTimeFormat(time).split(".")[0]
      }
        // Сохраняем количество остановок в куки
      const stopsCount = intermediatePoints.value.length;
      Cookies.set("stops_count", stopsCount.toString());


      Cookies.set("from_route",points.value[0].value)
      Cookies.set("to_route",points.value[points.value.length - 1].value)
      intermediatePoints.value.forEach((point, index) => {
        Cookies.set(`stop_${index + 1}`, point.value);
      });
      Cookies.set("trip_time",secondsToTimeFormat(time).split(".")[0])
      Cookies.remove("tripData")
      Cookies.set("tripData", JSON.stringify(tripData), { expires: 7 })
      console.log(Cookies.get("from_route"), Cookies.get("to_route"), Cookies.get("stop"), Cookies.get("trip_time"))
      routeBuilt.value = true
    })

    map.geoObjects.add(multiRoute)
  } else {
    multiRoute.model.setReferencePoints(referencePoints)
  }
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  let result = []
  if (hours > 0) result.push(`${hours} ч`)
  if (minutes > 0) result.push(`${minutes} мин`)

  return result.join(' ') || 'менее минуты'
}

function goToDateSelection() {
  router.push({ path: "/date-selection" })
}
</script>


<style scoped>
.publish-trip {
  padding: 80px 20px 40px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.route-points {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
}

.point-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
  position: relative;
}

.point-label {
  min-width: 140px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
}

input {
  width: 100%;
  padding: 12px 15px;
  font-size: 15px;
  border: 2px solid #e1e5eb;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
  background-color: white;
}

.suggestions {
  position: absolute;
  z-index: 100;
  background: white;
  border: 2px solid #e1e5eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  width: calc(100% - 4px);
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.suggestions li {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.suggestions li:last-child {
  border-bottom: none;
}

.suggestions li:hover {
  background-color: #3b82f6;
  color: white;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
}

button {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.add-point {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.add-point:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

button:not(.add-point):not(.remove-point):not(:disabled):hover {
  transform: translateY(-1px);
}

.remove-point {
  background: transparent;
  color: #ef4444;
  font-size: 22px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-point:hover {
  background-color: #fee2e2;
}

.map {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  border: 2px solid #e1e5eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
}

.info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.6;
}

/* Кнопка построения маршрута */
button:not(.add-point):not(.remove-point) {
  background-color: #3b82f6;
  color: white;
}

/* Кнопка перехода к дате */
button:last-child:not(.remove-point) {
  background-color: #10b981;
}

/* Адаптация под мобильные устройства */
@media (max-width: 768px) {
  .publish-trip {
    padding: 70px 15px 30px;
  }
  
  .route-points {
    padding: 20px;
  }
  
  .point-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .point-label {
    min-width: 100%;
    margin-bottom: 5px;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .controls button {
    width: 100%;
  }
  
  .map {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .publish-trip {
    padding: 60px 10px 20px;
  }
  
  input {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  button {
    padding: 10px 15px;
    font-size: 14px;
  }
  
  .point-label {
    font-size: 14px;
  }
  
  .info {
    font-size: 14px;
    padding: 12px;
  }
}
</style>
