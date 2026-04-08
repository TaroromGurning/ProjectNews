<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const api = useApi()

const { data, pending } = await useAsyncData(
  'footer-categories',
  async () => {
    const res = await api('/categories')
    return res.data
  }
)

const categories = computed(() => data.value?.categories || [])

const openCategory = ref(null)

const toggleCategory = (slug) => {
  openCategory.value = openCategory.value === slug ? null : slug
}

const closeCategory = () => {
  openCategory.value = null
}

const handleWindowClick = () => {
  openCategory.value = null
}

onMounted(() => {
  window.addEventListener('click', handleWindowClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleWindowClick)
})
</script>

<template>
  <footer class="bg-black">
    <div class="container mx-auto py-12 px-4 lg:px-8">
      <div class="flex flex-col lg:flex-row items-center justify-between border-b border-gray-50 text-white pb-4">
        <div class="flex items-center">
          <NuxtLink to="/" class="py-4">
            <h1 class="text-2xl font-inika">CMS Template</h1>
          </NuxtLink>
        </div>

        <div class="flex flex-wrap justify-center items-center gap-4 lg:gap-8 py-4 font-poppins text-sm">
          <div v-for="cat in categories" :key="cat.slug" class="group relative flex items-center shrink-0">
            <template v-if="cat.sub_categories?.length > 0">
              <div class="relative">
                <div class="flex items-center gap-1">
                  <NuxtLink
                    :to="`/category/${cat.slug}`"
                    class="hover:text-blue-600 dark:hover:text-yellow-400 transition capitalize py-1"
                    active-class="text-blue-600 dark:text-yellow-400 font-bold"
                    @click.stop="closeCategory"
                  >
                    {{ cat.name }}
                  </NuxtLink>

                  <button
                    type="button"
                    class="lg:hidden flex items-center justify-center p-1"
                    @click.stop="toggleCategory(cat.slug)"
                    aria-label="Toggle subcategory"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 opacity-60 transition-transform duration-200"
                      :class="{ 'rotate-180': openCategory === cat.slug }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="hidden lg:block h-3 w-3 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div v-show="openCategory === cat.slug" class="lg:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-55 bg-white shadow-xl border border-gray-100 rounded-lg z-100 py-2"
                  @click.stop
                >
                  <NuxtLink
                    v-for="sub in cat.sub_categories"
                    :key="sub.slug"
                    :to="`/category/${sub.slug}`"
                    class="block px-4 py-2 text-sm text-black hover:bg-gray-50 hover:text-blue-600 dark:hover:text-yellow-400 transition"
                    @click="closeCategory"
                  >
                    {{ sub.name }}
                  </NuxtLink>
                </div>

                <div class="hidden lg:group-hover:block absolute top-full left-0 mt-0 bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 rounded-lg min-w-35 z-100 py-2">
                  <NuxtLink
                    v-for="sub in cat.sub_categories"
                    :key="sub.slug"
                    :to="`/category/${sub.slug}`"
                    class="block px-4 py-2 text-xs text-black dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-yellow-400 transition"
                  >
                    {{ sub.name }}
                  </NuxtLink>
                </div>
              </div>
            </template>

            <NuxtLink
              v-else
              :to="`/category/${cat.slug}`"
              class="hover:text-blue-600 dark:hover:text-yellow-400 transition capitalize flex items-center gap-1 py-1"
              active-class="text-blue-600 dark:text-yellow-400 font-bold"
            >
              {{ cat.name }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <p class="text-xs text-gray-400">&copy; 2026 CMS Template. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>