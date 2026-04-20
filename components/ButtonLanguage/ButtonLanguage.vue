<script setup>
const { setLocale, locale, } = useI18n()
const { activeLocales } = useActiveLocales()

const changeLang = async (code) => {
  if (locale.value === code) return
  
  try {
    await setLocale(code)
  } catch (error) {
    console.error('Error changing language:', error)
  }
} 
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="(lang, index) in activeLocales"
      :key="lang.code"
      @click="changeLang(lang.code)"
      class="flex items-center transition-colors duration-200 select-none cursor-pointer group"
    >
      <span 
        class="text-[11px] font-medium uppercase tracking-wider"
        :class="[
          locale === lang.code
            ? 'text-gray-900 dark:text-white font-bold'
            : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
        ]"
      >
        {{ lang.code }}
      </span>

      <span v-if="index < activeLocales.length - 1" class="mx-2 text-gray-300 dark:text-zinc-700 text-[10px]">
        |
      </span>
    </button>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>