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
    optimizeDeps: {
      include: [
        '@unhead/schema-org/vue',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: ' '
    }
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/seo'
  ],

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json', flag: '🇺🇸' },
      { code: 'id', name: 'Indonesia', file: 'id.json', flag: '🇮🇩' },
      { code: 'zh', name: '中文', file: 'zh.json', flag: '🇨🇳' },
    ],
    langDir: 'locales', 

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true
    },
  },
  
  site: {
  url: 'http://localhost:3000', // 
  name: 'CMS Template',
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/urls',
    ]
  },

  ogImage: {
    zeroRuntime: true,
  },  
})