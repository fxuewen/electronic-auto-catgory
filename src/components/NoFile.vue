<template>
    <div class="catgory-no-file">
      <div class="catgory-no-file-img"></div>
      <div>暂无卷宗文件，请先上传卷宗目录。您可通过以下两种方式创建卷宗目录</div>
      <div>
        <el-button plain>上传目录文件</el-button>
        <el-button plain>上传本地文件夹</el-button>
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
export default class SelectCatgory extends Vue {
  msg: string = 'Welcome to Your Vue.js App'
  name: string = ''

  data() {
    return {
      // Will be reactive
      msg: 'msg',
      name: 'name'
    }
  }

  created() {
    console.log(`created:${this.name}`)
  }

  // 计算属性
  get computedMsg() {
    return 'computed ' + this.msg
  }

  mounted() {
    console.log(`mounted:${this.name}`)
  }

  getMsg(): string {
    return this.msg
  }
}
</script>

<style lang="scss">
.catgory-no-file {
  text-align: center;

  .catgory-no-file-img {
    margin-top: 180px;
    width: 100px;
    height: 100px;
  }
}
</style>


