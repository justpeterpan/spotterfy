<template>
  <div class="min-h-[100svh] max-w-4xl mx-auto dark:text-white">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'p-10 dark:bg-[#1E1E1E] bg-white',
  },
})
</script>
