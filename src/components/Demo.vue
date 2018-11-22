<template>
    <div>{{msg}}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    propMessage: String
  }
})
export default class Demo extends Vue {
  msg: string = 'Welcome to Your Vue.js App'

  created() {
    // console.log(`created:${this.msg}`)
  }

  // 计算属性
  get computedMsg() {
    return 'computed ' + this.$props.propMessage
  }

  mounted() {
    // console.log(`mounted:${this.msg}`)
  }
}
</script>

<style lang="scss">
</style>


