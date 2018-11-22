<template>
    <el-breadcrumb separator="/" class="auto-category-bread-crumb">
      <el-breadcrumb-item v-for="(item,index) in breadCrumbs" @click.native="getNowCrumb(item,index)" :key="index">{{item.label}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    propMessage: String,
    // 选中的树节点
    breadCrumbs: {
      type: Array,
      default() {
        return {}
      }
    }
  }
})
export default class Demo extends Vue {
  msg: string = 'Welcome to Your Vue.js App'

  created() {
    // console.log(`created:${this.selectTreeNode}`)
  }

  // 计算属性
  get computedMsg() {
    return 'computed ' + this.$props.propMessage
  }
  getNowCrumb(item, index) {
    this.$props.breadCrumbs.splice(index + 1)
    this.$root.$data.eventHub.$emit('updateNowCrumb', item)
  }
  mounted() {
    // console.log(`mounted:${this.msg}`)
  }
}
</script>

<style lang="scss">
.auto-category-bread-crumb {
  margin-top: 20px;
  margin-left: 23px;

  .el-breadcrumb__inner.is-link {
    font-weight: 500;
    color: #999;
  }
  .el-breadcrumb__inner {
    color: #999;
    cursor: pointer;
    font-weight: 400;
  }
  .el-breadcrumb__inner a,
  .el-breadcrumb__inner.is-link {
    font-weight: 400;
    color: #999;
  }
  .el-breadcrumb__inner:hover {
    color: #42a0f8;
  }
  .el-breadcrumb__item:last-child .el-breadcrumb__inner {
    color: #333;
    font-weight: 600;
  }
}
</style>


