<script setup lang="ts">
definePageMeta({ middleware: 'auth', auth: { guestRedirectTo: '/login' } })

const releases = ref()

onBeforeMount(async () => {
  releases.value = await $fetch('/api/spotify/releases')
})
</script>

<template>
  <div>
    <h1 class="text-3xl mb-10">Releases</h1>
    <div v-for="(release, artistName) in releases" :key="artistName">
      <h3 class="text-2xl font-black">{{ artistName }}</h3>
      <ul>
        <li
          v-for="(album, index) in release.items"
          class="flex justify-between"
        >
          <div>{{ index + 1 }}. {{ album.name }}</div>
          <span class="font-bold">
            {{ album.release_date }} | {{ album.album_type }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
