<template>
  <Detail v-if="cachedTrack" :track="cachedTrack" />
  <NuxtLink to="/" class="text-4xl p-10 sm:p-0">←</NuxtLink>
</template>

<script setup lang="ts">
const id = useRoute().params.id
let cachedTrack: Ref<SpotifyApi.TrackObjectFull | undefined | null> = ref()

onMounted(async () => {
  const tracks: Ref<SpotifyApi.UsersRecentlyPlayedTracksResponse> =
    useState('tracks')
  if (tracks.value) {
    cachedTrack.value = tracks.value.items.find((item) => item.track.id === id)
      ?.track
  } else {
    cachedTrack.value = await $fetch(`/api/spotify/track?id=${id}`)
  }
})
</script>
