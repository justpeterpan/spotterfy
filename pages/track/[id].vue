<template>
  <Detail v-if="track" :track="track" />
  <NuxtLink to="/" class="text-4xl">←</NuxtLink>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: track } = await useFetch(
  `/api/spotify/track?id=${route.params.id}`,
  {
    key: `track-${route.params.id}`,
    lazy: true,
  }
)
</script>
