<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { getHighlighter } from '@/utils/shiki'

const props = defineProps<{
  code: string
  language?: string
}>()

const highlighted = ref('')

const updateHighlight = async () => {
  const highlighter = await getHighlighter()
  highlighted.value = highlighter.codeToHtml(props.code, {
    lang: props.language || 'typescript',
    theme: 'github-dark',
  })
}

onMounted(() => {
  updateHighlight()
})

watch(() => props.code, () => {
  updateHighlight()
})

const highlightedHTML = computed(() => highlighted.value)
</script>

<template>
  <div class="rounded-lg overflow-hidden" v-html="highlightedHTML"></div>
</template>

<style>
.shiki {
  background-color: #0d1117 !important;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.shiki code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
