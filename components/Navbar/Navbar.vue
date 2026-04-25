<script setup>
const api = useApi()

const { data } = await useAsyncData('navbar-categories', async () => {
  const res = await api('/categories')
  return res.data
})

const categories = computed(() => data.value?.categories || [])
const openCategory = ref(null)

const toggleCategory = (slug) => {
  openCategory.value = openCategory.value === slug ? null : slug
}

const handleOutsideClick = (event) => {
  const nav = document.querySelector('nav')
  if (nav && !nav.contains(event.target)) {
    openCategory.value = null
  }
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="sticky top-0 w-full z-50 border-b border-gray-200 bg-white dark:bg-slate-950">
    <nav class="w-full">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="flex items-center border-b border-gray-200 justify-between">
          <NuxtLink to="/" class="py-4">
            <h1 class="text-2xl font-inika dark:text-white tracking-tighter">CMS Template</h1>
          </NuxtLink>
          <ButtonLanguage />
        </div>

        <div class="flex items-center gap-6 lg:gap-8 py-4 font-Poppins text-sm dark:text-white overflow-x-auto lg:overflow-visible no-scrollbar whitespace-nowrap relative">
          <NuxtLink to="/" class="hover:text-blue-600 dark:hover:text-yellow-400 transition shrink-0" active-class="text-blue-600 dark:text-yellow-400 font-bold">
            {{ $t('Home') }}
          </NuxtLink>

          <div v-for="cat in categories" :key="cat.slug" class="group relative shrink-0">
            <div v-if="cat.sub_categories?.length > 0" class="relative">
              <button
                type="button"
                class="hover:text-blue-600 dark:hover:text-yellow-400 transition capitalize flex items-center gap-1 py-1"
                @click.stop="toggleCategory(cat.slug)"
              >
                <NuxtLink
                  :to="`/category/${cat.slug}`"
                  class="flex items-center gap-1"
                  active-class="text-blue-600 dark:text-yellow-400 font-bold"
                  @click.stop
                >
                  {{ cat.name }}
                </NuxtLink>

                <svg
                  class="h-3 w-3 opacity-50 transition-transform duration-300"
                  :class="{ 'rotate-180': openCategory === cat.slug }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div 
                :class="[
                  'absolute top-full right-0 mt-0 origin-top-right bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 rounded-lg min-w-40 z-100 py-2 transition-all',
                  openCategory === cat.slug ? 'block! opacity-100 visible' : 'hidden lg:group-hover:block'
                ]"
                @click.stop
              >
                <NuxtLink
                  v-for="sub in cat.sub_categories"
                  :key="sub.slug"
                  :to="`/category/${sub.slug}`"
                  class="block px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-yellow-400 transition"
                  @click="openCategory = null" 
                >
                  {{ sub.name }}
                </NuxtLink>
              </div>

              <div v-if="openCategory === cat.slug" class="lg:hidden fixed left-4 right-4 mt-2 bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-slate-800 rounded-xl py-3 z-50">
                <div class="grid grid-cols-2 gap-2 px-2">
                   <NuxtLink
                    v-for="sub in cat.sub_categories"
                    :key="sub.slug"
                    :to="`/category/${sub.slug}`"
                    class="block px-4 py-3 text-sm bg-gray-50 dark:bg-slate-800/50 rounded-lg transition"
                    @click="openCategory = null"
                  >
                    {{ sub.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <NuxtLink
              v-else
              :to="`/category/${cat.slug}`"
              class="hover:text-blue-600 dark:hover:text-yellow-400 transition capitalize py-1 block"
              active-class="text-blue-600 dark:text-yellow-400 font-bold"
            >
              {{ cat.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (min-width: 1024px) {
  .group:hover .absolute {
    display: block;
    animation: fadeIn 0.2s ease-out;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>