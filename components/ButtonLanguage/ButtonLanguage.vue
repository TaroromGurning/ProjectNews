<script setup>
const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)
const dropdownRef = ref(null)

// Menutup dropdown jika klik di luar
const close = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) isOpen.value = false
}

onMounted(() => window.addEventListener('click', close))
onUnmounted(() => window.removeEventListener('click', close))

const select = async (code) => {
  await setLocale(code)
  isOpen.value = false
}
</script>

<template>
  <div class="relative inline-block" ref="dropdownRef">
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-gray-500 hover:text-gray-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
    >
      {{ locale }}
      <span class="text-[9px] opacity-60">▼</span>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-1 min-w-[70px] bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-sm rounded-md z-50 overflow-hidden"
    >
      <button
        v-for="lang in locales"
        :key="lang.code"
        @click="select(lang.code)"
        class="w-full text-left px-3 py-1.5 text-[10px] uppercase hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        :class="locale === lang.code ? 'text-black dark:text-white font-bold' : 'text-gray-500 dark:text-zinc-400'"
      >
        {{ lang.code }}
      </button>
    </div>
  </div>
</template>