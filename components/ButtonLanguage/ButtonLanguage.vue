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
  <div class="flex items-center gap-0.5 p-0 sm:p-0.75 bg-transparent sm:bg-gray-100 sm:dark:bg-zinc-800 sm:border sm:border-gray-200/60 sm:dark:border-zinc-700/60 sm:rounded-[10px]">
    <button
      v-for="lang in activeLocales"
      :key="lang.code"
      @click="changeLang(lang.code)"
      class="relative flex items-center gap-1.5 transition-all duration-150 select-none px-1 py-2 sm:px-3.5 sm:py-1.5"
      :class="[
        locale === lang.code
          ? 'text-gray-900 dark:text-white sm:bg-white sm:dark:bg-zinc-900 sm:rounded-[7px] sm:border sm:border-gray-200/60 sm:dark:border-zinc-700/60'
          : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
      ]"
    >
      <span 
        v-if="locale === lang.code"
        class="absolute -bottom-1 left-1 right-1 h-0.5 bg-blue-500 rounded-full sm:hidden"
      />
      <span
        v-if="locale === lang.code"
        class="hidden sm:block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"
      />
      <span v-if="lang.flag" class="hidden sm:block">{{ lang.flag }}</span>
      <span class="text-[10px] sm:text-[14px] font-bold tracking-widest uppercase">{{ lang.code }}</span>
    </button>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>