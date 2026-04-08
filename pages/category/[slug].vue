<script setup>
const route = useRoute()
const api = useApi()

const categorySlug = computed(() => String(route.params.slug || ''))
const currentPage = computed(() => {
  const page = Number(route.query.page || 1)
  return Number.isInteger(page) && page > 0 ? page : 1
})

watch(categorySlug, async () => {
  await navigateTo(
    {
      path: route.path,
      query: {}
    },
    { replace: true }
  )
})

const { data, pending, refresh } = await useAsyncData(
  () => `category-${categorySlug.value}-page-${currentPage.value}`,
  async () => {
    const categoryRes = await api(`/categories/${categorySlug.value}`, {
      query: { page: currentPage.value }
    })

    const homeRes = await api('/home')

    if (!categoryRes?.data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kategori tidak ditemukan'
      })
    }

    return {
      category: categoryRes.data,
      popularNews: homeRes?.data?.popular_news || [],
      seo: categoryRes?.data?.seo || {}
    }
  },
  {
    watch: [categorySlug, currentPage]
  }
)

const categoryData = computed(() => data.value?.category || null)
const popularNews = computed(() => data.value?.popularNews || [])

useSeoMeta({
  title: () => data.value?.seo?.meta_title || 'Kategori',
  description: () => data.value?.seo?.meta_description || '',
  ogTitle: () => data.value?.seo?.meta_title || 'Kategori',
  ogImage: () => data.value?.seo?.open_graph_image || ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const totalPages = computed(() => categoryData.value?.posts?.last_page || 1)

const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

const activeJumpIndex = ref(null)
const jumpPageInput = ref('')
const jumpBoxRef = ref(null)
const jumpPageError = ref('')

const closeJumpInput = () => {
  activeJumpIndex.value = null
  jumpPageInput.value = ''
  jumpPageError.value = ''
}

const toggleJumpInput = (event, index) => {
  event.stopPropagation()
  activeJumpIndex.value = activeJumpIndex.value === index ? null : index
  jumpPageInput.value = ''
  jumpPageError.value = ''
}

const changePage = async (page) => {
  const maxPage = totalPages.value

  if (!Number.isInteger(page)) return
  if (page < 1 || page > maxPage) return
  if (page === currentPage.value) {
    closeJumpInput()
    return
  }

  closeJumpInput()

  await navigateTo(
    {
      path: route.path,
      query: page === 1 ? {} : { ...route.query, page }
    },
    { replace: true }
  )

  await refresh()

  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const jumpToPage = async () => {
  const pageNum = Number(jumpPageInput.value)

  if (!Number.isInteger(pageNum)) {
    jumpPageError.value = 'Masukkan angka yang valid'
    return
  }

  if (pageNum < 1 || pageNum > totalPages.value) {
    jumpPageError.value = `Masukkan angka 1 sampai ${totalPages.value}`
    return
  }

  jumpPageError.value = ''
  await changePage(pageNum)
}

const handleClickOutside = (event) => {
  if (!jumpBoxRef.value) return

  const isClickInside = jumpBoxRef.value.contains(event.target)

  if (!isClickInside) {
    closeJumpInput()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="container mx-auto">
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-black dark:border-white"></div>
    </div>

    <div v-else-if="categoryData" class="pt-8 px-4 lg:px-8">
      <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-8">
          <div class="border-b border-gray-200 font-semibold font-poppins">
            <h1 class="border-b-4 border-black w-fit text-xl lg:text-3xl -mb-0.5 py-2 dark:text-white dark:border-white capitalize">
              {{ categoryData.category_info.name }}
            </h1>
          </div>

          <div class="flex gap-4 my-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button 
              v-for="sub in categoryData.sub_categories" 
              :key="sub.slug"
              class="px-4 py-1.5 rounded-full border text-sm transition font-poppins"
              :class="sub.slug === categorySlug ? 'bg-black text-white' : 'bg-transparent text-gray-600 border-gray-200 dark:text-white dark:border-gray-700'">
              <NuxtLink :to="`/category/${sub.slug}`">
                {{ sub.name }}
              </NuxtLink>
            </button>
          </div>

          <div class="space-y-6">
            <div v-for="post in categoryData.posts.data" :key="post.id" class="border-b border-gray-50 dark:border-slate-900 last:border-0">
              <NuxtLink :to="`/detail/${post.slug}/${post.id}`" class="flex py-4 gap-4 items-center group overflow-hidden">
                <div class="w-28 h-20 lg:w-40 lg:h-28 shrink-0 overflow-hidden rounded-xl">
                  <img :src="post.featured_image || '/tes.png'" :alt="post.title" class="w-full h-full object-cover hover:scale-105 transition duration-300">
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-gray-400 dark:text-white text-xs mb-1">
                    {{ categoryData.category_info.name }} - {{ formatDate(post.published_at) }}
                  </span>
                  <h2 class="text-gray-900 dark:text-white font-semibold text-sm lg:text-xl line-clamp-2 wrap-break-word">
                    {{ post.title }}
                  </h2>
                  <div v-html="post.content_html" class="text-gray-500 dark:text-gray-400 text-xs mt-2 font-poppins line-clamp-3">
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pb-10 border-t border-gray-100 pt-8">  
            <div class="flex items-center gap-2">
              <button 
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all dark:border-slate-800 dark:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div class="flex items-center gap-2">
                <div v-for="(page, index) in displayedPages" :key="index" class="relative flex flex-col items-center" :ref="page === '...' && activeJumpIndex === index ? (el) => (jumpBoxRef.value = el) : null">
                  <button
                    @click="page === '...' ? toggleJumpInput($event, index) : changePage(page)"
                    :class="[
                      'px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200',
                      page !== '...' && Number(page) === currentPage
                        ? 'bg-blue-600 dark:bg-yellow-400 text-white border-blue-600 dark:border-white shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 dark:hover:border-yellow-400 hover:text-blue-600 dark:hover:text-yellow-400',
                      page === '...' ? 'cursor-pointer hover:bg-yellow-50' : ''
                    ]"
                    :title="page === '...' ? 'Lompat ke halaman' : ''"
                  >
                    {{ page }}
                  </button>

                  <div v-if="page === '...' && activeJumpIndex === index" class="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20"
                    @click.stop>
                    <div class="flex items-center gap-2">
                      <input
                        v-model="jumpPageInput"
                        type="number"
                        min="1"
                        :max="totalPages"
                        placeholder="Page"
                        class="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400"
                        @keyup.enter="jumpToPage"
                        @input="jumpPageError = ''"
                      />
                      <button @click="jumpToPage" class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-yellow-500 dark:bg-yellow-400">
                        Go
                      </button>
                    </div>

                    <p v-if="jumpPageError" class="mt-2 text-xs text-red-500">
                      {{ jumpPageError }}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all dark:border-slate-800 dark:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div class="text-sm text-gray-500 dark:text-gray-400 font-poppins">
              Page {{ categoryData.posts.current_page }} of {{ categoryData.posts.last_page }}
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 pb-20 sm:flex-col">
            <div class="border-b border-gray-200 font-semibold font-poppins mb-6">
              <p class="border-b-4 border-gray-800 w-fit text-3xl -mb-0.5 py-2 dark:text-white dark:border-white">Popular News</p>
            </div>
            <div class="mt-6 font-poppins space-y-8">
                <div v-for="news in popularNews.slice(0, 5)" :key="news.id" class="group cursor-pointer">
                  <NuxtLink :to="`/detail/${news.slug}/${news.id}`" class="block">
                    <p class="text-gray-400 text-xs mb-1 dark:text-gray-400">
                    {{ news.category?.name }} — {{ formatDate(news.published_at) }}
                    </p>
                    <p class="text-black text-base font-medium line-clamp-2 transition-colors dark:text-white">
                    {{ news.title }}
                    </p>
                  </NuxtLink>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

