<script setup>
const route = useRoute()
const api = useApi()

const tagSlug = computed(() => String(route.params.slug || ''))
const currentPage = ref(1)

watch(tagSlug, () => {
  currentPage.value = 1
})

const { data, pending } = await useAsyncData(
  () => `tag-${tagSlug.value}-page-${currentPage.value}`,
  async () => {
    const tagRes = await api(`/tags/${tagSlug.value}`, {
      query: { page: currentPage.value }
    })

    const homeRes = await api('/home')

    if (!tagRes?.data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tag tidak ditemukan'
      })
    }

    return {
      tagData: tagRes.data,
      popularNews: homeRes?.data?.popular_news || [],
      seo: tagRes?.data?.seo || {}
    }
  },
  {
    watch: [tagSlug, currentPage]
  }
)

const tagInfo = computed(() => data.value?.tagData?.tag_info || null)
const posts = computed(() => data.value?.tagData?.posts || [])
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
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const changePage = (page) => {
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
          <div class="border-b border-gray-200  dark:border-slate-800 font-semibold font-poppins">
            <h1 class="border-b-4 border-black w-fit text-xl lg:text-3xl -mb-0.5 py-2 dark:text-white dark:border-white capitalize">
              Topik: {{ tagInfo.name }}
            </h1>
          </div>

          <div class="space-y-6 mt-8">
            <div v-for="post in posts?.data" :key="post.id" class="flex py-4 gap-4 border-b border-gray-50 dark:border-slate-900 last:border-0 items-center">
              <div class="w-28 h-20 lg:w-40 lg:h-28 shrink-0 overflow-hidden rounded-xl">
                <img :src="post.featured_image" :alt="post.title" class="w-full h-full object-cover hover:scale-105 transition duration-300">
              </div>
              <div class="flex flex-col">
                <span class="text-gray-400 dark:text-white text-xs uppercase mb-1">
                  {{ post.category.name }} - {{ formatDate(post.published_at) }}
                </span>
                <NuxtLink :to="`/detail/${post.slug}`">
                  <h2 class="text-gray-900 dark:text-white font-semibold text-sm lg:text-xl leading-tight line-clamp-2">
                    {{ post.title }}
                  </h2>
                </NuxtLink>
                <p v-html="post.excerpt" class="text-gray-500 dark:text-gray-400 text-xs mt-2 font-poppins line-clamp-3">
                </p>
              </div>
            </div>
          </div>

          <div v-if="posts?.last_page > 1" class="flex justify-center gap-4 mt-10 pb-10">
            <button 
              :disabled="!posts?.prev_page_url"
              @click="changePage(posts.current_page - 1)"
              class="px-4 py-2 border rounded-lg disabled:opacity-30 dark:text-white dark:border-gray-700"
            >
              Previous
            </button>
            <span class="py-2 dark:text-white">Page {{ posts.current_page }} of {{ posts?.last_page }}</span>
            <button 
              :disabled="!posts.next_page_url"
              @click="changePage(posts.current_page + 1)"
              class="px-4 py-2 border rounded-lg disabled:opacity-30 dark:text-white dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>

        <div class="hidden lg:block col-span-4">
          <div class="border-b border-gray-200 font-semibold font-poppins mb-6">
            <p class="border-b-4 border-gray-800 w-fit text-3xl -mb-0.5 py-2 dark:text-white dark:border-white">Popular News</p>
          </div>
          <div class="mt-6 font-poppins space-y-6">
            <div v-for="news in popularNews.slice(0, 5)" :key="news.id" class="group cursor-pointer">
              <p class="text-gray-400 text-xs mb-1 dark:text-gray-400">
                {{ news.category?.name }} — {{ formatDate(news.published_at) }}
              </p>
              <NuxtLink :to="`/detail/${news.slug}`">
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