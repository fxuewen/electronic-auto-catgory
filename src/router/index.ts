import Vue, { AsyncComponent } from 'vue'
import Router, { RouteConfig, Route, NavigationGuard } from 'vue-router'

const Login: AsyncComponent = (): any => import('@/pages/Login.vue')
const Admin: AsyncComponent = (): any => import('@/pages/Admin.vue')
const AutoCategory: AsyncComponent = (): any => import('@/pages/AutoCategory.vue')
const AutoDetection: AsyncComponent = (): any => import('@/pages/AutoDetection.vue')

Vue.use(Router)

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Admin',
    component: Admin,
    children: [
      {
        path: '/category',
        name: 'AutoCategory',
        meta: {
          keepAlive: true
        },
        component: AutoCategory
      },
      {
        path: '/detection',
        name: 'AutoDetection',
        meta: {
          keepAlive: true
        },
        component: AutoDetection
      }
    ],
    redirect: '/category'
  }
]

const router: Router = new Router({
  // mode: 'history',
  base: '/',
  routes
})

export default router
