<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
// 引入图标库
import './sass/icons/iconfont.css'
import './sass/icons/iconfont.js'
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  name: 'app'
})
export default class App extends Vue {
  created() {
    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 123) {
        try {
          window.DebugActions.debug()
        } catch (error) {}
      }
    })
  }
}
</script>

<style>
#app {
  height: 100%;
}
</style>
