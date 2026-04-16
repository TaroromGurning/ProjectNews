export default defineNuxtPlugin({
  name: 'dynamic-i18n',
  parallel: false,
  async setup(nuxtApp) {
    const i18n = nuxtApp.$i18n as any;

    try {
      const response: any = await $fetch('https://api.jovanews.kotasatelit.com/api/v1/languages');
      const apiLanguages = response?.data?.language || [];

      const availableCodes = apiLanguages.map((l: any) => l.code.toLowerCase());

      const uniqueCodes = [...new Set(availableCodes)];

      const currentLocale = i18n.locale.value;

      if (!uniqueCodes.includes(currentLocale.toLowerCase())) {
        console.warn(`Bahasa ${currentLocale} tidak tersedia di API.`);
      }

    } catch (e: any) {
      console.error("Gagal sinkronisasi bahasa dari API:", e.message || e);
    }
  }
});