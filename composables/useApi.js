export const useApi = () => {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  return $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        'Accept-Language': locale.value 
      }
    }
  })
}