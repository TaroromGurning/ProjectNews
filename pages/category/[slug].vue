<script setup>
const route = useRoute()
const api = useApi()
const { locale } = useI18n()
const { t } = useI18n()

const categorySlug = computed(() => String(route.params.slug || ''))
const currentPage = computed(() => {
  const page = Number(route.query.page || 1)
  return Number.isInteger(page) && page > 0 ? page : 1
})


const { data, pending, refresh, error } = await useAsyncData(
  () => `category-${categorySlug.value}-page-${currentPage.value}`,
  async () => {
    const categoryRes = await api(`/categories/${categorySlug.value}`, {
      query: { page: currentPage.value }
    })

    const homeRes = await api('/home')

    if (!categoryRes?.data?.category_info) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kategori Tidak Ditemukan',
        fatal: true
      })
    }

    return {
      category: categoryRes.data,
      popularNews: homeRes?.data?.popular_news || [],
      seo: categoryRes?.data?.seo || {}
    }
  },
  {
    watch: [categorySlug, currentPage, locale]
  }
)

watch(locale, () => {
  refresh()
})

const categoryData = computed(() => data.value?.category || null)
const popularNews = computed(() => data.value?.popularNews || [])

const url = useRequestURL()
useSeoMeta({
  title: () => data.value?.seo?.meta_title || 'Kategori',
  description: () => data.value?.seo?.meta_description || '',
  ogTitle: () => data.value?.seo?.meta_title || 'Kategori',
  ogDescription: () => data.value?.seo?.meta_description || '',
  ogImage: () => data.value?.seo?.open_graph_image || '',
  ogUrl: () => data.value?.seo?.canonical_url || url.href,
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale.value === 'id' ? 'id-ID' : (locale.value === 'en' ? 'en-US' : 'zh-CN'), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const totalPages = computed(() => {
  const lastPage = categoryData.value?.posts?.last_page
  return lastPage ? Number(lastPage) : 1
})

const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  
  if (!total || total <= 1) return []
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
          <div class="sticky top-32 h-fit z-20 bg-white py-4 dark:bg-slate-950">
          <div class="border-b border-gray-200 font-semibold font-poppins">
            <h1 class="border-b-4 border-black w-fit text-xl lg:text-[32px] -mb-0.5 py-2 dark:text-white dark:border-white capitalize">
              {{ categoryData.category_info.name }}
            </h1>
          </div>

          <div v-if="categoryData?.sub_categories?.length" class="flex gap-4 my-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button 
              v-for="sub in categoryData.sub_categories" 
              :key="sub.slug"
              class="px-4 py-1.5 rounded-full border text-sm transition font-poppins"
              :class="sub.slug === categorySlug ? 'bg-black text-white' : 'bg-transparent text-black border-black dark:text-white dark:border-gray-700'">
              <NuxtLink :to="`/category/${sub.slug}`">
                {{ sub.name }}
              </NuxtLink>
            </button>
          </div>
          </div>

          <div v-if="categoryData.posts.data.length > 0" class="space-y-6 font-poppins mb-8 z-10">
            <div v-for="post in categoryData.posts.data" :key="post.id" class="border-b border-gray-50 dark:border-slate-900 last:border-0">
              <NuxtLink :to="`/detail/${post.category?.slug}/${post.slug}/${post.id}`" class="flex py-4 gap-4 items-start group overflow-hidden">
                <div class="w-28 h-20 lg:w-[269px] lg:h-[180px] shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                  <img :src="post.featured_image || '/tes.png'" :alt="post.title" class="w-full h-full object-contain hover:scale-105 transition duration-300">
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[#555555] dark:text-gray-200 text-[12px] lg:text-[14px] mb-1">
                    {{ categoryData.category_info.name }} - {{ formatDate(post.published_at) }}
                  </span>
                  <h2 class="text-gray-900 dark:text-white font-medium text-[14px] lg:text-[16px] line-clamp-1 lg:line-clamp-2 wrap-break-word">
                    {{ post.title }}
                  </h2>
                  <div class="text-[#555555] dark:text-gray-400 text-[14px] lg:text-[16px] mt-1 font-poppins line-clamp-2 lgline-clamp-3 wrap-break-word">
                    {{ post.short_description }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-20 text-center">
            <div class="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 8v4h4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ $t('no_news.title') }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mt-2">
              {{ $t('no_news.description') }}
            </p>
            <NuxtLink to="/" class="mt-6 px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-80 transition">
              {{ $t('no_news.back') }}
            </NuxtLink>
          </div>

          <div v-if="categoryData.posts?.last_page > 1" id="page" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pb-10 border-t border-gray-100 pt-8">  
            <div class="flex items-center gap-2">
              <button 
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all dark:border-slate-800 dark:text-gray-500 cursor-pointer disabled:pointer-events-none"
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
                      'px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 cursor-pointer',
                      page !== '...' && Number(page) === currentPage
                        ? 'bg-black dark:bg-yellow-400 text-white border-gray-500 dark:border-white shadow-md'
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
                      <button @click="jumpToPage" class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-yellow-500 dark:bg-yellow-400 cursor-pointer">
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
                class="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all dark:border-slate-800 dark:text-gray-500 cursor-pointer disabled:pointer-events-none"
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

        <div class="sticky top-40 h-fit z-10 col-span-12 lg:col-span-4 pb-20 sm:flex-col">
            <div class="border-b border-gray-200 font-semibold font-poppins mb-6">
              <p class="border-b-4 border-gray-800 w-fit text-xl lg:text-[32px] -mb-0.5 py-2 dark:text-white dark:border-white">
                {{ $t('Popular_News') }}
              </p>
            </div>
            <div class="mt-6 font-poppins space-y-8">
                <div v-for="news in popularNews.slice(0, 5)" :key="news.id" class="group cursor-pointer">
                  <NuxtLink :to="`/detail/${news.category?.slug}/${news.slug}/${news.id}`" class="block">
                    <p class="text-[#555555] text-[12px] lg:text-[14px] mb-1 dark:text-gray-200">
                    {{ news.category?.name }} - {{ formatDate(news.published_at) }}
                    </p>
                    <p class="text-black text-[14px] lg:text-[16px] font-medium line-clamp-2 transition-colors dark:text-white">
                    {{ news.title }}
                    </p>
                  </NuxtLink>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div v-else class="container mx-auto py-32 text-center">
      <div class="max-w-md mx-auto px-4">
        <h1 class="text-9xl font-bold text-gray-100 dark:text-slate-800">404</h1>
        <h2 class="text-2xl font-bold mt-10 dark:text-white relative">Artikel Tidak Ditemukan</h2>
        <p class="text-gray-500 mt-4">Maaf, artikel dengan slug <b class="text-red-500">"{{ $route.params.slug }}"</b> tidak terdaftar di sistem kami.</p>
        <NuxtLink 
          to="/" 
          class="inline-block mt-8 px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold hover:scale-105 transition shadow-xl"
        >
          Kembali ke Beranda
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
