export default defineEventHandler(async () => {
  const baseURL = 'https://api.jovanews.kotasatelit.com'

  try {
    const [catRes, postRes, tagRes] = await Promise.all([
      $fetch<any>('/api/v1/categories', { baseURL }),
      $fetch<any>('/api/v1/posts', { baseURL }),
      $fetch<any>('/api/v1/tags', { baseURL }),
    ])

    const categories = catRes.data.categories ?? []
    const posts = postRes.data.posts.data ?? [] 
    const tags = tagRes.data.tags ?? []

    const lastPage = postRes.data.posts.last_page ?? 1
    if (lastPage > 1) {
      for (let page = 2; page <= lastPage; page++) {
        const res = await $fetch<any>(`/api/v1/posts?page=${page}`, { baseURL })
        posts.push(...(res.data.posts.data ?? []))
      }
    }

    return [
      ...categories.map((c: any) => ({
        loc: `/category/${c.slug}`,
      })),

      ...categories.flatMap((c: any) =>
        (c.sub_categories ?? []).map((sub: any) => ({
          loc: `/category/${sub.slug}`,
        }))
      ),

      ...posts.map((p: any) => ({
        loc: `/detail/${p.slug}/${p.id}`,
        lastmod: p.published_at,
      })),

      ...tags.map((t: any) => ({
        loc: `/tags/${t.slug}`,
      })),
    ]
  } catch (e: any) {
    console.error('Sitemap error:', e.message)
    return []
  }
})