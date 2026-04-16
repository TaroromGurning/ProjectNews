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
  <div class="inline-flex items-center gap-0.5 p-0.75 bg-gray-100 dark:bg-zinc-800 border border-gray-200/60 dark:border-zinc-700/60 rounded-[10px]">
    <button
      v-for="lang in activeLocales"
      :key="lang.code"
      @click="changeLang(lang.code)"
      class="relative flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-[7px] transition-all duration-150 select-none"
      :class="[
        locale === lang.code
          ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-200/60 dark:border-zinc-700/60'
          : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/50'
      ]"
    >
      <span
        v-if="locale === lang.code"
        class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"
      />
      <span v-if="lang.flag">{{ lang.flag }}</span>
      <span class="tracking-wide">{{ lang.code.toUpperCase() }}</span>
    </button>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>