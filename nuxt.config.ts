// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    public: {
      apiBase: ' '
    }
  },

  modules: [
    '@nuxtjs/i18n'
  ],

  i18n: {
  strategy: 'no_prefix', 
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    alwaysRedirect: true
  },
  locales: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ],
  }
  
})