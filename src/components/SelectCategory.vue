<template>
    <div class="select-category-container">
      <div class="select-category-content">
        <img src="../assets/select-category.png">
        <div class="select-btn">
          <el-button @click="selectCategory">
            <span class="btn-icon iconfont icon-icon-shangchuanmuluwenjianjia"></span>
            <span>上传目录文件夹</span>
          </el-button>
        </div>
      </div>     
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    propMessage: String
  }
})
export default class SelectCategory extends Vue {
  msg: string = 'this is a component named with select-category'

  created() {
    // console.log(`created:${this.msg}`)
  }

  // 计算属性
  get computedMsg(): string {
    return 'computed ' + this.msg
  }

  mounted() {
    // console.log(`mounted:${this.msg}`)
  }

  selectCategory(item: any) {
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'getDirectoryInfo',
      active: true
    })
    try {
      window.IndexActions.getDirectoryInfo()
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;

.select-category-container {
  text-align: center;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: Center;

  .select-category-content {
    position: relative;

    .select-btn {
      position: absolute;
      right: 0;
      bottom: 6px;

      button {
        width: 438px;
        height: 48px;
        display: inline-block;

        .btn-icon {
          font-size: 22px;
          vertical-align: -2px;
        }
      }
    }
  }
}
</style>


