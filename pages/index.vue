<script setup lang="ts">
definePageMeta({ middleware: 'auth', auth: { guestRedirectTo: '/login' } })

const active = useState('active')
const { signOut, user } = useAuth()

function concatenateArtists(artists: SpotifyApi.AlbumObjectFull['artists']) {
  if (!artists || artists.length === 0) return ''
  const names = artists.map((artist) => artist.name)
  if (names.length === 1) return names[0]

  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
}

let recentlyPlayedTracks: Array<SpotifyApi.PlayHistoryObject> | undefined
if (!useNuxtApp().payload.data.tracks?.items?.length) {
  const { data: tracks } =
    await useFetch<SpotifyApi.UsersRecentlyPlayedTracksResponse>(
      '/api/spotify/plays',
      {
        key: 'tracks',
        transform: (value) => {
          console.log('transform', value)
          return value
        },
      }
    )
  recentlyPlayedTracks = tracks.value?.items
} else {
  recentlyPlayedTracks = useNuxtApp().payload.data.tracks?.items
}
// const { data: releases } = await useFetch('/api/spotify/followed', {
//   key: 'releases',
// })

const { data: releases } = await useFetch<{
  date: string
  albums: Array<SpotifyApi.AlbumObjectFull>
}>('/api/spotify/releases', {
  key: 'releases',
})

function sortAlbumsByDate() {
  const groupedByDate: { [key: string]: Array<SpotifyApi.AlbumObjectFull> } = {}
  for (const album of releases.value!.albums) {
    if (!groupedByDate[album.release_date]) {
      groupedByDate[album.release_date] = []
    }
    groupedByDate[album.release_date].push(album)
  }
  const sortedAndGrouped: {
    [key: string]: Array<SpotifyApi.AlbumObjectFull>
  } = {}
  Object.keys(groupedByDate)
    .sort()
    .reverse()
    .forEach((date) => {
      sortedAndGrouped[date] = groupedByDate[date]
    })
  console.log(sortedAndGrouped)
  return sortedAndGrouped
}

sortAlbumsByDate()
</script>

<template>
  <div class="flex gap-2 mb-10 justify-between">
    <button
      type="button"
      @click="signOut()"
      class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
    >
      Sign Out
    </button>
    <NuxtImg
      v-if="user?.image"
      :src="user?.image"
      alt="profile image"
      class="h-10 w-10 rounded-full"
      format="webp"
      quality="50"
    />
  </div>

  <div v-if="user?.name" class="grid gap-10">
    <section>
      <h1 class="text-3xl font-bold mb-4">Recently Played</h1>
      <ol class="divide-y divide-gray-100 dark:divide-[#1e1e1e]">
        <li v-for="(songs, index) of recentlyPlayedTracks">
          <NuxtLink
            :to="`/track/${songs.track.id}`"
            class="flex justify-between items-center gap-x-6 py-5"
            @click.native="active = songs.track.id"
          >
            <div class="flex min-w-0 gap-x-4 items-center">
              <div class="text-2xl mr-2 text-gray-400">0{{ index + 1 }}</div>
              <NuxtImg
                :src="songs.track.album.images[0].url"
                :alt="songs.track.name"
                class="h-14 w-14 rounded-sm shadow-md"
                :class="{ active: active === songs.track.id }"
                format="webp"
                quality="50"
              />
              <div :class="{ active: active === songs.track.id }">
                {{ songs.track.artists[0].name }} - {{ songs.track.name }}
              </div>
            </div>
            <div class="hidden sm:block">
              {{
                new Date(songs.played_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </div>
          </NuxtLink>
        </li>
      </ol>
    </section>
    <section v-if="false">
      <h2 class="text-3xl font-bold mb-4">Following</h2>
      <!-- <div v-if="artists">{{ artists }}</div> -->
      <!-- <ul>
        <li
          v-for="artist of followedArtists?.artists.items"
          class="flex justify-between flex-row-reverse py-4 border-b border-gray-700 border-dotted"
        >
          <NuxtImg
            :src="artist.images[0]?.url"
            :alt="artist.name"
            class="w-20 h-20 rounded-sm shadow-sm object-cover"
          />
          <div class="max-w-xs font-thin">
            <NuxtLink :to="artist.external_urls.spotify" class="font-bold">{{
              artist.name
            }}</NuxtLink>
            <br />
            Followers: {{ artist.followers.total }}
            <br />
            <span v-if="artist.genres.length"
              >Genres:
              {{ artist.genres.length ? artist.genres : undefined }}</span
            >
          </div>
          {{ artist }}
        </li>
      </ul> -->
    </section>
    <section>
      <h2 class="text-3xl font-bold mb-4">Releases</h2>
      <ul>
        <li v-for="(albums, date) in sortAlbumsByDate()" class="font-thin">
          <h2 class="text-xl mb-2 font-bold">{{ date }}</h2>
          <ul class="grid grid-cols-1 md:grid-cols-4">
            <li v-for="album in albums" class="w-full md:w-48 mb-10">
              <NuxtLink
                :to="`https://open.spotify.com/${album.type}/${album.id}`"
                target="_blank"
              >
                <NuxtImg
                  :src="album.images[0].url"
                  class="rounded aspect-square w-full md:w-48 md:h-48 mb-4"
                />
                <div class="font-black">
                  {{ concatenateArtists(album.artists) }}
                </div>
                {{ album.name }} ({{ album.album_type }})
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
img.active {
  view-transition-name: selected-track;
}
div.active {
  view-transition-name: selected-title;
}
</style>
