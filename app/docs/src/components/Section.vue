<script setup lang="ts">
const props = defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="bg-gray-900 rounded-lg p-6 mb-8">
    <h2 v-if="title" class="text-2xl font-bold text-white mb-4">{{ title }}</h2>
    <slot />
  </div>
</template>
