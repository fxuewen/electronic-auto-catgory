<template>
    <div class="catgory-tree-container">
      <el-tree ref="elTree" :data="treeData" :props="defaultProps"  highlight-current node-key="fullName" @current-change="currentNodeChange">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="custom-tree-node-label">
            <span class="custom-tree-node-icon">
              <svg class="icon" aria-hidden="true">
                <use v-if="data.type === 1" xlink:href="#icon-icon-wenjianjia"></use>
                <use v-else v-bind:xlink:href="data.name | fileCategory"></use>
              </svg>
            </span>
            <span class="custom-tree-node-name" :title="node.label">{{ node.label }}</span>
          </span>
          <span>
            <span class="iconfont icon-xiazai tree-tool-btn" type="text" size="mini" title="添加" @click="add(node, data)"></span>
            <span class="iconfont icon-xiazai tree-tool-btn" type="text" size="mini" title="删除" @click="remove(node, data)"></span>
            <span class="iconfont icon-shanchu tree-tool-btn" type="text" size="mini" title="编辑" @click="() => edit(node, data)"></span>
          </span>
        </span>
      </el-tree>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { FileListChangeData, FileObject } from '../typings/FileObject'

@Component({
  props: {
    treeData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  filters: {
    fileCategory: function(value) {
      const iconMap = {
        image: 'icon-icon-tupianwenjian',
        video: 'icon-icon-shipinwenjian',
        audio: 'icon-icon-yinpinwenjian',
        doc: 'icon-icon-wordwenjian',
        txt: 'icon-icon-textwenjian',
        excel: 'icon-icon-excelwenjian',
        ppt: 'icon-icon-pptwenjian',
        pdf: 'icon-icon-PDFwenjian',
        zip: 'icon-icon-yasuobao'
      }
      let type = 'unknown'
      const typeMap = {
        image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
        doc: ['doc', 'docx'],
        txt: ['txt'],
        excel: ['xls', 'xlsx'],
        pdf: ['pdf', 'epub'],
        ppt: ['ppt', 'pptx'],
        zip: ['zip', 'rar', '7z']
      }
      Object.keys(typeMap).forEach(_type => {
        const extensions = typeMap[_type]
        if (extensions.indexOf(value) > -1) {
          type = _type
        }
      })
      const icon = iconMap[type] || 'icon-icon-qitawenjian'
      return `#${icon}`
    }
  }
})
export default class CatgoryTree extends Vue {
  defaultProps: Object = {
    children: 'children',
    label: 'name'
  }
  // 树vue实例
  elTree: any = null
  currentNode: any = null

  created() {
    // console.log(`created:${this.$props.treeData}`)
    this.$root.$data.eventHub.$on('fileListChange', this.fileListChange)
  }

  mounted() {
    this.$nextTick(function() {
      this.elTree = this.$refs.elTree
      const currentKey: string = this.$props.treeData[0].fullName
      this.elTree.setCurrentKey(currentKey)
      const currentNodeData = this.elTree.getCurrentNode()
      const currentNode = this.elTree.getNode(currentNodeData)
      this.currentNode = currentNode
      this.$root.$data.eventHub.$emit('setSelectTreeNode', currentNode)
    })
  }

  // 当前节点变化
  currentNodeChange(data, node) {
    this.currentNode = node
    this.$root.$data.eventHub.$emit('setSelectTreeNode', node)
  }

  // 添加
  add() {}

  // 删除
  remove() {}

  // 编辑
  edit() {}

  // 文件列表发生变化(进行了拖动,添加,删除等操作)
  fileListChange(data: FileListChangeData) {
    console.log('drag data change')
    console.log(data.selects, data.target)
    const selects: Array<FileObject> = data.selects
    const target: FileObject = data.target
    // 目标对象是文件
    if (target.type === 0) {
      this.move2file(selects, target)
    } else {
      selects.forEach((dragObj: FileObject) => {
        if (target === this.currentNode.data) {
          this.moveOutFolder(dragObj, target)
        } else {
          this.move2Folder(dragObj, target)
        }
      })
    }
  }

  // 移动到文件夹(TODO:文件夹移动到文件夹的情况)
  move2Folder(dragObj: FileObject, target: FileObject) {
    // 从当前位置移除
    const dragNode = this.elTree.getNode(dragObj)
    dragNode.remove()
    // 添加到目标位置
    const targetNode = this.elTree.getNode(target)
    targetNode.insertChild({ data: dragObj })
  }

  // 移出文件夹
  moveOutFolder(dragObj: FileObject, target: FileObject) {
    // 从当前位置移除
    const dragNode = this.elTree.getNode(dragObj)
    dragNode.remove()
    // 添加到目标位置
    this.currentNode.insertChild({ data: dragObj })
  }

  // 移动到文件
  move2file(selects: Array<FileObject>, target: FileObject) {
    // 新建文件夹
    const newFolder: FileObject = {
      name: `新建文件夹`,
      fullName: `${target.path}\\新建文件夹`,
      path: target.path,
      type: 1,
      select: 1,
      children: []
    }
    this.elTree.insertBefore(newFolder, target)
    this.$nextTick(() => {
      const newFolderNode = this.elTree.getNode(newFolder)
      // 将目标文件移动到文件夹
      const targetNode = this.elTree.getNode(target)
      targetNode.remove()
      newFolderNode.insertChild({ data: target })
      // 将拖动对象移动到文件夹
      selects.forEach((dragObj: FileObject) => {
        const dragNode = this.elTree.getNode(dragObj)
        dragNode.remove()
        newFolderNode.insertChild({ data: dragObj })
      })
    })
  }

  // 文件夹到文件夹(相邻的文件夹是否顺移操作)
  folder2folder(fileObj: FileObject, target: FileObject) {}
}
</script>


<style lang="scss">
.catgory-tree-container {
  padding: 16px 4px;
  .el-tree-node__content {
    height: 36px;
    line-height: 36px;

    .custom-tree-node-icon {
      svg {
        width: 18px;
        height: 18px;
        position: relative;
        top: 4px;
      }
    }
  }
}
</style>


