// store/modules/theme.js
export default {
  namespaced: true,
  state: {
    isDarkTheme: localStorage.getItem('darkTheme') === 'true' || 
                (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  },
  mutations: {
    setTheme(state, isDark) {
      state.isDarkTheme = isDark;
      localStorage.setItem('darkTheme', isDark);
    },
    toggleTheme(state) {
      state.isDarkTheme = !state.isDarkTheme;
      localStorage.setItem('darkTheme', state.isDarkTheme);
    }
  }
};