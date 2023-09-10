<template>
  <Detail v-if="cachedTrack" :track="cachedTrack" />
  <NuxtLink to="/" class="text-4xl p-10 sm:p-0">←</NuxtLink>
</template>

<script setup lang="ts">
const id = useRoute().params.id
const tracks: Ref<SpotifyApi.UsersRecentlyPlayedTracksResponse> =
  useState('tracks')
const cachedTrack = tracks.value.items.find((item) => item.track.id === id)
  ?.track
</script>
