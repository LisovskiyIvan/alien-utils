<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { createHighlighter, type Highlighter } from 'shiki'

const props = defineProps<{
  code: string
  language?: string
}>()

const highlighter = ref<Highlighter | null>(null)
const highlighted = ref('')

onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: ['github-dark'],
    langs: ['typescript', 'javascript', 'ts', 'js'],
  })

  updateHighlight()
})

const updateHighlight = () => {
  if (!highlighter.value) return

  highlighted.value = highlighter.value.codeToHtml(props.code, {
    lang: props.language || 'typescript',
    theme: 'github-dark',
  })
}

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
