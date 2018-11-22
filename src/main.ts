// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './sass/default.scss'
// 自定义window上的参数
import './typings/ts-declare'
import store from './store'
Vue.config.productionTip = false
Vue.use(ElementUi)

/* eslint-disable no-new */
const vm = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  data: {
    eventHub: new Vue()
  },
  store,
  components: { App },
  methods: {
    updateData(data: any) {
      console.log('store:')
      console.log(data)
      Object.keys(data).forEach(key => {
        // 只向激活模块推送数据
        const isModuleActive = this.$store.getters.isModuleActive(key)
        const obj: Object = data[key]
        isModuleActive && this.$root.$data.eventHub.$emit(key, obj);
      })
    },
  }
})

window.vm = vm



