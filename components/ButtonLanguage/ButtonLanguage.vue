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
      class="flex items-center gap-1 text-[14px] font-medium uppercase tracking-wider border border-gray-300 rounded-full px-4 py-1 text-[#555555] hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer"
    >
      {{ locale }}
      <svg
        class="h-3 w-3 opacity-50 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-1 min-w-[70px] bg-white dark:bg-zinc-900 shadow-sm rounded-md z-50 overflow-hidden"
    >
      <button
        v-for="lang in locales"
        :key="lang.code"
        @click="select(lang.code)"
        class="w-full text-left px-3 py-1.5 text-[12px] uppercase hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        :class="locale === lang.code ? 'text-black dark:text-white font-bold' : 'text-gray-500 dark:text-zinc-400'"
      >
        {{ lang.code }}
      </button>
    </div>
  </div>
</template>