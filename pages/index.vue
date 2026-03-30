<script setup>
const api = useApi()

const { data, pending } = await useAsyncData(
  'home-page',
  async () => {
    const res = await api('/home')
    return res.data
  }
)

const heroPost = computed(() => data.value?.hero_post || null)
const popularNews = computed(() => data.value?.popular_news || [])
const latestNews = computed(() => data.value?.latest_news || [])
const categoryBlocks = computed(() => data.value?.category_blocks || [])

useHead(() => ({
  title: data.value?.seo?.meta_title || 'Memuat...',
  meta: [
    { name: 'description', content: data.value?.seo?.meta_description || '' },
    { name: 'keywords', content: data.value?.seo?.focus_keyword || '' },
    { property: 'og:image', content: data.value?.seo?.open_graph_image || '' }
  ],
  link: [
    { rel: 'canonical', href: data.value?.seo?.canonical_url || '' }
  ]
}))

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="bg-white dark:bg-slate-950 min-h-screen">
    <div v-if="!pending" class="container mx-auto px-4 lg:px-0"> 
      
      <div class="grid grid-cols-1 lg:grid-cols-12 py-8 lg:py-16 gap-8 lg:gap-10">
        
        <div v-if="heroPost" class="col-span-1 lg:col-span-7 relative overflow-hidden rounded-2xl cursor-pointer group">
          <NuxtLink :to="`/detail/${heroPost.slug}`">
          <img :src="heroPost.featured_image" :alt="heroPost.title" class="w-full h-75 lg:h-full object-cover block transition-transform duration-500 group-hover:scale-105">
          <div class="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between bg-linear-to-b from-black/20 via-transparent to-black/80">
            <span class="self-start text-white border border-white px-4 py-1.5 rounded-full text-xs lg:text-[12px] font-medium">
              {{ heroPost.category?.name }}
            </span>
            <div class="font-poppins">
              <h2 class="text-white text-lg lg:text-3xl leading-tight line-clamp-2 mb-3 max-w-2xl">
                {{ heroPost.title }}
              </h2>
              <p class="text-gray-300 text-[10px] lg:text-sm">
                {{ formatDate(heroPost.published_at) }}
              </p>
            </div>
          </div>
          </NuxtLink> 
        </div>
        

        <div class="col-span-1 lg:col-span-5">
          <div class="border-b border-gray-200 font-semibold font-poppins">
            <p class="border-b-4 border-black w-fit text-xl lg:text-2xl -mb-0.5 py-2 dark:text-white dark:border-white">Popular News</p>
          </div>
          
          <div class="mt-6 font-poppins space-y-6"> 
            <div v-for="news in popularNews" :key="news.id" class="group cursor-pointer">
              <NuxtLink :to="`/detail/${news.slug}`">
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

      <div class="pb-16">
        <div class="border-b border-gray-200 font-semibold font-poppins mb-8">
          <p class="border-b-4 border-black w-fit text-xl lg:text-2xl -mb-0.5 py-2 dark:text-white dark:border-white">Latest News</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          <div v-if="latestNews?.length > 0" class="md:col-span-2 lg:col-span-5 relative overflow-hidden rounded-2xl h-75 md:h-125 group cursor-pointer">
            <NuxtLink :to="`/detail/${latestNews?.[0]?.slug}`">
            <img :src="latestNews?.[0]?.featured_image" :alt="latestNews?.[0]?.title" class="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 p-6 flex flex-col justify-between bg-linear-to-b from-black/20 via-transparent to-black/80">
              <span class="self-start text-white border border-white px-3 py-1 rounded-full text-xs font-medium">
                {{ latestNews?.[0]?.category?.name }}
              </span>
              <div class="font-poppins">
                <h2 class="text-white text-lg md:text-xl mb-2 font-bold">
                  {{ latestNews?.[0]?.title }}
                </h2>
                <p class="text-gray-300 text-xs">{{ formatDate(latestNews?.[0]?.published_at) }}</p>
              </div>
            </div>
            </NuxtLink>
          </div>

          <div class="md:col-span-2 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div v-for="news in latestNews?.slice(1, 4)" :key="news.id" class="relative overflow-hidden rounded-2xl h-55 group cursor-pointer">
              <NuxtLink :to="`/detail/${news.slug}`">
              <img :src="news.featured_image" :alt="news.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
              <div class="absolute inset-0 p-5 flex flex-col justify-between bg-linear-to-t from-black/90 via-black/30 to-transparent">
                <span class="self-start text-white border border-white/50 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium">
                  {{ news.category?.name }}
                </span>
                <div class="font-poppins">
                  <h2 class="text-white text-sm md:text-base font-medium leading-snug mb-1 line-clamp-2">
                    {{ news.title }}
                  </h2>
                  <p class="text-gray-400 text-[10px]">{{ formatDate(news.published_at) }}</p>
                </div>
              </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 pb-16">
        <div v-for="block in categoryBlocks" :key="block.category_slug" class="col-span-1">
          <div class="border-b border-gray-200 font-semibold font-poppins mb-6">
            <p class="border-b-4 border-gray-800 w-fit text-2xl -mb-0.5 py-2 dark:text-white dark:border-white">
              {{ block.category_name }}
            </p>
          </div>

          <div class="flex flex-col gap-5">
            <NuxtLink v-for="post in block.posts" :key="post.id" :to="`/detail/${post.slug}`" class="flex gap-4 items-start group cursor-pointer">
              
              <div class="w-24 h-20 shrink-0 overflow-hidden rounded-xl">
                <img :src="post.featured_image" :alt="post.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
              </div>
              <div class="flex flex-col">
                <p class="text-gray-500 text-[12px] mb-1 dark:text-gray-400">
                  {{ formatDate(post.published_at) }}
                </p>
                <h3 class="text-gray-900 text-[16px] font-semibold leading-snug line-clamp-2 dark:text-white">
                  {{ post.title }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  </div>
</template>
