<template>
    <div class="file-list-container">
      <transition-group tag="div" class="file-list-content" ref="fileListContent">
        <div v-if="!selectTreeNode.data.children.length" class="item-file" :key="selectTreeNode.data.name">
          <div class="item-header file">图片文件</div>
          <div class="item-content lev1-file-content">
            <div>
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{selectTreeNode.data.name}}</div>
            </div>
          </div>
        </div>
        <div v-else :class="{'item-folder': item1.type==1, 'item-file': item1.type !=1}" v-for="(item1, index1) in selectTreeNode.data.children" v-bind:key = "index1"
          @dragenter="dragenter($event, item1)" @dragover='dragover($event, item1)' @dragleave="dragleave($event)" @drop='drop($event, item1)' @dragend="dragend($event)">
          <div :class="['item-header', {'folder': item1.type==1, 'file': item1.type==0}]">{{item1 | getFolderName}}</div>
          <div v-if="item1.type==0" class="item-content lev1-file-content" 
            draggable="true" @dragstart="dragstart($event,item1)">
            <div>
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{item1.name}}</div>
            </div>
          </div>
          <div v-else class="item-content lev1-folder-content" :style="{width: itemWidth}" v-for="(item2, index2) in item1.children" v-bind:key="index2"
            draggable="true" @dragstart="dragstart($event, item2, item1)">
            <div :class="{'lev2-folder-content': item2.type==1, 'lev2-file-content': item2.type==0}">
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{item2.name}}</div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { FileObject, FileListChangeData } from '../typings/FileObject'
@Component({
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
  // 被拖动对象
  draging: any = null
  // 选择对象集合
  selects: Array<FileObject> = []

  created() {
    // console.log(`created:${this.name}`)
  }

  mounted() {
    this.$nextTick(function() {})
  }

  // 用户开始拖动元素时触发
  dragstart(event, data: FileObject): void {
    event.stopPropagation()
    this.draging = data
    const index = this.selects.findIndex(item => item === data)
    if (index < 0) {
      this.selects.push(data)
    }
  }

  // 元素正在拖动时触发
  drag(event) {
    event.stopPropagation()
  }

  // 当被鼠标拖动的对象进入其容器范围内时触发此事件
  dragenter(event, target: FileObject) {
    console.log('dragenter')
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.effectAllowed = 'move'
    if (this.draging === target) {
      return
    }
    // 放下后更新列表数据
    const fileListChangeData: FileListChangeData = {
      selects: this.selects,
      target: target
    }
    this.$root.$data.eventHub.$emit('fileListChange', fileListChangeData)
  }

  // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
  dragover(event, target: FileObject): void {
    event.dataTransfer.dropEffect = 'move'
    if (this.dragCheck) {
      event.preventDefault()
    }
  }

  // 当被鼠标拖动的对象离开其容器范围内时触发此事件
  dragleave(event) {
    event.stopPropagation()
    console.log('dragleave')
  }

  //  在一个拖动过程中，释放鼠标键时触发此事件
  drop(event, target: FileObject): void {
    event.stopPropagation()
    event.preventDefault()
  }

  // 用户完成元素拖动后触发
  dragend(event) {
    event.stopPropagation()
    this.draging = null
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
}
</script>

<style lang="scss">
.file-list-container {
  position: relative;

  .file-list-content {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-wrap: wrap;

    .item-folder,
    .item-file {
      margin: 16px;
      background-color: #f5f5f5;
      transition: all linear .3s;

      .item-header {
        height: 40px;
        line-height: 40px;
        min-width: 200px;

        &.folder {
          background-color: #485a6c;
        }
        &.file {
          background-color: #42a0f8;
        }
      }

      .item-content {
        padding: 16px;
        display: inline-flex;

        &.lev1-file-content {
          .item-content-icon {
            min-width: 232px;
            min-height: 300px;
            border: 1px solid #ddd;
          }
          .item-content-text {
            text-align: center;
          }
        }

        &.lev1-folder-content {
          .lev2-folder-content,
          .lev2-file-content {
            .item-content-icon {
              min-width: 200px;
              min-height: 300px;
              border: 1px solid #ddd;
            }

            .item-content-text {
              text-align: center;
            }
          }
        }
      }
    }
  }
}
</style>


