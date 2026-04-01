<template>
  <div class="min-h-screen relative flex flex-col bg-white dark:bg-slate-950">
    <Navbar />
    <div class="grow">
      <slot />
    </div>
    <Footer />
  </div>
</template>