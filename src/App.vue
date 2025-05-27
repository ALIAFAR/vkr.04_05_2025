<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }" class="font-sans min-h-screen">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isDarkTheme() {
      return this.$store?.state?.theme?.isDarkTheme ?? false;
    }
  },
  watch: {
    isDarkTheme(newVal) {
      this.applyTheme(newVal);
    }
  },
  mounted() {
    // Применяем текущую тему при загрузке
    this.applyTheme(this.isDarkTheme);
    
    // Слушаем изменения системной темы
    this.setupSystemThemeListener();
  },
  beforeUnmount() {  // Исправлено с beforeDestroy на beforeUnmount
    this.removeSystemThemeListener();
  },
  methods: {
    applyTheme(isDark) {
      document.documentElement.classList.toggle('dark-theme', isDark);
      
      // Также можно обновлять meta-тег для theme-color
      const themeColor = isDark ? '#121212' : '#ffffff';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    },
    setupSystemThemeListener() {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._handleThemeChange = (e) => {
        if (this.$store) {
          this.$store.commit('theme/setTheme', e.matches);
        }
        this.applyTheme(e.matches);
      };
      darkModeMediaQuery.addEventListener('change', this._handleThemeChange);
      this._darkModeMediaQuery = darkModeMediaQuery;
    },
    removeSystemThemeListener() {
      if (this._darkModeMediaQuery && this._handleThemeChange) {
        this._darkModeMediaQuery.removeEventListener('change', this._handleThemeChange);
      }
    }
  }
};
</script>

<style>
:root {
  /* Light theme variables */
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #1976d2;
  --secondary-color: #424242;
  --accent-color: #82b1ff;
  --error-color: #ff5252;
  --info-color: #2196f3;
  --success-color: #4caf50;
  --warning-color: #ffc107;
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --input-border: #dddddd;
  --dropdown-bg: #ffffff;
  --border-color: #f0f0f0;
  --hover-color: rgba(0, 0, 0, 0.04);
}

.dark-theme {
  /* Dark theme variables */
  --bg-color: #121212;
  --text-color: #e0e0e0;
  --primary-color: #2196f3;
  --secondary-color: #b0bec5;
  --accent-color: #82b1ff;
  --error-color: #ff5252;
  --info-color: #2196f3;
  --success-color: #4caf50;
  --warning-color: #ffc107;
  --card-bg: #1e1e1e;
  --input-bg: #2d2d2d;
  --input-border: #444444;
  --dropdown-bg: #2d2d2d;
  --border-color: #3d3d3d;
  --hover-color: rgba(255, 255, 255, 0.04);
}

#app {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Пример стилей для других элементов */
.card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

button {
  background-color: var(--primary-color);
  color: white;
}

input, textarea, select {
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
}
</style>