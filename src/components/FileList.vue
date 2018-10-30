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
        <div :class="{'item-folder': item1.type==1, 'item-file': item1.type !=1}" v-for="(item1, index1) in selectTreeNode.data.children" v-bind:key = "index1">
          <div :class="['item-header', {'folder': item1.type==1, 'file': item1.type==0}]">图片文件</div>
          <div v-if="item1.type==0" class="item-content lev1-file-content" draggable="true"
            @dragstart="drag($event,item1)"  @drop='drop($event, item1)' @dragover='allowDrop($event, item1)'>
            <div>
              <div class="item-content-icon"></div>
              <div class="item-content-text">{{item1.name}}</div>
            </div>
          </div>
          <div v-else class="item-content lev1-folder-content" :style="{width: itemWidth}" v-for="(item2, index2) in item1.children" v-bind:key="index2"
             @dragstart="drag($event, item2)"  @drop='drop($event, item1)' @dragover='allowDrop($event, item1)'>
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

  created() {
    // console.log(`created:${this.name}`)
  }

  mounted() {
    this.$nextTick(function() {})
  }

  drag(event, data): void {
    this.dragData = data
  }

  drop(event, data): void {
    event.preventDefault()
    if (this.dragData === data) {
      alert('同一元素')
      return
    }
    const listData: any = this.$props.selectTreeNode.data
    const index = listData.children.findIndex(item => item === this.dragData)
    if (data.children.length > 0) {
      // 拖动到的对象是文件夹
      if (index >= 0) {
        data.children.push(this.dragData)
        listData.children.splice(index, 1)
      }
    } else {
      // 拖动到的对象是单文件,创建文件夹，两个单文件放入文件夹
      if (index >= 0) {
        listData.children.splice(index, 1)
        const newFolder: FileObject = {
          name: `${data.name}_${this.dragData.name}`,
          fullName: `${data.path}\\${data.name}_${this.dragData.name}`,
          path: data.path,
          type: 1,
          children: []
        }
        newFolder.children.push(this.dragData)
        newFolder.children.push(data)
        listData.children.push(newFolder)
      }
    }
  }

  allowDrop(event, data): void {
    event.preventDefault()
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


