<script setup>
const route = useRoute()
const api = useApi()

const slug = computed(() => String(route.params.slug || ''))

const { data, pending } = await useAsyncData(
  () => `post-${slug.value}`,
  async () => {
    const detailRes = await api(`/posts/${slug.value}`)
    const homeRes = await api('/home')

    const post = detailRes?.data?.post

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Artikel tidak ditemukan'
      })
    }

    return {
      post,
      seo: detailRes?.data?.seo || {},
      popularNews: homeRes?.data?.popular_news || [],
      latestNews: (homeRes?.data?.latest_news || []).filter(
        item => item.slug !== slug.value
      )
    }
  },
  {
    watch: [slug]
  }
)

const post = computed(() => data.value?.post || null)
const popularNews = computed(() => data.value?.popularNews || [])
const latestNews = computed(() => data.value?.latestNews || [])

useHead(() => ({
  title: data.value?.seo?.meta_title || data.value?.post?.title || 'Memuat...',
  meta: [
    {
      name: 'description',
      content: data.value?.seo?.meta_description || ''
    },
    {
      property: 'og:image',
      content: data.value?.post?.featured_image || ''
    }
  ]
}))

watch(slug, () => {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="bg-white dark:bg-slate-950 min-h-screen pb-20 font-poppins">
    
    <div v-if="pending" class="flex justify-center py-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="post && post.id" class="container mx-auto pt-8 px-4 lg:px-0">
      <div class="grid grid-cols-12 gap-8 lg:gap-12">
        
        <div class="col-span-12 lg:col-span-8">
          <h1 class="text-2xl lg:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
            {{ post.title }}
          </h1>
          
          <div class="mt-6">
            <p class="text-gray-500 text-sm">
              {{ formatDate(post.published_at) }}
            </p>
            
          </div>

          <div class="flex justify-between gap-2 mt-4">
            <span class="bg-black text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              {{ post.category?.name }}
            </span>
            <button class="px-4 py-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              Share Artikel
            </button>
          </div>

          <div class="mt-8 w-full aspect-video overflow-hidden rounded-[2.5rem] bg-gray-100">
            <img :src="post.featured_image" :alt="post.title" class="w-full h-full object-cover shadow-lg">
          </div>

          <div 
            class="mt-10 prose prose-lg text-[16px] dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
            v-html="post.content_html"
          ></div>

          <div class="mt-12 pt-6 flex items-center gap-3">
            <span class="text-sm font-bold dark:text-white">Tags:</span>
            <div class="flex gap-2">
              <span v-for="tag in post.tags" :key="tag.slug" class="text-sm text-gray-400 hover:text-black dark:hover:text-white underline cursor-pointer">
                <NuxtLink :to="`/tags/${tag.slug}`">
                #{{ tag.name }}
                </NuxtLink>
              </span>
            </div>
          </div>

          <div class="mt-20">
            <div class="border-b border-gray-200 font-semibold font-poppins mb-8">
              <p class="border-b-4 border-black w-fit text-xl lg:text-2xl -mb-0.5 py-2 dark:text-white dark:border-white">Up Next</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div v-for="next in latestNews.slice(0, 3)" :key="next.id" class="group cursor-pointer">
                <div class="aspect-video rounded-3xl overflow-hidden mb-4 bg-gray-100">
                  <img :src="next.featured_image" :alt="next.title" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                    {{ next.category?.name }} — {{ formatDate(next.published_at) }}
                </p>
                <NuxtLink :to="`/detail/${next.slug}`" class="font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 text-lg">
                  {{ next.title }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden lg:block col-span-4">
          <div class="border-b border-gray-200 font-semibold font-poppins mb-8">
          <p class="border-b-4 border-black w-fit text-xl lg:text-2xl -mb-0.5 py-2 dark:text-white dark:border-white">Popular News</p>
        </div>
          <div class="space-y-8">
            <div v-for="news in popularNews.slice(0, 5)" :key="news.id" class="group">
              <p class="text-gray-400 text-[10px] font-bold uppercase mb-1 tracking-widest">
                {{ news.category?.name }} — {{ formatDate(news.published_at) }}
              </p>
              <NuxtLink :to="`/detail/${news.slug}`" class="text-sm font-semibold line-clamp-2 dark:text-white">
                {{ news.title }}
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

<style scoped>
.prose :deep(p) { margin-bottom: 1.5rem; }
.prose :deep(img) { border-radius: 1.5rem; margin: 2.5rem 0; }
</style>