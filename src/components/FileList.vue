<template>
    <div>{{selectTreeNode.data}}</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    selectTreeNode: {
      type: Object,
      default() {
        return {}
      }
    }
  }
})
export default class FileList extends Vue {
  created() {
    // console.log(`created:${this.name}`)
  }

  mounted() {
    this.$nextTick(function() {})
  }
}
</script>

<style lang="scss">
</style>


