<template>
    <el-container class="auto-catgory-container">
        <el-header>
          <span class="header-title">卷宗自动编目</span>
          <span class="header-title-btns">
            <span cfx-ui-command="minimize" class="iconfont icon-zuixiaohua" title="最小化"></span>
            <span cfx-ui-command="close" class="iconfont icon-guanbi" title="关闭"></span>
          </span>
        </el-header>
        <el-container class="main-content">
            <el-aside width="360px">
              <div class="aside-header">
                <span class="aside-header-title">卷宗目录</span>
                <a class="aside-header-reset" @click="reset">重置</a>
              </div>
              <select-catgory v-if="treeData.length === 0"></select-catgory>
              <catgory-tree v-else :treeData.sync="treeData"></catgory-tree>
            </el-aside>
            <el-main>
              <div class="main-header">
                <span class="main-header-title">目录制作</span>
              </div>
              <no-file v-if="!selectTreeNode"></no-file>
              <file-list v-else :selectTreeNode.sync="selectTreeNode"></file-list>
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
import FileList from '@/components/FileList.vue'

@Component({
  components: { SelectCatgory, NoFile, CatgoryTree, FileList }
})
export default class Main extends Vue {
  addDirectories: Array<Object> = []
  addFiles: Array<Object> = []
  addMenuFiles: Array<Object> = []
  treeData: any = [
    // {
    //   fullName: '',
    //   name: '根目录',
    //   path: '',
    //   type: 0,
    //   children: [
    //     {
    //       fullName: '',
    //       name: '文件夹1',
    //       path: '',
    //       type: 0,
    //       children: []
    //     }
    //   ]
    // }
  ]
  selectTreeNode: any = null

  created() {
    this.$root.$data.eventHub.$on('index', (data: any) => {
      console.log('data from winform emit')
      console.log(data)
      this.updateTreeData(data.addDirectories)
    })
    this.$root.$data.eventHub.$on('setSelectTreeNode', (node: any) => {
      this.selectTreeNode = node
    })
  }

  mounted() {
    // console.log(`mounted:${this.treeData}`)
  }

  // 更新树形结构数据
  updateTreeData(data: Array<Object>) {
    this.treeData = data
  }

  reset() {
    this.treeData = []
    this.selectTreeNode = null
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

    .header-title-btns {
      float: right;
      span {
        cursor: pointer;
      }
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


