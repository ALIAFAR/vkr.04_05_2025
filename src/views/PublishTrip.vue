<template>
  <div class="publish-trip">
    <AppNavbar />
    <div class="container">
      <h2 class="title">Построение маршрута с остановками</h2>

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
              class="uni-input"
            />
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
              class="uni-input"
            />
            <ul v-if="point.suggestions.length && point.showSuggestions" class="suggestions">
              <li v-for="(item, idx) in point.suggestions" :key="idx" @click="selectSuggestion(item, index + 1)">
                {{ item }}
              </li>
            </ul>
          </div>
          <button class="remove-point uni-btn-icon" @click="removePoint(index)">×</button>
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
              class="uni-input"
            />
            <ul v-if="points[points.length - 1].suggestions.length && points[points.length - 1].showSuggestions" class="suggestions">
              <li v-for="(item, index) in points[points.length - 1].suggestions" :key="index" @click="selectSuggestion(item, points.length - 1)">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="controls">
        <button @click="addPoint" class="add-point uni-btn-secondary">
          <i class="icon-plus"></i> Добавить остановку
        </button>
        <button @click="buildRoute" :disabled="!isRouteValid" class="uni-btn-primary">
          Построить маршрут
        </button>
        <button @click="goToDateSelection" :disabled="!routeBuilt" class="uni-btn-success">
          Перейти к выбору даты <i class="icon-arrow-right"></i>
        </button>
      </div>

      <div id="info" class="info-box"></div>
      <div id="map" class="map-container"></div>
    </div>
  </div>
</template>

<script setup>
/* глобальный код остаётся без изменений */
</script>

<style scoped>
.publish-trip {
  padding: 80px 20px 40px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.route-points {
  margin-bottom: 30px;
}

.point-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
  position: relative;
}

.point-label {
  min-width: 150px;
  font-weight: 500;
  color: #34495e;
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
}

.uni-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.uni-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
  background-color: white;
}

.suggestions {
  position: absolute;
  z-index: 100;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  width: calc(100% - 4px);
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: -2px 0 0 0;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestions li {
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f1f1;
}

.suggestions li:last-child {
  border-bottom: none;
}

.suggestions li:hover {
  background-color: #3498db;
  color: white;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 30px;
}

.uni-btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uni-btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.uni-btn-primary:disabled {
  background-color: #bdc3c7;
  transform: none;
  cursor: not-allowed;
}

.uni-btn-secondary {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.uni-btn-secondary:hover {
  background-color: #e9ecef;
  border-color: #d0d0d0;
  transform: translateY(-1px);
}

.uni-btn-success {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.uni-btn-success:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.uni-btn-success:disabled {
  background-color: #95a5a6;
  transform: none;
  cursor: not-allowed;
}

.uni-btn-icon {
  background: none;
  border: none;
  font-size: 22px;
  color: #e74c3c;
  cursor: pointer;
  padding: 0 12px;
  transition: all 0.2s;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uni-btn-icon:hover {
  background-color: #f8d7da;
  transform: scale(1.1);
}

.map-container {
  width: 100%;
  height: 400px;
  margin: 20px 0;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-box {
  margin: 20px 0;
  font-size: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  color: #2c3e50;
  line-height: 1.6;
}

.icon-plus:before {
  content: "+";
}

.icon-arrow-right:before {
  content: "→";
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  
  .point-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .point-label {
    min-width: auto;
    width: 100%;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .controls button {
    width: 100%;
  }
}
</style>