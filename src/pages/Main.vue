<template>
    <el-container class="auto-catgory-container">
        <el-header>
          <span class="header-title">卷宗自动编目</span>
        </el-header>
        <el-container class="main-content">
            <el-aside width="260px">
              <div class="aside-header">
                <span class="aside-header-title">卷宗目录</span>
                <a class="aside-header-reset">重置</a>
              </div>
              <select-catgory v-if="this.treeData.length === 0"></select-catgory>
              <catgory-tree v-else :treeData="treeData" :propMessage="'1111111'"></catgory-tree>
            </el-aside>
            <el-main>
              <div class="main-header">
                <span class="main-header-title">目录制作</span>
              </div>
              <no-file></no-file>
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SelectCatgory from '@/components/SelectCatgory.vue'
import NoFile from '@/components/NoFile.vue'
import CatgoryTree from '@/components/CatgoryTree.vue'

@Component({
  components: { SelectCatgory, NoFile, CatgoryTree }
})
export default class Main extends Vue {
  msg: string = 'vue-component-class'
  addDirectories: Array<Object> = []
  addFiles: Array<Object> = []
  addMenuFiles: Array<Object> = []
  treeData: Array<Object> = [
    // {
    //   name: '根目录',
    //   address: '',
    //   children: [
    //     {
    //       name: '1-卷宗文件夹',
    //       address: '',
    //       children: [
    //         {
    //           name: '1-1-卷宗文件夹',
    //           address: '',
    //           children: [
    //             { name: '5.jpg', address: '', children: [] },
    //             { name: '6.jpg', address: '', children: [] }
    //           ]
    //         },
    //         { name: '1.jpg', address: '', children: [] },
    //         { name: '2.jpg', address: '', children: [] }
    //       ]
    //     },
    //     {
    //       name: '2-卷宗文件夹',
    //       address: '',
    //       children: [
    //         { name: '3.jpg', address: '', children: [] },
    //         { name: '4.jpg', address: '', children: [] }
    //       ]
    //     }
    //   ]
    // }
  ]

  created() {
    this.$root.$data.eventHub.$on('index', function(data: Object) {
      console.log('data from winform emit')
      console.log(data)
    })
  }

  // 计算属性
  get computedMsg() {
    return 'computed ' + this.msg
  }

  mounted() {
    // console.log(`mounted:${this.msg}`)
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;

.auto-catgory-container {
  height: 100%;

  header {
    background-color: $defaultBlue;
    color: #fff;
    line-height: 60px;

    .header-title {
      font-size: 18px;
    }
  }

  .main-content {
    background-color: #f5f5f5;

    .el-aside {
      background-color: #fff;
      margin-right: 16px;
      width: 200px;

      .aside-header {
        height: 40px;
        line-height: 40px;
        background-color: #fff;
        border-bottom: 1px solid #ddd;

        .aside-header-title {
          margin-left: 16px;
          padding-left: 8px;
          border-left: 4px solid $defaultBlue;
        }

        .aside-header-reset {
          float: right;
          margin-right: 12px;
          cursor: pointer;
          color: $defaultBlue;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .el-main {
      background-color: #fff;
      padding: 0;

      .main-header {
        height: 40px;
        line-height: 40px;
        background-color: #fff;
        border-bottom: 1px solid #ddd;

        .main-header-title {
          margin-left: 16px;
          padding-left: 8px;
          border-left: 4px solid $defaultBlue;
        }
      }
    }
  }
}
</style>


