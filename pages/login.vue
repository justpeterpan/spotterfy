<script setup lang="ts">
definePageMeta({
  middleware: 'guest-only',
  auth: { authenticatedRedirectTo: '/' },
})

const { signIn } = useAuth()
</script>

<template>
  <button
    @click="signIn('spotify')"
    type="button"
    class="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
  >
    Sign In
  </button>
</template>
