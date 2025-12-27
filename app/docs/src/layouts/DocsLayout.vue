<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, RefreshCw, Diamond, CheckCircle, Target, ArrowRightLeft, ArrowUpDown, Layers, List } from 'lucide-vue-next'

const route = useRoute()

const sections = [
  { id: 'iter' as const, label: 'Iter', icon: RefreshCw, path: '/docs/iter', color: 'pink' },
  { id: 'option' as const, label: 'Option', icon: Diamond, path: '/docs/option', color: 'blue' },
  { id: 'result' as const, label: 'Result', icon: CheckCircle, path: '/docs/result', color: 'green' },
  { id: 'match' as const, label: 'Match', icon: Target, path: '/docs/match', color: 'purple' },
  { id: 'dispatch' as const, label: 'Dispatch', icon: ArrowRightLeft, path: '/docs/dispatch', color: 'orange' },
  { id: 'bimap' as const, label: 'Bimap', icon: ArrowUpDown, path: '/docs/bimap', color: 'cyan' },
  { id: 'stack' as const, label: 'Stack', icon: Layers, path: '/docs/stack', color: 'rose' },
  { id: 'queue' as const, label: 'Queue', icon: List, path: '/docs/queue', color: 'yellow' },
]

const colorClasses: Record<string, { active: string; icon: string }> = {
  pink: {
    active: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/50',
    icon: 'text-pink-400'
  },
  blue: {
    active: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/50',
    icon: 'text-blue-400'
  },
  green: {
    active: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border border-green-500/50',
    icon: 'text-green-400'
  },
  purple: {
    active: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/50',
    icon: 'text-purple-400'
  },
  orange: {
    active: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-orange-500/50',
    icon: 'text-orange-400'
  },
  cyan: {
    active: 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-white border border-cyan-500/50',
    icon: 'text-cyan-400'
  },
  rose: {
    active: 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-white border border-rose-500/50',
    icon: 'text-rose-400'
  },
  yellow: {
    active: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-white border border-yellow-500/50',
    icon: 'text-yellow-400'
  }
}

const getColorClass = (color: string) => colorClasses[color] || { active: '', icon: '' }
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex">
    <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div class="p-6 border-b border-gray-800">
        <router-link to="/" class="block">
          <h1 class="text-2xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Utils Library
          </h1>
          <p class="text-sm text-gray-400 mt-1">TypeScript Utilities</p>
        </router-link>
      </div>

      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li v-for="section in sections" :key="section.id">
            <router-link
              :to="section.path"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200"
              :class="route.path === section.path
                ? getColorClass(section.color).active
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'"
            >
              <component :is="section.icon" :class="`w-5 h-5 ${route.path === section.path ? 'text-white' : getColorClass(section.color).icon}`" />
              <span class="font-medium">{{ section.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <p class="text-xs text-gray-500 text-center">
          Rust-inspired TypeScript utilities
        </p>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
