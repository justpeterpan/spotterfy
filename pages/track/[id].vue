<template>
  <Detail v-if="track" :track="track" />
  <NuxtLink to="/" class="text-4xl p-10 sm:p-0">←</NuxtLink>
</template>

<script setup lang="ts">
const id = useRoute().params.id

let track: SpotifyApi.TrackObjectFull | null
if (!useNuxtApp().payload.data.tracks?.items?.length) {
  const { data } = await useFetch<SpotifyApi.TrackObjectFull>(`/api/spotify/track?id=${id}`)
  track = data.value
} else {
  const data = useNuxtApp().payload.data.tracks.items.find(
      (item: SpotifyApi.PlayHistoryObject) => item.track.id === id
  )
  track = data.track
}
</script>
