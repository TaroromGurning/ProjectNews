<script setup>
const api = useApi()
const { locale } = useI18n()

const { data, pending, refresh } = await useAsyncData(
  'home-page',
  async () => {
    const res = await api('/home')
    if (!res || !res.data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'API Tidak Merespon'
      })
    }
    return res.data
  },
  {
    watch: [locale] 
  }
)

watch(locale, () => {
  refresh()
})

const heroPost = computed(() => data.value?.hero_post || null)
const popularNews = computed(() => data.value?.popular_news || [])
const latestNews = computed(() => data.value?.latest_news || [])
const categoryBlocks = computed(() => data.value?.category_blocks || [])

useHead(() => ({
  title: data.value?.seo?.meta_title || 'Memuat...',
  meta: [
    { 
      name: 'description', 
      content: data.value?.seo?.meta_description || '' 
    },
    { 
      name: 'keywords', 
      content: data.value?.seo?.focus_keyword || '' 
    },
    { 
      property: 'og:title', 
      content: data.value?.seo?.meta_title || '' 
    },
    { 
      property: 'og:description', 
      content: data.value?.seo?.meta_description || '' 
    },
    { 
      property: 'og:url', 
      content: data.value?.seo?.canonical_url || window.location.href
    },
    { 
      property: 'og:image', 
      content: data.value?.seo?.open_graph_image || '' 
    },
  ],
  link: [
    { rel: 'canonical', href: data.value?.seo?.canonical_url || '' }
  ]
}))

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale.value === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="container mx-auto">
    <div v-if="!pending" class="px-4 lg:px-8"> 
      <div class="grid grid-cols-1 lg:grid-cols-12 py-8 lg:py-16 gap-8 lg:gap-10">
        <div v-if="heroPost" class="col-span-1 lg:col-span-8 h-[503px] w-full max-w-[752px] relative overflow-hidden rounded-2xl cursor-pointer group justify-self-start">
          <NuxtLink :to="`/detail/${heroPost.slug}/${heroPost.id}`" class="block h-full bg-white">
            <img 
              :src="heroPost.featured_image || '/tes.png'" 
              :alt="heroPost.title" 
              class="w-full h-full object-contain block transition-transform duration-500 group-hover:scale-105"
            >
            <div class="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between bg-linear-to-t from-black/85 via-transparent to-black/40">
              <span class="self-start text-white bg-transparent border border-white px-4 py-1.5 rounded-full text-[14px]">
                {{ heroPost.category?.name }}
              </span>
              <div class="font-poppins">
                <h2 class="text-white text-lg lg:text-xl font-medium leading-tight line-clamp-2 mb-3 max-w-2xl">
                  {{ heroPost.title }}
                </h2>
                <p class="text-gray-300 text-[14px] lg:text-sm">
                  {{ formatDate(heroPost.published_at) }}
                </p>
              </div>
            </div>
          </NuxtLink> 
        </div>

        <div class="col-span-1 lg:col-span-4 flex flex-col w-full">
          <div class="border-b border-gray-200 font-semibold font-poppins">
            <p class="border-b-4 border-black w-fit text-xl lg:text-[32px] -mb-0.5 py-2 dark:text-white dark:border-white">
              Popular News
            </p>
          </div>
          
          <div class="mt-6 font-poppins space-y-6 overflow-y-auto"> 
            <div v-for="news in popularNews?.slice(0, 4)" :key="news.id" class="group cursor-pointer pb-4">
              <NuxtLink :to="`/detail/${news.slug}/${news.id}`" class="block">
                <p class="text-[#555555] text-[14px] mb-1 dark:text-gray-200">
                  {{ news.category?.name }} - {{ formatDate(news.published_at) }}
                </p>
                <h4 class="text-black text-[16px] font-semibold line-clamp-2 dark:text-white">
                  {{ news.title }}
                </h4>
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>

      <div class="pb-16">
        <div class="border-b border-gray-200 font-semibold font-poppins mb-8">
          <p class="border-b-4 border-black w-fit text-xl lg:text-[32px] -mb-0.5 py-2 dark:text-white dark:border-white">Latest News</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
          <div v-if="latestNews?.length > 0" class="md:col-span-2 lg:col-span-4 relative overflow-hidden rounded-2xl lg:max-w-[400px] h-75 md:h-[574px] group cursor-pointer bg-white">
            <NuxtLink :to="`/detail/${latestNews?.[0]?.slug}/${latestNews?.[0]?.id}`">
            <img :src="latestNews?.[0]?.featured_image || '/tes.png'" :alt="latestNews?.[0]?.title" class="w-full h-full object-contain block transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 p-6 flex flex-col justify-between bg-linear-to-b from-black/50 via-transparent to-black/80">
              <span class="self-start text-white border border-white px-3 py-1 rounded-full text-[14px]">
                {{ latestNews?.[0]?.category?.name }}
              </span>
              <div class="font-poppins">
                <h2 class="text-white text-lg md:text-xl mb-2">
                  {{ latestNews?.[0]?.title }}
                </h2>
                <p class="text-gray-300 text-xs">{{ formatDate(latestNews?.[0]?.published_at) }}</p>
              </div>
            </div>
            </NuxtLink>
          </div>

          <div class="md:col-span-2 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div v-for="news in latestNews?.slice(1, 5)" :key="news.id" class="relative overflow-hidden rounded-2xl max-w-[400px] h-[267px] group cursor-pointer bg-white">
              <NuxtLink :to="`/detail/${news.slug}/${news.id}`">
              <img :src="news.featured_image || '/tes.png'" :alt="news.title" class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110">
              <div class="absolute inset-0 p-5 flex flex-col justify-between bg-linear-to-t from-black/80 to-black/50 via-transparent">
                <span class="self-start text-white border border-white bg-transparent px-3 py-1 rounded-full text-[14px] font-medium">
                  {{ news.category?.name }}
                </span>
                <div class="font-poppins">
                  <h2 class="text-white text-sm md:text-[20px] font-medium leading-snug mb-1 line-clamp-2">
                    {{ news.title }}
                  </h2>
                  <p class="text-gray-400 text-[14px]">
                    {{ formatDate(news.published_at) }}
                  </p>
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
            <p class="border-b-4 border-gray-800 w-fit text-xl lg:text-[32px] -mb-0.5 py-2 dark:text-white dark:border-white">
              {{ block.category_name }}
            </p>
          </div>

          <div class="flex flex-col gap-5">
            <NuxtLink v-for="post in block.posts" :key="post.id" :to="`/detail/${post.slug}/${post.id}`" class="flex gap-4 items-start group cursor-pointer">
              
              <div class="w-[180px] h-[120px] shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                <img :src="post.featured_image || '/tes.png'" :alt="post.title" class="w-full h-full object-contain group-hover:scale-110 transition-transform">
              </div>
              <div class="flex flex-col py-6">
                <p class="text-gray-500 text-[12px] lg:text-[14px] mb-1 dark:text-gray-200">
                  {{post.category?.name}} - {{ formatDate(post.published_at) }}
                </p>
                <h3 class="text-gray-900 text-[14px] lg:text-[16px] font-semibold leading-snug line-clamp-2 dark:text-white">
                  {{ post.title }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
    </div>
  </div>
</template>
