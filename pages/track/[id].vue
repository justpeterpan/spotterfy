<template>
  <div class="flex gap-6 mb-6">
    <img
      :src="track?.album.images[0].url"
      alt=""
      class="w-1/2 max-h-[75vh] object-cover rounded"
    />
    <section>{{ track?.artists[0].name }} - {{ track?.name }}</section>
  </div>
  <NuxtLink to="/" class="text-4xl">←</NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: track } = await useFetch(
  `/api/spotify/track?id=${route.params.id}`
)
</script>

<style scoped>
img {
  view-transition-name: selected-track;
}

section {
  view-transition-name: selected-title;
}
</style>
