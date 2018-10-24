import Vue, { AsyncComponent } from 'vue'
import Router, { RouteConfig, Route, NavigationGuard } from 'vue-router'

const Main: AsyncComponent = (): any => import('@/pages/Main.vue')

Vue.use(Router)

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'Main',
    component: Main
  }
]

const router: Router = new Router({
  // mode: 'history',
  base: '/',
  routes
})

export default router
