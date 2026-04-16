<script setup>
const site = useSiteConfig()
const { fetchActiveLocales } = useActiveLocales()

await fetchActiveLocales()

useSchemaOrg([
  defineWebSite({
    name: site.name,
    url: site.url,
    potentialAction: [
      defineSearchAction({
        target: `${site.url}/search?q={search_term_string}`
      })
    ]
  })
])
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
