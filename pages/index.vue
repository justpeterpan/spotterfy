<script setup lang="ts">
await new Promise((resolve) => setTimeout(resolve, 10))

const { signIn, signOut, session, status, cookies, user, sessionToken } =
  useAuth()

const { data: stats } = await useFetch('/api/spotify/stats', { lazy: true })

const active = useState()
</script>

<template>
  <div class="flex gap-2 mb-10">
    <button
      v-if="status !== 'authenticated'"
      @click="signIn('spotify')"
      class="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
    >
      Sign In
    </button>
    <button
      v-else
      @click="signOut()"
      class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
    >
      Sign Out
    </button>
  </div>
  <div v-if="status === 'authenticated'" class="grid gap-10">
    <section>
      <h2 class="text-3xl font-bold mb-4">Recently Played</h2>
      <ol class="divide-y divide-gray-100">
        <li v-for="(songs, index) of stats?.recentlyPlayed.items">
          <NuxtLink
            :to="`/track/${songs.track.id}`"
            class="flex justify-between items-center gap-x-6 py-5"
            @click.native="active = songs.track.id"
          >
            <div class="flex min-w-0 gap-x-4 items-center">
              <div class="text-2xl mr-2 text-gray-400">0{{ index + 1 }}</div>
              <img
                :src="songs.track.album.images[0].url"
                :alt="songs.track.name"
                class="h-14 w-14 rounded-sm shadow-md"
                :class="{ active: active === songs.track.id }"
              />
              <div :class="{ active: active === songs.track.id }">
                {{ songs.track.artists[0].name }} - {{ songs.track.name }}
              </div>
            </div>
            <div>
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
  contain: layout;
}
div.active {
  view-transition-name: selected-title;
  contain: layout;
}
</style>
