<script setup lang="ts">
definePageMeta({ middleware: 'auth', auth: { guestRedirectTo: '/login' } })

const active = useState('active')
const { signOut, user } = useAuth()
const cachedTracks: Ref<
  SpotifyApi.UsersRecentlyPlayedTracksResponse | undefined
> = useState('tracks')

onBeforeMount(async () => {
  cachedTracks.value = await $fetch('/api/spotify/stats')
})
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
        <li v-for="(songs, index) of cachedTracks?.items">
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
