<template>
  <div class="flex flex-col md:flex-row gap-6 mb-6">
    <NuxtImg
      :src="track?.album.images[0].url"
      alt="album art"
      class="md:w-4/6 md:max-h-[75vh] object-cover md:rounded md:shadow-md"
      format="webp"
      quality="50"
    />
    <section class="flex flex-col p-10 md:p-0">
      <ul class="font-thin">
        <li class="font-bold">
          {{ track?.artists[0].name }} - {{ track?.name }}
        </li>
        <li>Release Date: {{ track?.album.release_date }}</li>
        <li>Popularity: {{ track?.popularity }}</li>
        <li>
          Duration:
          {{ formattedDuration(track?.duration_ms) }} Minutes
        </li>
        <li v-if="track?.restrictions?.reason">
          Restrictions: {{ track?.restrictions?.reason }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: 'p-0 md:p-10',
  },
})

defineProps<{
  track: SpotifyApi.TrackObjectFull
}>()

function formattedDuration(durationInMs: number | undefined) {
  if (durationInMs)
    return `${Math.floor(durationInMs / 1000 / 60)
      .toString()
      .padStart(2, '0')}:${(durationInMs % 60).toString().padStart(2, '0')}`
  return 0
}
</script>

<style scoped>
img {
  view-transition-name: selected-track;
}

section {
  view-transition-name: selected-title;
}
</style>
