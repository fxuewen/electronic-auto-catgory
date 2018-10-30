<template>
    <div class="file-list-container">
      <div class="file-list-content" ref="fileListContent">
        <div v-if="!selectTreeNode.data.children.length" class="item-file">
          <div class="item-header file">图片文件</div>
          <div class="item-content lev1-file-content">
            <div>
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{selectTreeNode.data.name}}</div>
            </div>
          </div>
        </div>
        <div :class="{'item-folder': item1.type==1, 'item-file': item1.type !=1}" v-for="(item1, index1) in selectTreeNode.data.children" v-bind:key = "index1"
          @dragenter="dragenter($event)" @dragover='dragover($event, item1)' @dragleave="dragleave($event)" @drop='drop($event, item1)'>
          <div :class="['item-header', {'folder': item1.type==1, 'file': item1.type==0}]">图片文件</div>
          <div v-if="item1.type==0" class="item-content lev1-file-content" 
            draggable="true" @dragstart="dragstart($event,item1)">
            <div>
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{item1.name}}</div>
            </div>
          </div>
          <div v-else class="item-content lev1-folder-content" :style="{width: itemWidth}" v-for="(item2, index2) in item1.children" v-bind:key="index2"
            draggable="true" @dragstart="dragstart($event, item2)">
            <div :class="{'lev2-folder-content': item2.type==1, 'lev2-file-content': item2.type==0}">
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{item2.name}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import FileObject from '../typings/FileObject'
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
  dragData: FileObject = {
    name: '',
    fullName: '',
    path: '',
    children: [],
    type: 0
  }
  dragTarget: FileObject = {
    name: '',
    fullName: '',
    path: '',
    children: [],
    type: 0
  }

  created() {
    // console.log(`created:${this.name}`)
  }

  mounted() {
    this.$nextTick(function() {})
  }

  // 用户开始拖动元素时触发
  dragstart(event, data: FileObject): void {
    this.dragData = data
  }

  // 元素正在拖动时触发
  drag(event) {}

  // 当被鼠标拖动的对象进入其容器范围内时触发此事件
  dragenter(event) {
    console.log('dragenter')
  }

  // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
  dragover(event, data: FileObject): void {
    event.preventDefault()
  }

  // 当被鼠标拖动的对象离开其容器范围内时触发此事件
  dragleave(event) {
    console.log('dragleave')
  }

  //  在一个拖动过程中，释放鼠标键时触发此事件
  drop(event, data: FileObject): void {
    event.preventDefault()
    if (this.dragData === data) {
      alert('同一元素')
      return
    }
    // 放下后更新列表数据
    this.refreshListData(this.dragData, data)
  }

  // 用户完成元素拖动后触发
  dragend(event) {}

  // 更新拖动后列表数据
  refreshListData(dragData: FileObject, targetData: FileObject) {
    const listData: any = this.$props.selectTreeNode.data
    const index = listData.children.findIndex(item => item === dragData)
    if (targetData.children.length > 0) {
      // 拖动到的对象是文件夹
      if (index >= 0) {
        targetData.children.push(dragData)
        listData.children.splice(index, 1)
      }
    } else {
      // 拖动到的对象是单文件,创建文件夹，两个单文件放入文件夹
      if (index >= 0) {
        listData.children.splice(index, 1)
        const newFolder: FileObject = {
          name: `${targetData.name}_${dragData.name}`,
          fullName: `${targetData.path}\\${targetData.name}_${dragData.name}`,
          path: targetData.path,
          type: 1,
          children: []
        }
        newFolder.children.push(this.dragData)
        newFolder.children.push(targetData)
        listData.children.splice(index, 0, newFolder)
      }
    }
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

      .item-header {
        height: 40px;
        line-height: 40px;

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
            min-width: 200px;
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


