<script setup>
const route = useRoute()
const api = useApi()
const { locale } = useI18n()

const category = computed(() => String(route.params.category || ''))
const slug = computed(() => String(route.params.slug || ''))
const id = computed(() => Number(route.params.id || 0))

const { data, pending, refresh } = await useAsyncData(
  () => `post-${slug.value}-${id.value}`,
  async () => {
    const detailRes = await api(`/posts/${slug.value}/${id.value}`)
    const homeRes = await api('/home')

    const post = detailRes?.data?.post

    if (!post || post.id !== id.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Artikel tidak ditemukan',
        fatal: true
      })
    }

    return {
      post,
      seo: detailRes?.data?.seo || {},
      popularNews: homeRes?.data?.popular_news || [],
      latestNews: (homeRes?.data?.latest_news || []).filter(
        item => item.slug !== slug.value && item.id !== id.value
      )
    }
  },
  {
    watch: [slug, id, locale]
  }
)

watch(locale, () => {
  refresh()
})

const post = computed(() => data.value?.post || null)
const popularNews = computed(() => data.value?.popularNews || [])
const latestNews = computed(() => data.value?.latestNews || [])

const url = useRequestURL()
useHead(() => ({
  title: data.value?.seo?.meta_title || data.value?.post?.title || 'Memuat...',
  meta: [
    {
      name: 'description',
      content: data.value?.seo?.meta_description || ''
    },
    {
      property: 'og:title',
      content: data.value?.seo?.meta_title || data.value?.post?.title || ''
    },
    {
      property: 'og:description',
      content: data.value?.seo?.meta_description || ''
    },
    { property: 'og:url', 
      content: data.value?.seo?.canonical_url || url.href
    },
    {
      property: 'og:image',
      content: data.value?.seo?.open_graph_image || data.value?.post?.featured_image || ''
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
  return new Date(dateString).toLocaleDateString(locale.value === 'id' ? 'id-ID' : (locale.value === 'en' ? 'en-US' : 'zh-CN'), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const shareToWhatsApp = () => {
  const url = window.location.href
  const text = `Check out this article: ${post.value.title} - ${url}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(whatsappUrl, '_blank')
}

const shareToTwitter = () => {
  const url = window.location.href
  const text = `Check out this article: ${post.value.title}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  window.open(twitterUrl, '_blank')
}

const shareToFacebook = () => {
  const url = window.location.href
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  window.open(facebookUrl, '_blank')
}

const isShowAlert = ref(false)
const copyLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    isShowAlert.value = true
    setTimeout(() => {
      isShowAlert.value = false
    }, 3000)
  })
}
</script>

<template>
  <div class="container mx-auto pb-20 font-poppins">
    <div v-if="pending" class="flex justify-center py-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
    </div>
    <div v-else-if="post && post.id" class="pt-8 px-4 lg:px-8">
      <div class="grid grid-cols-12 gap-8 lg:gap-12">
        
        <div class="col-span-12 lg:col-span-8">
          <h1 class="text-2xl lg:text-4xl font-medium leading-tight text-gray-900 dark:text-white">
            {{ post.title }}
          </h1>
          
          <div class="mt-6">
            <p class="text-[#555555] text-[14px] dark:text-gray-300">
              {{ formatDate(post.published_at) }}
            </p>
            
          </div>

          <div class="flex justify-between gap-2 mt-4">
            <NuxtLink :to="`/category/${post.category?.slug}`">
              <span class="inline-flex items-center w-auto h-auto px-3 py-1 rounded-full text-[14px] bg-black text-white dark:bg-white dark:text-black wrap-break-word overflow-hidden">
                {{ post.category?.[0]?.name || 'Tanpa Kategori' }}
              </span>
            </NuxtLink>
            <div class="relative flex gap-2 h-9">
              <button @click="copyLink" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </button>
              <span v-show="isShowAlert" class="absolute top-full mt-1 whitespace-nowrap bg-gray-800 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-md z-60 pointer-events-none">
                Link disalin!
              </span>
              <button @click="shareToTwitter" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button @click="shareToFacebook" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </button>
              <button @click="shareToWhatsApp" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-8 w-full h-[561px] overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700">
            <img :src="post.featured_image || '/tes.png'" :alt="post.title" class="size-full block object-contain shadow-lg">
          </div>

          <div v-html="post.content_html"
            class="mt-10 prose prose-lg text-[16px] dark:prose-invert max-w-none text-[#555555] font-poppins dark:text-gray-300 leading-relaxed wrap-break-word">
          </div>

          <div class="mt-8 flex justify-between">
            <div class="flex items-start gap-3 flex-1 min-w-0 font-poppins">
              <span class="text-[#555555] text-[16px] dark:text-white font-medium shrink-0">
                {{ $t('Tags') }}:</span>
              <div class="flex flex-wrap gap-x-3 gap-y-2">
                <span v-for="tag in post.tags" :key="tag.slug" class="text-[16px] text-black italic underline cursor-pointer dark:text-gray-300">
                  <NuxtLink :to="`/tags/${tag.slug}`">
                    {{ tag.name }},
                  </NuxtLink>
                </span>
              </div>
            </div>

            <div class="relative flex gap-2 h-9">
              <button @click="copyLink" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </button>
              <span v-show="isShowAlert" class="absolute top-full mt-1 whitespace-nowrap bg-gray-800 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-md z-60 pointer-events-none">
                Link disalin!
              </span>
              <button @click="shareToTwitter" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button @click="shareToFacebook" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </button>
              <button @click="shareToWhatsApp" class="px-2 border rounded-md dark:text-white dark:border-slate-700 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-20">
            <div class="border-b border-gray-200 font-semibold font-poppins mb-8">
              <p class="border-b-4 border-black w-fit text-xl lg:text-2xl -mb-0.5 py-2 dark:text-white dark:border-white">
                {{ $t('Up_Next') }}
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div v-for="next in latestNews.slice(0, 3)" :key="next.id" class="group cursor-pointer">
                <NuxtLink :to="`/detail/${next.category?.slug}/${next.slug}/${next.id}`">
                <div class="aspect-video rounded-3xl overflow-hidden mb-4 border border-gray-200 dark:border-slate-700">
                  <img :src="next.featured_image || '/tes.png'" :alt="next.title" class="w-full h-full object-contain group-hover:scale-105 transition duration-500">
                </div>
                <p class="text-[#555555] text-[14px] mb-2 dark:text-gray-200">
                    {{ next.category?.name }} - {{ formatDate(next.published_at) }}
                </p>
                <div class="font-medium text-gray-900 dark:text-white leading-snug line-clamp-2 text-lg">
                  {{ next.title }}
                </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 sticky top-40 h-fit z-10">
          <div class="sm:flex-col">
            <div class="border-b border-gray-200 font-semibold font-poppins mb-6">
            <p class="border-b-4 border-black w-fit text-xl lg:text-[32px] -mb-0.5 py-2 dark:text-white dark:border-white">
              {{ $t('Popular_News') }}
            </p>
          </div>
            <div class="space-y-8">
              <div v-for="news in popularNews.slice(0, 5)" :key="news.id" class="group">
                <NuxtLink :to="`/detail/${news.category?.slug}/${news.slug}/${news.id}`">
                  <p class="text-[#555555] text-[14px] mb-1 dark:text-gray-200">
                    {{ news.category?.name }} — {{ formatDate(news.published_at) }}
                  </p>
                  <div class="text-sm font-medium line-clamp-2 dark:text-white">
                    {{ news.title }}
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="container mx-auto py-32 text-center">
      <div class="max-w-md mx-auto px-4">
        <h1 class="text-9xl font-bold text-gray-100 dark:text-slate-800">404</h1>
        <h2 class="text-2xl font-bold mt-10 dark:text-white relative">Artikel Tidak Ditemukan</h2>
        <p class="text-gray-500 mt-4">Maaf, artikel dengan
          <span>
            slug <b class="text-red-500">"{{ $route.params.slug }}"</b> / id <b class="text-red-500">"{{ $route.params.id }}"</b>
          </span>
          tidak terdaftar di sistem kami.
        </p>
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
.prose :deep(p) { 
  margin-bottom: 1.5rem; 
}
.prose :deep(img) { 
  border-radius: 1.5rem; 
  margin: 2.5rem 0;
  max-width: 30%;
  max-height: 30%;
  }
</style>