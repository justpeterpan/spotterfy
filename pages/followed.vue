<script setup lang="ts">
definePageMeta({ middleware: 'auth', auth: { guestRedirectTo: '/login' } })

const releases = ref()

function filterAlbumsByDate(albums, date) {
  const filterAlbums = []
  albums.forEach((album) => {
    const returnedAlbums = album.releases.filter((artistalbum) => {
      return new Date(artistalbum.release_date) >= new Date(date)
    })
    const newArtists = { name: album.name, releases: returnedAlbums }
    filterAlbums.push({ name: album.name, releases: returnedAlbums })
  })
  const onlyWithAlbums = filterAlbums.filter((artist) => artist.releases.length)
  return onlyWithAlbums
}

onBeforeMount(async () => {
  const albums = await $fetch('/api/spotify/releases')
  const filteredAlbums = filterAlbumsByDate(albums, '2023-09-14')
  console.log(filteredAlbums)
  releases.value = filteredAlbums
})
</script>

<template>
  <div>
    <h1 class="text-3xl mb-10">Releases</h1>
    <div v-for="release in releases" :key="release.name">
      <h3 class="text-2xl font-black">{{ release.name }}</h3>
      <ul>
        <li v-for="(album, index) in release.releases">
          <NuxtLink
            :to="album.external_urls.spotify"
            class="flex justify-between"
          >
            <div>{{ index + 1 }}. {{ album.name }}</div>
            <span class="font-bold">
              {{ album.release_date }} | {{ album.album_type }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
