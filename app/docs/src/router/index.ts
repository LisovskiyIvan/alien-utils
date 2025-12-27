import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DocsLayout from '@/layouts/DocsLayout.vue'
import IterDocs from '@/views/IterDocs.vue'
import OptionDocs from '@/views/OptionDocs.vue'
import ResultDocs from '@/views/ResultDocs.vue'
import MatchDocs from '@/views/MatchDocs.vue'
import DispatchDocs from '@/views/DispatchDocs.vue'
import BimapDocs from '@/views/BimapDocs.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/docs',
      component: DocsLayout,
      children: [
        { path: '', redirect: '/docs/iter' },
        { path: 'iter', name: 'iter', component: IterDocs },
        { path: 'option', name: 'option', component: OptionDocs },
        { path: 'result', name: 'result', component: ResultDocs },
        { path: 'match', name: 'match', component: MatchDocs },
        { path: 'dispatch', name: 'dispatch', component: DispatchDocs },
        { path: 'bimap', name: 'bimap', component: BimapDocs },
      ],
    },
  ],
})

export default router
