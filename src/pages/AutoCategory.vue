<template>
  <el-container v-if="treeData.length" class="auto-category-container" 
    v-loading="loading.show" element-loading-background="rgba(255, 255, 255, 0.8)" :element-loading-text="loading.text">
    <el-aside  width="360px">
      <div class="aside-header">
        <span class="aside-header-title"><span class="aside-header-title-name">卷宗目录</span></span>
        <span class="aside-header-btns">
          <el-dropdown>
            <span class="el-dropdown-link">
              <i class="iconfont icon-icon-shangchuan"></i>
              上传
            </span>
            <el-dropdown-menu  class="category-dropdown-tree" slot="dropdown">
              <el-dropdown-item @click.native="uploadDirectoryImg"><span class="iconfont icon-icon-shangchuanmulutupian"></span>上传目录图片</el-dropdown-item>
              <el-dropdown-item :divided="true" @click.native="uploadDirectoryFloder"><span class="iconfont icon-icon-shangchuanmuluwenjianjia"></span>上传目录文件夹</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span class="aside-header-reset" @click="reset"><i class="iconfont icon-icon-zhongzhi"></i>重置</span>
        </span>
      </div>
      <category-tree :treeData.sync="treeData"></category-tree>
    </el-aside>
    <el-main>
      <div class="main-header">
        <span class="main-header-title"><file-bread-crumb v-if="breadCrumbs.length>0" :breadCrumbs.sync="breadCrumbs"></file-bread-crumb></span>
        <span class="main-header-btns">
          <!-- <span class="btn"><i class="iconfont icon-icon-shengchengshuangcengPDF"></i>生成双层PDF</span> -->
          <span class="btn" @click="createDossier"><i class="iconfont icon-icon-shengchengjuanzong"></i>生成卷宗</span>
          <span class="btn" @click="createCategory"><i class="iconfont icon-icon-juanzongbianmu"></i>生成目录</span>
        </span>
      </div>
      <file-list v-if="selectTreeNode" :selectTreeNode.sync="selectTreeNode"></file-list>
    </el-main>
  </el-container>
  <select-category v-else></select-category>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SelectCategory from '@/components/SelectCategory.vue'
import CategoryTree from '@/components/CategoryTree.vue'
import FileList from '@/components/FileList.vue'
import Utils from '../utils/utils'
import FileBreadCrumb from '@/components/FileBreadCrumb.vue'
@Component({
  components: { SelectCategory, CategoryTree, FileList, FileBreadCrumb }
})
export default class AutoCategory extends Vue {
  addDirectories: Array<Object> = []
  addFiles: Array<Object> = []
  addMenuFiles: Array<Object> = []
  treeData: any = []
  breadCrumbs: Array<Object> = []
  selectTreeNode: any = null
  // 加载状态
  loading: any = {
    show: false,
    text: '加载中'
  }

  created() {}

  mounted() {
    this.$nextTick(function() {
      // 解绑事件
      this.offEvent()
      // 绑定事件
      this.bindEvent()
    })
  }

  // 绑定事件
  bindEvent() {
    this.$root.$data.eventHub.$on('index', (data: any) => {
      this.uploadDirectoryImgCallback(data.catogoryInfo)
      this.uploadDirectoryFolderCallback(data.catogoryFiles)
      this.getFilesCallback(data.getFiles)
      this.updateTreeData(data.addDirectories)
      this.createCataloguesCallback(data.CreateCataloguesInfo)
      this.createCataloguesMenuCallback(data.CreateCataloguesMenuInfo)
    })
    this.$root.$data.eventHub.$on('setSelectTreeNode', (node: any) => {
      this.breadCrumbs = []
      let selectNode = node
      // 面包屑只显示到文件夹
      if (node.data.type === 1) {
        this.breadCrumbs.push({
          id: node.data.id,
          level: node.level,
          label: node.label
        })
      } else {
        selectNode = node.parent
      }

      this.pushBreadCrumbs(node)
      this.selectTreeNode = selectNode
    })
    this.$root.$data.eventHub.$on('updateNowCrumb', (data: any) => {
      console.log(data)
    })

    this.$root.$data.eventHub.$on('page2login', this.clearData)
  }

  // 解绑事件
  offEvent() {
    this.$root.$data.eventHub.$off('index')
    this.$root.$data.eventHub.$off('setSelectTreeNode')
  }

  pushBreadCrumbs(node) {
    if (node.level > 1) {
      this.breadCrumbs.push({
        id: node.parent.data.id,
        level: node.parent.level,
        label: node.parent.label
      })
      this.breadCrumbs.sort(this.compare)
      this.pushBreadCrumbs(node.parent)
    }
  }

  compare(obj1, obj2) {
    let val1 = obj1.level
    let val2 = obj2.level
    if (val1 < val2) {
      return -1
    } else if (val1 > val2) {
      return 1
    } else {
      return 0
    }
  }

  // 上传目录图片
  uploadDirectoryImg() {
    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'uploadDirectoryImg',
      active: true
    })
    try {
      window.IndexActions.uploadDirectoryImg(this.treeData[0].fullName)
    } catch (error) {
      console.log(error)
    }
  }

  // 上传目录图片回调
  uploadDirectoryImgCallback(catogoryInfo) {
    const isActionActive = this.$store.getters.isModuleActionActive('index', 'uploadDirectoryImg')

    if (!isActionActive) {
      return
    }

    if (!catogoryInfo || !this.treeData.length) {
      return
    }

    const status: number = catogoryInfo.status
    switch (status) {
      case 202:
        this.loading.show = true
        this.loading.text = '目录图片识别中'
        break
      case 500:
        // 数据使用后将当前模块取消激活
        this.$store.dispatch('setModuleActionStatus', {
          moduleName: 'index',
          action: 'uploadDirectoryImg',
          active: false
        })
        this.$message({
          message: catogoryInfo.message || '目录图片解析失败',
          type: 'warning'
        })
        this.loading.show = false
        this.loading.text = ''
        break
      case 200:
        // 数据使用后将当前模块取消激活
        this.$store.dispatch('setModuleActionStatus', {
          moduleName: 'index',
          action: 'uploadDirectoryImg',
          active: false
        })
        this.loading.show = false
        this.loading.text = ''
        if (catogoryInfo.data.path.indexOf(this.treeData[0].fullName) > -1) {
          this.$root.$data.eventHub.$emit('uploadDirectoryImgSuccess', catogoryInfo.data)
        } else {
          this.$alert('请在当前卷宗目录中选择目录图片', '提示', {
            type: 'warning'
          })
        }
        break
      default:
    }
  }

  // 上传目录文件夹
  uploadDirectoryFloder() {
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'uploadDirectoryFloder',
      active: true
    })
    try {
      window.IndexActions.uploadDirectoryFloder(this.treeData[0].fullName)
    } catch (error) {
      console.log(error)
    }
  }

  // 上传目录文件夹回调
  uploadDirectoryFolderCallback(catogoryFiles) {
    const isActionActive = this.$store.getters.isModuleActionActive('index', 'uploadDirectoryFloder')
    if (!isActionActive) {
      return
    }

    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'uploadDirectoryFloder',
      active: false
    })

    if (!catogoryFiles || catogoryFiles.length === 0) {
      return
    }

    const data = catogoryFiles[0]
    if (data.fullName.indexOf(this.treeData[0].fullName) > -1) {
      this.$root.$data.eventHub.$emit('uploadDirectoryFolderSuccess', catogoryFiles)
    } else {
      this.$alert('请在当前卷宗目录中选择文件夹', '提示', {
        type: 'warning'
      })
    }
  }

  // 上传文件回调
  getFilesCallback(files) {
    const isActionActive = this.$store.getters.isModuleActionActive('index', 'getFiles')
    if (!isActionActive) {
      return
    }

    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'getFiles',
      active: false
    })

    if (files.length === 0) {
      return
    }

    if (files[0].path.indexOf(this.treeData[0].fullName) > -1) {
      this.$root.$data.eventHub.$emit('uploadFiles', files)
    } else {
      this.$alert('请在当前卷宗目录中选择文件', '提示', {
        type: 'warning'
      })
    }
  }

  // 更新树形结构数据
  updateTreeData(data: Array<Object>) {
    const isActionActive = this.$store.getters.isModuleActionActive('index', 'getDirectoryInfo')
    if (!isActionActive) {
      return
    }
    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'getDirectoryInfo',
      active: false
    })

    const treeData: any = data[0]
    if (!treeData) {
      return
    }

    if (treeData.children.length === 0) {
      this.$alert('案件文件夹不能为空', '提示', {
        type: 'warning'
      })
      return
    }

    data.forEach(item => {
      Utils.categoryTreeDataFormat(item)
    })
    this.treeData = data
  }

  // 重置
  reset() {
    this.$confirm('此操作将清空卷宗目录结构, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        this.clearData()
      })
      .catch(() => {
        this.$message('已取消')
      })
  }

  // 清空数据
  clearData() {
    this.treeData = []
    this.selectTreeNode = null
    this.breadCrumbs = []
  }

  // 生成卷宗
  createDossier() {
    if (this.treeData.length === 0 || this.treeData[0].children.length === 0) {
      this.$alert('请确保您的卷宗目录不为空时再进行操作', '提示', {
        type: 'warning'
      })
      return
    }

    this.$confirm('卷宗制作过程中将不能操作鼠标和键盘，否则会影响卷宗制作, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        this.$store.dispatch('setModuleActionStatus', {
          moduleName: 'index',
          action: 'createCatalogues',
          active: true
        })
        const dataStr = JSON.stringify(this.treeData)

        try {
          this.loading.show = true
          this.loading.text = '卷宗正在制作，请勿操作鼠标或键盘'
          window.IndexActions.createCatalogues(dataStr)
        } catch (error) {
          console.log(error)
        }
      })
      .catch(() => {
        this.$message('已取消')
      })
  }

  // 卷宗制作回调
  createCataloguesCallback(createCataloguesInfo) {
    const isActionActive = this.$store.getters.isModuleActionActive('index', 'createCatalogues')
    if (!isActionActive) {
      return
    }
    if (!createCataloguesInfo) {
      return
    }

    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'createCatalogues',
      active: false
    })

    this.loading.show = false
    this.loading.text = ''
    if (createCataloguesInfo.code === '200') {
      this.$message({
        message: createCataloguesInfo.message,
        type: 'success'
      })
    } else {
      this.$message({
        message: createCataloguesInfo.message,
        type: 'warning'
      })
    }
  }

  // 生成目录
  createCategory() {
    if (this.treeData.length === 0 || this.treeData[0].children.length === 0) {
      this.$alert('请确保您的卷宗目录不为空时再进行操作', '提示', {
        type: 'warning'
      })
      return
    }

    this.$confirm('目录生成过程中将不能操作鼠标和键盘，否则会影响目录生成, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        this.$store.dispatch('setModuleActionStatus', {
          moduleName: 'index',
          action: 'createCataloguesMenu',
          active: true
        })
        const dataStr = JSON.stringify(this.treeData)

        try {
          this.loading.show = true
          this.loading.text = '目录正在生成，请勿操作鼠标或键盘'
          window.IndexActions.createCataloguesMenu(dataStr)
        } catch (error) {
          console.log(error)
        }
      })
      .catch(() => {
        this.$message('已取消')
      })
  }

  // 卷宗制作回调
  createCataloguesMenuCallback(createCataloguesMenuInfo) {
    const isActionActive = this.$store.getters.isModuleActionActive('index', 'createCataloguesMenu')
    if (!isActionActive) {
      return
    }
    if (!createCataloguesMenuInfo) {
      return
    }

    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'createCataloguesMenu',
      active: false
    })
    this.loading.show = false
    this.loading.text = ''
    if (createCataloguesMenuInfo.code === '200') {
      this.$message({
        message: createCataloguesMenuInfo.message,
        type: 'success'
      })
    } else {
      this.$message({
        message: createCataloguesMenuInfo.message,
        type: 'warning'
      })
    }
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;

.auto-category-container {
  .el-aside {
    background-color: #fff;
    border-right: 1px solid #f0f4f7;
    width: 200px;

    .aside-header {
      height: 55px;
      line-height: 55px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;

      .aside-header-title {
        margin-left: 16px;
        padding-left: 8px;
        position: relative;

        .aside-header-title-name {
          vertical-align: middle;
        }

        &::before {
          vertical-align: middle;
          content: '';
          display: inline-block;
          height: 18px;
          width: 3px;
          margin-right: 8px;
          background-color: $defaultBlue;
        }
      }

      .aside-header-btns {
        float: right;
        position: relative;
        color: $defaultBlue;

        .el-dropdown-link {
          cursor: pointer;
          color: $defaultBlue;
          margin-right: 16px;
          height: 100%;
          display: inline-block;
        }

        .aside-header-reset {
          margin-right: 12px;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .el-main {
    background-color: #fff;
    padding: 0;
    position: relative;
    overflow: hidden;

    .main-header {
      height: 55px;
      line-height: 55px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
      position: relative;

      .main-header-title {
        margin-left: 16px;
        padding-left: 8px;
        position: relative;
        display: inline-block;
        width: calc(100% - 240px);

        &::before {
          vertical-align: middle;
          content: '';
          display: inline-block;
          height: 18px;
          width: 3px;
          margin-right: 8px;
          background-color: $defaultBlue;
        }
      }

      .main-header-btns {
        float: right;
        position: relative;

        .btn {
          display: inline-block;
          height: 100%;
          padding: 0 12px;
          border-left: 1px solid #ddd;
          color: $defaultBlue;
          cursor: pointer;

          &:hover {
            color: $hoverBlue;
          }
        }
      }
    }
  }
}

.category-dropdown-tree {
  li {
    line-height: 30px;
  }

  &.el-popper[x-placement^='bottom'] {
    margin-top: 0px;

    .popper__arrow {
      display: none;
    }
  }
}
</style>


