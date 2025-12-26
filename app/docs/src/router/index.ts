import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import IterDocs from '@/views/IterDocs.vue'
import OptionDocs from '@/views/OptionDocs.vue'
import ResultDocs from '@/views/ResultDocs.vue'
import MatchDocs from '@/views/MatchDocs.vue'
import DispatchDocs from '@/views/DispatchDocs.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/iter',
      name: 'iter',
      component: IterDocs,
    },
    {
      path: '/option',
      name: 'option',
      component: OptionDocs,
    },
    {
      path: '/result',
      name: 'result',
      component: ResultDocs,
    },
    {
      path: '/match',
      name: 'match',
      component: MatchDocs,
    },
    {
      path: '/dispatch',
      name: 'dispatch',
      component: DispatchDocs,
    },
  ],
})

export default router
