<script setup>
const route = useRoute()
const api = useApi()

const Slug = computed(() => String(route.params.slug || ''))
const currentPage = ref(1)

watch(Slug, () => {
  currentPage.value = 1
})

const { data, pending } = await useAsyncData(
  () => `tag-${Slug.value}-page-${currentPage.value}`,
  async () => {
    const [tagRes, homeRes] = await Promise.all([
      api(`/tags/${Slug.value}`, { query: { page: currentPage.value } }),
      api('/home').catch(() => null) 
    ])

    if (!tagRes?.data) {
      throw createError({ statusCode: 404, statusMessage: 'Tag tidak ditemukan' })
    }

    return {
      tagData: tagRes.data,
      popularNews: homeRes?.data?.popular_news || [],
      seo: tagRes?.data?.seo || {}
    }
  },
  { watch: [Slug, currentPage] }
)

const tagInfo = computed(() => data.value?.tagData?.tag_info || null)
const posts = computed(() => data.value?.tagData?.posts?.data || [])
const paginationMeta = computed(() => data.value?.tagData?.posts || {})
const popularNews = computed(() => data.value?.popularNews || [])

useSeoMeta({
  title: () => data.value?.seo?.meta_title || 'Tag',
  description: () => data.value?.seo?.meta_description || '',
  ogTitle: () => data.value?.seo?.meta_title || 'Tag',
  ogImage: () => data.value?.seo?.open_graph_image || ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const displayedPages = computed(() => {
  const total = paginationMeta.value?.last_page || 0
  const current = currentPage.value
  const pages = []
  if (total <= 1) return [1]
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages
})

const changePage = (page) => {
  if (typeof page !== 'number') return
  currentPage.value = page
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-950 min-h-screen">
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-black dark:border-white"></div>
    </div>  

    <div v-else-if="tagInfo" class="container mx-auto pt-8 px-4 lg:px-0">
      <div class="grid grid-cols-12 gap-8">
        
        <div class="col-span-12 lg:col-span-8">
          <div class="border-b border-gray-200 dark:border-slate-800 font-semibold font-poppins">
            <h1 class="border-b-4 border-black w-fit text-xl lg:text-3xl -mb-0.5 py-2 dark:text-white dark:border-white capitalize">
              Tag: {{ tagInfo.name }}
            </h1>
          </div>

          <div class="space-y-6 mt-8">
            <div v-for="post in posts" :key="post.id" class="border-b border-gray-50 dark:border-slate-900 last:border-0">
              <NuxtLink :to="`/detail/${post.slug}`" class="flex py-4 gap-4 items-center group">
                <div class="w-28 h-20 lg:w-40 lg:h-28 shrink-0 overflow-hidden rounded-xl">
                  <img :src="post.featured_image" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                </div>
                <div class="flex flex-col">
                  <span class="text-gray-400 dark:text-gray-500 text-xs uppercase mb-1">
                    {{ post.category?.name }} - {{ formatDate(post.published_at) }}
                  </span>
                  <h2 class="text-gray-900 dark:text-white font-semibold text-sm lg:text-xl leading-tight line-clamp-2">
                    {{ post.title }}
                  </h2>
                  <div v-if="post.content_html" v-html="post.content_html" class="text-gray-500 dark:text-gray-400 text-xs mt-2 font-poppins line-clamp-2"></div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div v-if="paginationMeta.last_page > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pb-10 border-t border-gray-100 dark:border-slate-800 pt-8">  
            <div class="flex items-center gap-2">
              <button 
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 disabled:opacity-30 dark:border-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div class="flex items-center gap-2">
                <template v-for="(page, index) in displayedPages" :key="index">
                  <button
                    v-if="page !== '...'"
                    @click="changePage(page)"
                    class="w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-all"
                    :class="currentPage === page 
                      ? 'bg-zinc-800 text-white dark:bg-white dark:text-black' 
                      : 'border border-gray-200 text-gray-600 hover:border-black dark:border-slate-800 dark:text-gray-400'"
                  >
                    {{ page }}
                  </button>
                  <span v-else class="px-2 text-gray-400">...</span>
                </template>
              </div>

              <button 
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === paginationMeta.last_page"
                class="w-10 h-10 flex items-center justify-center rounded-md border border-gray-200 disabled:opacity-30 dark:border-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div class="text-sm text-gray-500 dark:text-gray-400 font-poppins">
              Halaman {{ paginationMeta.current_page }} dari {{ paginationMeta.last_page }}
            </div>
          </div>
        </div>

        <div class="hidden lg:block col-span-4">
          <div class="border-b border-gray-200 dark:border-slate-800 font-semibold font-poppins mb-6">
            <p class="border-b-4 border-gray-800 w-fit text-3xl -mb-0.5 py-2 dark:text-white dark:border-white">Popular News</p>
          </div>
          <div class="mt-6 font-poppins space-y-6">
            <div v-for="news in popularNews.slice(0, 5)" :key="news.id" class="group">
              <NuxtLink :to="`/detail/${news.slug}`">
                <p class="text-gray-400 text-xs mb-1 dark:text-gray-500">
                  {{ news.category?.name }} — {{ formatDate(news.published_at) }}
                </p>
                <p class="text-black text-base font-medium line-clamp-2 group-hover:text-blue-600 transition dark:text-white">
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