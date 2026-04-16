export const useActiveLocales = () => {
  const { locales } = useI18n()

  const activeLocales = useState<typeof locales.value>('activeLocales', () => [])
  const loading = ref(false)

  const fetchActiveLocales = async () => {
    loading.value = true
    try {
      const res = await $fetch<{
        status: string
        data: {
          language: { name: string; code: string }[]
        }
      }>('https://api.jovanews.kotasatelit.com/api/v1/languages')

      const activeCodes = [
        ...new Set(
          res.data.language.map(lang => lang.code.toLowerCase())
        )
      ]

      activeLocales.value = locales.value.filter(locale =>
        activeCodes.includes(locale.code.toLowerCase())
      )
    } catch {
      activeLocales.value = locales.value
    } finally {
      loading.value = false
    }
  }

  return { activeLocales, loading, fetchActiveLocales }
}