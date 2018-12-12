<template>
  <div class="file-list-container">
    <div class="tool-btns">
      <span class="btn upload" @click="getFiles"><i class="iconfont icon-icon-shangchuan"></i>上传</span>
      <span class="btn delete" @click="deleteFiles"><i class="iconfont icon-icon-shanchu"></i>删除</span>
      <el-checkbox v-if="false" class="select" v-model="checkAll" @change="selectAll">全选</el-checkbox>
    </div>

     <div :class="['file-list-container-scrollbar', {'boardOpend': !cancelPreviewFlag}]" v-if="selectTreeNode.data.type === 1 && selectTreeNode.data.children.length === 0" class="no-result">
      <img src="../assets/no_result.png">
      <p>该文件夹为空</p>
    </div>

    <el-scrollbar v-else 
    :class="['file-list-container-scrollbar', {'boardOpend': !cancelPreviewFlag}]">
      <transition-group tag="div" class="file-list-content" ref="fileListContent"
        @drop="dragend($event)" @dragend="dragend($event)">
        <div v-if="!selectTreeNode.data.children.length" class="item" :key="selectTreeNode.data.name">
          <div class="container">
            <div :class="['item-header', {'folder': selectTreeNode.data.type==1, 'file': selectTreeNode.data.type==0}]">
              <span class="file-title" :title="selectTreeNode.data | getFolderName">{{selectTreeNode.data | getFolderName}}</span>
              <span class="file-check" v-if="selectTreeNode.data.type==1">
                <input type="checkbox" v-model="selectTreeNode.data.checked"  @change="fileCheck(selectTreeNode.data)">
              </span>
            </div>
            <file-content
              v-if="!selectTreeNode.data.type || (selectTreeNode.data.type && selectTreeNode.data.children.length)"
              :file="selectTreeNode.data"  @click.native="fileCheck(selectTreeNode.data)">
            </file-content>
          </div> 
        </div>
        
        <div v-else :class="['item',{'singleView':item1.children.length === 0,'titleView':item1.children.length >0 && item1.children.length <= 50,'listView':item1.children.length > 50}]" v-for="(item1, index1) in selectTreeNode.data.children" v-bind:key = "index1"
          @dragenter="dragenter($event, item1, true)" @drop="dragend($event)" @dragend="dragend($event)">
          <!-- <pre>{{item1}}</pre> -->
          <div :class="['container', {'folder': item1.type==1, 'file': item1.type==0}]"
            @dragenter="dragenter($event, item1)" @dragover='dragover($event, item1)' @dragleave="dragleave($event)" @drop="dragend($event)"  @dragend="dragend($event)">
            <div :class="['item-header', {'folder': item1.type==1, 'file': item1.type==0}]">
              <span class="file-title"
                v-bind:style="{'max-width': (item1.children.length || 1) * 110 + 'px' }"
                :title="item1 | getFolderName">{{item1 | getFolderName}}</span>
              <span class="file-check"  v-if="item1.type === 1">
                <input type="checkbox" v-model="item1.checked"  @change="fileCheck(item1)">
              </span>
            </div>
            <file-content v-if="item1.type==0" :file="item1"
              @click.native="fileCheck(item1)" draggable="true" @dragstart.native="dragstart($event,item1)" @drop.native="dragend($event)">
            </file-content>
            <file-content v-else v-for="(item2, index2) in item1.children" v-bind:key="index2"  :file="item2"
              @click.native="fileCheck(item2, item1)" :draggable="item2.type==0" @dragstart.native="dragstart($event, item2, item1)" @drop.native="dragend($event)">
            </file-content>
          </div>
        </div>
      </transition-group>
    </el-scrollbar>

    <div class="imgPreview" :class="[cancelPreviewFlag?'cancelPreview':'']">
      <preview-img :imgObj="imgObj"></preview-img>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import FileContent from './FileContent.vue'
// 图片预览组件
import PreviewImg from '@/components/PreviewImg.vue'
import { FileObject, FileListChangeData } from '../typings/FileObject'
@Component({
  components: { FileContent, PreviewImg },
  props: {
    // 选中的树节点
    selectTreeNode: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  filters: {
    getFolderName(file: FileObject) {
      if (file.type === 1) {
        return file.name
      }

      return '图片文件'
    }
  }
})
export default class FileList extends Vue {
  // 全选状态
  checkAll: boolean = false
  // 被拖动对象
  draging: any = null
  // 选择对象集合
  selects: Array<FileObject> = []
  // 拖动异常
  dragError: boolean = false
  // 预览面板显示/隐藏
  cancelPreviewFlag: boolean = true
  // 当前预览的图片文件信息
  imgObj: any = {}
  created() {
    // console.log(`created:${this.name}`)
    this.$root.$data.eventHub.$on('dblclickToPreviewEvent', data => {
      // console.log(data)
      this.cancelPreviewFlag = false
      data.fileType = data.name.substring(data.name.indexOf('.') + 1, data.name.length + 1).toLowerCase()
      this.imgObj = data
    })

    this.$root.$data.eventHub.$on('closeImgPreview', () => {
      this.cancelPreviewFlag = true
    })

    this.$root.$data.eventHub.$on('setSelectTreeNode', (node: any) => {
      // 选中节点发生变化时需要还原数据状态
      this.resetData()
      // 如果当前选中对象是文件，则将文件选中
      if (node.data.type === 0) {
        node.data.checked = true
        this.selects.push(node.data)
      }
    })
  }

  mounted() {
    this.$nextTick(function() {})
  }

  // 上传图片文件
  getFiles() {
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'index',
      action: 'getFiles',
      active: true
    })
    try {
      window.IndexActions.getFiles()
    } catch (error) {
      console.log(error)
    }
  }

  // 全选
  selectAll(value) {
    const root: FileObject = this.$props.selectTreeNode.data
    if (root.children.length === 0) {
      root.checked = value
      this.updateSelect(root, value)
    } else {
      root.children.forEach((file: FileObject) => {
        file.checked = value
        this.updateSelect(file, value)
        file.children.forEach((child: FileObject) => {
          child.checked = value
          this.updateSelect(child, value)
        })
      })
    }
  }

  // 更新选中状态
  updateSelect(file: FileObject, checked: boolean) {
    const fileIndex = this.selects.findIndex(select => select === file)
    if (checked) {
      fileIndex < 0 && this.selects.push(file)
    } else {
      fileIndex > -1 && this.selects.splice(fileIndex, 1)
    }
  }

  // 选择文件
  fileCheck(target: FileObject, parent: FileObject) {
    // // 将当前点击目标在选中list中更新
    const index = this.selects.findIndex(item => item === target)
    // 更新当前点击对象选中
    if (index < 0) {
      this.selects.push(target)
    } else {
      this.selects.splice(index, 1)
    }
    if (!parent) {
      // 点击外层单文件或外层文件夹
      if (target.type === 1) {
        // 点击外层文件夹
        target.children.forEach((child: FileObject) => {
          child.checked = target.checked
          // 更新子节点选中
          const childIndex = this.selects.findIndex(item => item === child)
          if (childIndex < 0) {
            this.selects.push(child)
          } else {
            this.selects.splice(childIndex, 1)
          }
        })
      } else {
        // 点击外层文件
        target.checked = !target.checked
      }
    } else {
      target.checked = !target.checked
      // 点击文件夹内对象
      if (parent.checked) {
        parent.children.forEach((child: FileObject) => {
          if (!child.checked) {
            parent.checked = false
            // 更新父节点选中
            const parentIndex = this.selects.findIndex(item => item === parent)
            parentIndex > -1 && this.selects.splice(parentIndex, 1)
          }
        })
      }
    }
    // 更新全选状态
    if (!target.checked) {
      this.checkAll = false
    }
  }

  // 批量删除文件
  deleteFiles() {
    if (this.selects.length === 0) {
      this.$message('请选择要删除的文件')
      return
    }
    this.$root.$data.eventHub.$emit('deleteFiles', this.selects)
  }

  // 用户开始拖动元素时触发
  dragstart(event, data: FileObject): void {
    event.stopPropagation()
    this.draging = data
    this.selects.forEach((file: FileObject) => {
      if (file.type === 1) {
        this.dragError = true
        this.$alert('只能对图片文件进行拖动', '提示', { type: 'warning' })
      }
    })
  }

  // 元素正在拖动时触发
  drag(event) {
    event.stopPropagation()
  }

  // 当被鼠标拖动的对象进入其容器范围内时触发此事件
  dragenter(event, target: FileObject, outer: boolean) {
    event.stopPropagation()
    event.preventDefault()
    // 放下后更新列表数据
    const fileListChangeData: FileListChangeData = {
      selects: this.selects,
      draging: this.draging,
      target: target,
      outer: outer
    }
    this.$root.$data.eventHub.$emit('fileListChange', fileListChangeData)
  }

  // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
  dragover(event, target: FileObject): void {
    if (this.dragCheck) {
      event.preventDefault()
    }
  }

  // 当被鼠标拖动的对象离开其容器范围内时触发此事件
  dragleave(event) {
    event.stopPropagation()
  }

  //  在一个拖动过程中，释放鼠标键时触发此事件
  drop(event, target: FileObject): void {}

  // 用户完成元素拖动后触发
  dragend(event) {
    event.stopPropagation()
    if (this.dragError) {
      // 拖动异常终止时不进行任何文件处理
      this.dragError = false
      return
    }
    // 如果拖动已经被释放，则终止
    if (this.selects.length === 0 && !this.draging) {
      return
    }
    this.$root.$data.eventHub.$emit('fileDragend')
    this.draging = null
    this.selects.forEach(item => {
      item.checked = false
    })
    this.selects = []
  }

  // 拖动校验，检测是否可以拖动
  dragCheck(): Boolean {
    const selects: Array<FileObject> = this.selects
    if (selects.length === 0) {
      this.$message({
        message: '未选中任何拖动元素',
        type: 'warning'
      })
      return false
    }

    let flag: Boolean = true
    const path = selects[0].path
    selects.forEach(file => {
      if (file.path !== path) {
        flag = false
        this.$message({
          message: '只能拖动同一层级的文件或文件夹',
          type: 'warning'
        })
      }
    })
    return flag
  }

  // 重置数据
  resetData() {
    // 所有选中状态还原
    this.selects.forEach((select: FileObject) => {
      select.checked = false
    })
    this.checkAll = false
    this.draging = null
    this.selects = []
    this.dragError = false
    // 切换的时候预览不关闭
    // this.cancelPreviewFlag = true
    // this.imgObj = {}
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;

.file-list-container {
  position: relative;
  width: 100%;

  .no-result {
    text-align: center;
    margin-top: 200px;
  }

  .tool-btns {
    padding: 24px 24px 16px 24px;

    .btn {
      cursor: pointer;
      padding: 4px 12px;

      &.upload {
        background-color: $defaultBlue;
        color: #fff;

        &:hover {
          background-color: $hoverBlue;
        }
      }

      &.delete {
        border: 1px solid #ddd;
        background-color: transparent;
        color: $defaultBlue;
        margin-left: 24px;

        &:hover {
          color: $hoverBlue;
          border-color: $hoverBlue;
        }
      }
    }

    .select {
      margin-left: 24px;

      &:hover {
        color: $defaultBlue;
      }
    }
  }

  .file-list-container-scrollbar {
    height: calc(100vh - 180px);
    &.boardOpend {
      width: 60%;
      transition: width 0.5s;
    }
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .file-list-content {
    position: relative;
    display: inline-flex;
    flex-wrap: wrap;
    padding: 24px;
    padding-top: 8px;
    // 默认平铺视图
    .item {
      margin-bottom: 16px;
      padding-right: 16px;
      position: relative;

      .container {
        background-color: #f5f5f5;
        min-width: 138px;
        min-height: 225px;
        .item-header {
          height: 32px;
          line-height: 32px;
          color: #fff;
          padding-left: 8px;
          position: relative;

          .file-title {
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
          }

          &.folder {
            background-color: #485a6c;
          }
          &.file {
            background-color: #42a0f8;
          }

          .file-check {
            float: right;
            height: 100%;
            margin-right: 8px;

            input {
              background-color: transparent;
              font-size: 14px;
              cursor: pointer;
            }
          }
        }

        .item-content {
          padding: 8px;
          display: inline-flex;
          color: #666;
        }

        &.folder {
          .item-content {
            margin-right: 16px;

            &:last-of-type {
              margin-right: 0;
            }
          }
        }
      }
      // 平铺视图
      &.titleView {
        .container {
          padding-bottom: 10px;
          .item-content {
            padding-bottom: 20px;
          }
        }
      }
      // 列表视图
      &.listView {
        padding-top: 32px;
        .container {
          display: flex;
          flex-wrap: wrap;
          // justify-content: space-around;
          background-color: #f5f5f5;
          // 增加小图标列表视图，之前有大图标平铺视图
          max-height: 415px;
          overflow: auto;

          .item-header {
            &.folder {
              position: absolute;
              top: 0;
              left: 0;
              z-index: 1;
              box-sizing: border-box;
              width: calc(100% - 16px);
            }
          }

          .item-content {
            margin-right: 0px;
            width: 15%;
            padding: 4px 5px;
            .folder {
              .item-content-icon {
                > svg {
                  display: none;
                }
              }
            }
            .file,
            .folder {
              width: 100%;
              // display: flex;
              .item-content-icon {
                cursor: pointer;
                // display: none;
                // display: inline-block;
                width: auto;
                height: auto;
                .item-content-bot {
                  display: none;
                }
                img {
                  display: none;
                }
                .item-content-text {
                  max-width: 100%;
                  span {
                    &.file-text {
                      width: calc(100% - 20px);
                      text-overflow: ellipsis;
                      overflow: hidden;
                      text-align: left;
                    }
                  }
                }
              }

              .item-content-text {
                display: flex;
                line-height: 24px;
                span {
                  &.file-icon {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    svg {
                      display: inline-block;
                      width: 20px;
                      height: 20px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // 预览面板样式
  .imgPreview {
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
    height: 100%;
    background-color: #f4f6f8;
    width: calc(40% - 1px);
    border-left: 1px solid #e8e8e8;
    transition: left 0.5s;
    &.cancelPreview {
      left: 100%;
    }
  }
}
</style>


