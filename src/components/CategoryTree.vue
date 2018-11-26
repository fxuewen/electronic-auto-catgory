<template>
    <div class="category-tree-container">
      <el-scrollbar>
        <el-tree ref="elTree" :data="treeData" :props="defaultProps" 
          highlight-current node-key="id" :expand-on-click-node="false" :check-on-click-node="true"
          :draggable="dragable" :allow-drop="allowDrop" @current-change="currentNodeChange" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span class="custom-tree-node-label">
              <span class="custom-tree-node-icon">
                <svg class="icon" aria-hidden="true">
                  <use v-if="data.type === 1" xlink:href="#icon-icon-wenjianjia"></use>
                  <use v-else v-bind:xlink:href="data.name | fileCategory"></use>
                </svg>
              </span>
              <span class="custom-tree-node-name">
                <span v-if="!data.input.show" :title="node.label" :style="{ 'max-width': 240 - (node.level - 1) * 30 + 'px' }">{{ node.label }}</span>
                <input ref="nodeInput" v-else v-model="data.input.value" @click.stop @blur="nodeInputComplete(node, data)" autofocus/>
              </span>
            </span>
            <span class="tree-tools-btns" @click.stop>
              <span v-if="data.type" class="iconfont icon-icon-xinjianwenjianjia tree-tool-btn"  size="mini" title="添加" @click="add(node, data)"></span>
              <span v-if="data.type" class="iconfont icon-icon-bianji tree-tool-btn"  size="mini" title="编辑" @click="() => edit(node, data)"></span>
              <span v-if="node.level > 1" class="iconfont icon-icon-shanchu tree-tool-btn"  size="mini" title="删除" @click="remove(node, data)"></span>
            </span>
          </span>
        </el-tree>
      </el-scrollbar>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { FileListChangeData, FileObject } from '../typings/FileObject'
import Utils from '../utils/utils'

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
    // 通过文件名获取显示svg图标内容
    fileCategory(value) {
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

      // 获取文件扩展名
      const extension = Utils.getNameExtension(value)
      Object.keys(typeMap).forEach(_type => {
        const extensions = typeMap[_type]
        if (extensions.indexOf(extension) > -1) {
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
  // 树的可拖动状态
  dragable: boolean = true
  // 树vue实例
  elTree: any = null
  selects: Array<FileObject> = []
  // 缓存文件列表
  tempFiles: Array<FileObject> = []
  target: any = null
  // 缓存文件id对应关系
  tempFileMap = {}
  // 文件列表拖动结果
  dragResult: boolean = true
  // 是否需要顺移
  isShiftMove: boolean = false

  created() {}

  mounted() {
    this.$nextTick(() => {
      this.setCurrentKeySelected('')
      this.$root.$data.eventHub.$on('fileListChange', this.fileListChange)
      this.$root.$data.eventHub.$on('updateNowCrumb', (data: any) => {
        this.setCurrentKeySelected(data.id)
      })
      this.$root.$data.eventHub.$on('fileDragend', this.onFileDragend)
      this.$root.$data.eventHub.$on('deleteFiles', this.deleteFiles)
      this.$root.$data.eventHub.$on(
        'uploadDirectoryImgSuccess',
        this.uploadDirectoryImgSuccess
      )
      this.$root.$data.eventHub.$on(
        'uploadDirectoryFolderSuccess',
        this.uploadDirectoryFolderSuccess
      )
      this.$root.$data.eventHub.$on('uploadFiles', this.uploadFiles)
    })
  }

  // 节点展开回调
  onNodeExpand(data, node) {
    this.setCurrentKeySelected(data.id)
  }

  // 节点收缩回调
  onNodeCollapse(data, node) {
    this.setCurrentKeySelected(data.id)
  }

  // 根据id设置默认选中
  setCurrentKeySelected(id) {
    this.elTree = this.$refs.elTree
    let currentKey
    if (!id) {
      currentKey = this.$props.treeData[0].id
    } else {
      currentKey = id
    }
    this.elTree.setCurrentKey(currentKey)
    const currentNodeData = this.elTree.getCurrentNode()
    const currentNode = this.elTree.getNode(currentNodeData)
    this.$root.$data.eventHub.$emit('setSelectTreeNode', currentNode)
    // 初始状态选中根节点时自动展开
    if (!id) {
      currentNode && currentNode.expand()
    }
  }

  destroyed() {
    this.$root.$data.eventHub.$off('fileListChange')
    this.$root.$data.eventHub.$off('updateNowCrumb')
    this.$root.$data.eventHub.$off('fileDragend')
    this.$root.$data.eventHub.$off('deleteFiles')
    this.$root.$data.eventHub.$off('uploadDirectoryImgSuccess')
    this.$root.$data.eventHub.$off('uploadDirectoryFolderSuccess')
    this.$root.$data.eventHub.$off('uploadFiles')
  }

  // 获取当前所在文件夹
  getCurrentFolder() {
    const currentNodeData = this.elTree.getCurrentNode()
    if (currentNodeData.type === 1) {
      return currentNodeData
    } else {
      const currentNode = this.elTree.getNode(currentNodeData)
      return currentNode.parent.data
    }
  }

  // 树节点拖动是否允许放置
  allowDrop(draggingNode, dropNode, type) {
    if (dropNode.data.type === 0 && type === 'inner') {
      return false
    }
    return true
  }

  // 当前节点变化
  currentNodeChange(data, node) {
    this.$root.$data.eventHub.$emit('setSelectTreeNode', node)
  }

  // 上传卷宗目录图片文件成功
  uploadDirectoryImgSuccess(data) {
    const rootPath = this.$props.treeData[0].fullName
    const path = data.path
    if (path === rootPath) {
      // 目录图片在根目录下
      Utils.categoryTreeDataFormat(data)
      this.$set(this.$props.treeData[0], 'children', data.children)
    } else {
      const levels = path.split(`${rootPath}\\`)[1].split('\\')
      levels.forEach((name, index) => {
        const result = this.getNodeInLevelByName(name, index + 2, {
          node: null
        })
        if (!result.node) {
          // 对应层级下没有路径则创建文件夹路径
          this.addFolderByName(result.parentNode, name)
        } else {
          // 文件夹存在
          if (index === levels.length - 1) {
            const currentFolder = this.getCurrentFolder()
            result.node.remove()
            Utils.categoryTreeDataFormat(data)
            result.parentNode.insertChild({ data: data }, result.nodeIndex)
            const currentNodeId = currentFolder.id
            if (result.node.data.id === currentNodeId) {
              this.setCurrentKeySelected(data.id)
            }
            this.$message({
              message: '卷宗目录同步成功',
              type: 'success'
            })
          }
        }
      })
    }
  }

  // 上传卷宗目录文件夹成功
  uploadDirectoryFolderSuccess(catogoryFiles) {
    const data = catogoryFiles[0]
    const rootPath = this.$props.treeData[0].fullName
    const fullName = data.fullName
    if (fullName === rootPath) {
      this.$message({
        message: '请选择当前案件下文件夹',
        type: 'warning'
      })
    } else {
      const levels = fullName.split(`${rootPath}\\`)[1].split('\\')
      levels.forEach((name, index) => {
        const result = this.getNodeInLevelByName(name, index + 2, {
          node: null
        })
        if (!result.node) {
          // 对应层级下没有路径则创建文件夹路径
          if (index < levels.length - 1) {
            this.addFolderByName(result.parentNode, name)
          } else {
            Utils.categoryTreeDataFormat(data)
            result.parentNode.insertChild({ data: data })
          }
        } else {
          // 文件夹存在
          if (index === levels.length - 1) {
            this.$message({
              message: '当前路径下已存在该文件夹',
              type: 'warning'
            })
          }
        }
      })
    }
  }

  // 上传文件
  uploadFiles(files: Array<FileObject>) {
    if (!files || files.length === 0) {
      return
    }
    const currentNodeData = this.getCurrentFolder()
    const currentNode = this.elTree.getNode(currentNodeData)
    if (currentNode) {
      files.forEach(file => {
        // 文件数据格式化
        Utils.categoryTreeDataFormat(file)
        // 检查上传文件名称是否已存在
        const fileIndex = currentNodeData.children.findIndex(
          (child: FileObject) => {
            return child.name === file.name
          }
        )
        if (fileIndex < 0) {
          currentNode.insertChild({ data: file })
        } else {
          this.$message({
            message: `当前目录下已存在同名文件:${file.name}`,
            type: 'warning'
          })
        }
      })
    }
  }

  // 获取指定层级对应名称的节点
  getNodeInLevelByName(name: string, level: number, result, node?) {
    if (!node) {
      const rootNode = this.elTree.getNode(this.$props.treeData[0])
      node = rootNode
    }

    if (node.level > level) {
      return result
    } else if (node.level === level) {
      if (node.data.name === name) {
        result.node = node
        return result
      }
    } else {
      result.parentNode = node
      node.childNodes.forEach((childNode, index) => {
        if (!result.node) {
          result.nodeIndex = index
          return this.getNodeInLevelByName(name, level, result, childNode)
        }
      })
    }

    return result
  }

  // 批量删除
  deleteFiles(files: Array<FileObject>) {
    let message: string = '此操作将删除所有选中对象，是否继续？'
    if (files.length === 1 && files[0].type === 0) {
      message = '是否删除此图片？'
    }
    this.$confirm(message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        const currentNodeData = this.elTree.getCurrentNode()
        files.forEach((file, index) => {
          let newCurrentNode
          if (file.id === currentNodeData.id) {
            newCurrentNode = this.elTree.getNode(currentNodeData).parent
          }
          const fileNode = this.elTree.getNode(file)
          fileNode && fileNode.remove()
          // 如果当前高亮节点被删除则将它的父节点设为高亮
          newCurrentNode && this.setCurrentKeySelected(newCurrentNode.data.id)
        })
        files.splice(0, files.length)
        this.$root.$emit('deleteFilesSuccess', files)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
      .catch(() => {
        this.$message('已取消')
      })
  }

  // 在指定文件夹下添加文件夹
  addFolderByName(parentNode, name, index?: number) {
    const folder = {
      name: name,
      fullName: '',
      type: 1,
      path: '',
      id: Utils.getUuid(32),
      children: []
    }
    Utils.categoryTreeDataFormat(folder)
    parentNode && parentNode.insertChild({ data: folder }, index)
  }

  // 添加
  add(node, data) {
    node.expand()
    this.addFolderByName(node, '', 0)
    this.$nextTick(() => {
      const data = node.childNodes[0].data
      data.input.show = true
      data.input.value = ''
      data.input.type = 'add'
      this.$nextTick(() => {
        const input: any = this.$refs.nodeInput
        input.focus()
        this.dragable = false
      })
    })
  }

  // 删除
  remove(node, data) {
    this.$confirm('是否删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        const currentNodeData: FileObject = this.elTree.getCurrentNode()
        const parentNode = this.elTree.getNode(currentNodeData).parent
        node.remove()
        // 删除节点为当前高亮节点，则把父节点高亮
        if (data.id === currentNodeData.id) {
          this.setCurrentKeySelected(parentNode.data.id)
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
      .catch(() => {
        this.$message('已取消')
      })
  }

  // 编辑
  edit(node, data) {
    data.input.show = true
    data.input.value = data.name
    data.input.type = 'edit'
    this.$nextTick(() => {
      const input: any = this.$refs.nodeInput
      input.focus()
      this.dragable = false
    })
  }

  // 文件夹名称校验
  nameValidate(node, data) {
    const input = data.input
    const name = input.value
    // eslint-disable-next-line
    const regex = new RegExp('[\\\\/:*?"<>|]')
    if (name === '') {
      return {
        result: false,
        message: '文件夹名称不能为空'
      }
    } else if (name.length > 100) {
      return {
        result: false,
        message: '文件夹名称不能超过100个字符'
      }
    } else if (regex.test(name)) {
      return {
        result: false,
        message: '文件夹名称不能包含/:*?"<>|这些非法字符'
      }
    } else {
      if (node.level > 1) {
        const parentNode = node.parent
        const parentData = parentNode.data
        const index = parentData.children.findIndex((child: FileObject) => {
          return child.name === name && child.id !== data.id
        })
        if (index > -1) {
          return {
            result: false,
            message: `此目标已包含名为"${name}"的文件夹`
          }
        }
      }
      return {
        result: true,
        message: ''
      }
    }
  }

  // 节点添加或删除完成
  nodeInputComplete(node, data) {
    this.dragable = true
    data.input.show = false
    const input = data.input
    // 名称校验
    const validate = this.nameValidate(node, data)
    if (validate.result) {
      data.name = input.value
      const currentNodeData: FileObject = this.elTree.getCurrentNode()
      // 如果编辑的节点为当前高亮节点，则重置高亮
      if (data.id === currentNodeData.id) {
        this.setCurrentKeySelected(data.id)
      }
    } else {
      this.$message({
        type: 'warning',
        message: validate.message
      })
      // 添加的文件夹名称格式如果不合法时
      if (input.type === 'add') {
        node.remove()
      }
    }
  }

  // 文件列表拖动结束
  onFileDragend() {
    // 拖动结束位置在初始选中节点中的索引
    let endFileIndex: number = -1
    endFileIndex = this.selects.findIndex(select => select === this.target)

    // 拖动完成后判断是否进行顺移
    if (this.dragResult && endFileIndex < 0 && this.target) {
      this.isfolder2folder(this.selects, this.target)
    }

    if (this.isShiftMove) {
      // 进行了顺移后所有文件夹内文件都会重排，不需要做文件移动
      return
    }

    // 将原始数据进行移动
    this.moveFilesToTemp()
  }

  // 将原始文件移动到临时文件处
  moveFilesToTemp() {
    let endFileIndex: number = -1
    endFileIndex = this.selects.findIndex(select => select === this.target)

    this.selects.forEach((file: FileObject) => {
      file.move = false
      file.draging = false
      const tempNode = this.elTree.getNode(this.tempFileMap[`${file.id}_temp`])
      // 拖动结束位置不是初始选中位置时，将原始节点移动到临时节点处
      if (tempNode) {
        // 不是回到原处
        if (this.dragResult && endFileIndex < 0) {
          const fileNode = this.elTree.getNode(file)
          fileNode && fileNode.remove()
          this.elTree.insertAfter(file, tempNode)
        }
      }
    })

    // 清空拖动数据
    this.clearDragData()

    if (!this.dragResult) {
      this.dragResult = true
      this.$alert('文件在文件夹中已存在,已还原拖动操作', '提示', {
        type: 'warning'
      })
    }
  }

  // 文件列表发生变化(进行了拖动,添加,删除等操作)
  fileListChange(data: FileListChangeData) {
    const selects: Array<FileObject> = data.selects
    const draging: FileObject = data.draging
    const target: FileObject = data.target
    const outer: boolean = data.outer
    this.target = target
    if (target && target.move) {
      // 目标对象是临时对象是不处理
      return
    }
    const targetInSelectsIndex = selects.findIndex(select => select === target)
    if (targetInSelectsIndex > -1) {
      // 目标对象在选中对象中不处理
      return
    }
    if (draging.temp) {
      const index = this.tempFiles.findIndex(item => item === draging)
      index < 0 && this.tempFiles.push(draging)
    } else {
      const index = selects.findIndex(item => item === draging)
      draging && index < 0 && selects.push(draging)
    }
    this.selects = selects
    selects.forEach(select => {
      select.draging = true
      // 更新临时文件
      if (!this.tempFileMap[`${select.id}_temp`]) {
        this.createTempFile(select)
      }
    })
    // 目标对象是文件
    if (target.type === 0) {
      this.move2file(this.tempFiles, target, draging)
    } else {
      this.move2Folder(this.tempFiles, target, outer, draging)
    }
  }

  // 创建临时文件
  createTempFile(file) {
    const tempFile = {
      name: file.name,
      fullName: file.fullName,
      path: file.path,
      children: [],
      type: file.type,
      checked: false,
      draging: false,
      move: true,
      temp: true,
      id: `${file.id}_temp`,
      input: {
        show: false,
        type: 'edit',
        value: ''
      }
    }
    this.tempFileMap[`${file.id}_temp`] = tempFile
    if (!this.tempFiles) {
      this.tempFiles = []
    }
    this.tempFiles.push(tempFile)
  }

  // tempFiles顺序重排，保证按在文件列表中的顺序放置(isDes:默认false-->升序, true-->降序)
  filesSort(files: Array<FileObject>, isDes?: boolean) {
    files.sort((tempFile1: FileObject, tempFile2: FileObject) => {
      let id1, id2
      if (tempFile1.temp) {
        // 如果是临时节点则取原始节点进行比较
        id1 = tempFile1.id.split('_temp')[0]
        id2 = tempFile2.id.split('_temp')[0]
      } else {
        id1 = tempFile1.id
        id2 = tempFile2.id
      }
      const node1 = this.elTree.getNode(id1)
      const node2 = this.elTree.getNode(id2)
      const file1 = node1.data
      const file2 = node2.data
      const currentNodeData = this.getCurrentFolder()
      const node1ParentData = node1.parent.data
      const node2ParentData = node1.parent.data
      let index1: number = 0
      let index2: number = 0
      if (node1.level === node2.level) {
        // 两个文件在同一层级
        if (node1ParentData === node2ParentData) {
          // 在相同文件夹
          const parentData = node1.parent.data
          index1 = parentData.children.findIndex(child => child === file1)
          index2 = parentData.children.findIndex(child => child === file2)
        } else {
          // 在不同文件夹
          index1 = currentNodeData.children.findIndex(
            child => child === node1ParentData
          )
          index2 = currentNodeData.children.findIndex(
            child => child === node2ParentData
          )
        }
      } else if (node1.level < node2.level) {
        // node1在上层文件夹
        index1 = currentNodeData.children.findIndex(child => child === file1)
        index2 = currentNodeData.children.findIndex(
          child => child === node2ParentData
        )
      } else {
        // node2在上层文件夹
        index1 = currentNodeData.children.findIndex(
          child => child === node1ParentData
        )
        index2 = currentNodeData.children.findIndex(child => child === file2)
      }

      if (isDes) {
        // 按降序排序
        return index2 - index1
      }

      // 按升序排序
      return index1 - index2
    })
  }

  // 移动到文件夹(TODO:文件夹移动到文件夹的情况)
  move2Folder(
    selects: Array<FileObject>,
    target: FileObject,
    outer: boolean,
    draging: FileObject
  ) {
    const currentNodeData = this.getCurrentFolder()
    const targetIndex = currentNodeData.children.findIndex(
      item => item === target
    )
    const dragId = draging.id.split('_temp')[0]
    const dragNode = this.elTree.getNode(dragId)
    let dragIndex = currentNodeData.children.findIndex(
      item => item.id === dragId
    )
    if (dragIndex < 0) {
      dragIndex = currentNodeData.children.findIndex(
        item => item === dragNode.parent.data
      )
    }
    // 排序
    if (!outer) {
      if (dragIndex > targetIndex) {
        // 从后向前移动，放在文件夹最后，tempFiles升序重排
        this.filesSort(this.tempFiles)
      } else {
        // 从前向后移动，放在文件夹最前，tempFiles降序重排
        this.filesSort(this.tempFiles, true)
      }
    } else {
      // 移出文件夹，tempFiles降序重排
      this.filesSort(this.tempFiles, true)
    }
    // 移动
    selects.forEach((dragObj: FileObject) => {
      const realId = dragObj.id.split('_temp')[0]
      const indexInTarget = target.children.findIndex(
        (item: FileObject) => item.id === realId
      )
      if (!outer && indexInTarget > -1) {
        // 没有进行移动操作则删除临时节点
        const dragNode = this.elTree.getNode(dragObj)
        dragNode && dragNode.remove()
        return
      }
      const fileNameExist = this.isFileNameExist(dragObj, target)
      if (fileNameExist) {
        this.dragResult = false
      }
      // 如果是原始文件，则创建临时拖动对象
      const dragNode = this.elTree.getNode(dragObj)
      dragNode && dragNode.remove()
      if (!outer) {
        // 添加到目标文件夹
        if (dragIndex > targetIndex) {
          // 从后向前移动，放在文件夹最后
          const targetNode = this.elTree.getNode(target)
          targetNode && targetNode.insertChild({ data: dragObj })
        } else {
          // 从前向后移动，放在最前
          const targetNode = this.elTree.getNode(target)
          targetNode && targetNode.insertChild({ data: dragObj }, 0)
        }
      } else {
        // 移动到文件夹外
        const targetNode = this.elTree.getNode(target)
        targetNode && this.elTree.insertAfter(dragObj, targetNode)
      }
    })
  }

  // 移动到文件
  move2file(
    selects: Array<FileObject>,
    target: FileObject,
    draging: FileObject
  ) {
    const currentNodeData = this.getCurrentFolder()
    const targetIndex = currentNodeData.children.findIndex(
      item => item === target
    )
    const dragId = draging.id.split('_temp')[0]
    const dragIndex = currentNodeData.children.findIndex(
      item => item.id === dragId
    )
    // 拖动元素排序
    if (dragIndex > targetIndex) {
      // 放在拖动元素之前，此时需要降序排序
      this.filesSort(this.tempFiles)
    } else {
      // 放在拖动元素之后，需要升序排序
      this.filesSort(this.tempFiles, true)
    }

    // 将拖动对象移动到文件夹
    selects.forEach((dragObj: FileObject) => {
      const dragNode = this.elTree.getNode(dragObj)
      dragNode && dragNode.remove()
      const fileNameExist = this.isFileNameExist(dragObj, currentNodeData)
      if (fileNameExist) {
        this.dragResult = false
      }
      const realId = dragObj.id.split('_temp')[0]
      // 回到初始位置时
      if (realId === target.id) {
        const realIndex = this.selects.findIndex(
          (item: FileObject) => item.id === realId
        )
        const file = this.selects[realIndex]
        file.move = false
        file.draging = true
      } else {
        const targetNode = this.elTree.getNode(target)
        if (dragIndex > targetIndex) {
          targetNode && this.elTree.insertBefore(dragObj, targetNode)
        } else {
          targetNode && this.elTree.insertAfter(dragObj, targetNode)
        }
      }
    })
  }

  // 相邻文件夹之间的顺移操作
  isfolder2folder(selects: Array<FileObject>, target: FileObject) {
    console.log('drag end hahaha~')
    // 1.拖动目标出必须是文件夹
    if (target.type === 0) {
      return
    }

    // 2.拖动文件必须在同一文件夹中
    const isInOneFolder = this.isInOneFolder(selects)
    if (!isInOneFolder) {
      return
    }
    console.log('in same folder')

    // 3.拖动文件所在文件夹必须和目标文件夹相邻
    const isInContinuousFolder: boolean = this.isInContinuousFolder(
      selects,
      target
    )
    if (!isInContinuousFolder) {
      return
    }
    console.log('in continuous folder')

    // 4.文件夹之间是否有文件隔开
    const isSepratedByFile: boolean = this.isSepratedByFile(selects, target)
    if (isSepratedByFile) {
      console.log('seperated by file')
      return
    }

    console.log('begin move file shift')

    // 满足条件后开始顺移
    this.beforeShiftMove(selects, target)
  }

  // 文件是否在同一文件夹
  isInOneFolder(files: Array<FileObject>): boolean {
    const node = this.elTree.getNode(files[0].id)
    let parent: FileObject = node.parent.data
    const currentNodeData = this.getCurrentFolder()
    let isInOneFolder: boolean = true

    // 文件直属于当前选中文件夹
    if (parent === currentNodeData) {
      isInOneFolder = false
    }

    files.forEach((file: FileObject) => {
      const fileNode = this.elTree.getNode(file.id)
      const parentFile: FileObject = fileNode.parent.data
      // 文件与第一个文件不在同一个文件夹
      if (parent !== parentFile) {
        isInOneFolder = false
      }
    })
    return isInOneFolder
  }

  // 是否在连续的文件夹中
  isInContinuousFolder(files: Array<FileObject>, target: FileObject): boolean {
    let isInContinuousFolder = true
    const node = this.elTree.getNode(files[0].id)
    let parent: FileObject = node.parent.data
    const currentNodeData = this.getCurrentFolder()
    // 选中对象所在文件夹索引
    const parentIndex = currentNodeData.children.findIndex(
      child => child === parent
    )
    // 目标文件夹索引
    const targetIndex = currentNodeData.children.findIndex(
      child => child === target
    )
    if (parentIndex < 0 || targetIndex < 0) {
      isInContinuousFolder = false
    }
    if (Math.abs(parentIndex - targetIndex) !== 1) {
      isInContinuousFolder = false
    }
    return isInContinuousFolder
  }

  // 文件夹之间是否有文件
  isSepratedByFile(selects: Array<FileObject>, target: FileObject): boolean {
    // 分别获取第一个文件夹，第一个文件夹之后的文件，最后一个文件夹的索引，根据索引来判断第一个文件夹和最后一个文件夹之间是否有文件
    let isSepratedByFile: boolean = false
    const currentNodeData: FileObject = this.getCurrentFolder()
    let startFolderIndex: number = -1
    let endFolderIndex: number = -1
    let fileIndex: number = -1
    currentNodeData.children.forEach((child: FileObject, index: number) => {
      if (child.type === 1) {
        if (startFolderIndex < 0) {
          startFolderIndex = index
          endFolderIndex = index
        } else {
          endFolderIndex = index
        }
      } else {
        if (startFolderIndex >= 0 && fileIndex < 0) {
          fileIndex = index
        }
      }
    })

    if (fileIndex >= 0 && endFolderIndex - fileIndex > 0) {
      isSepratedByFile = true
    }
    // 获取
    return isSepratedByFile
  }

  // 顺移之前
  beforeShiftMove(files: Array<FileObject>, target: FileObject) {
    // 将files按升序排序
    this.filesSort(files)
    // 获取选择文件所在文件夹与目标文件夹的前后关系
    const node = this.elTree.getNode(files[0].id)
    let parent: FileObject = node.parent.data
    const currentNodeData = this.getCurrentFolder()
    // 选中对象所在文件夹索引
    const parentIndex = currentNodeData.children.findIndex(
      child => child === parent
    )
    // 目标文件夹索引
    const targetIndex = currentNodeData.children.findIndex(
      child => child === target
    )

    let isFileShiftMove = true
    const children: Array<any> = parent.children
    if (parentIndex < targetIndex) {
      // 选择文件夹在目标文件夹前则需要是选择文件夹中的最后面几个连续文件
      files.forEach((file: FileObject, index: number) => {
        const fileInFolder: FileObject =
          children[children.length - files.length + index]
        if (fileInFolder !== file) {
          isFileShiftMove = false
        }
      })
    } else {
      // 选择文件夹在目标文件夹后则需要是选择文件夹中的最前面几个连续文件
      files.forEach((file: FileObject, index: number) => {
        const fileInFolder: FileObject = children[index]
        if (fileInFolder !== file) {
          isFileShiftMove = false
        }
      })
    }

    // 文件所在位置不满足条件时不进行顺移
    if (!isFileShiftMove) {
      return
    }

    // 进行顺移
    this.isShiftMove = true

    this.$confirm('是否顺移', '提示', {
      confirmButtonText: '顺移',
      cancelButtonText: '不移',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        // 如果顺移则进行顺移文件重排操作
        this.shiftMove(files, target)
      })
      .catch(() => {
        // 如果没有顺移则执行文件移动操作
        this.moveFilesToTemp()
      })
  }

  // 顺移
  shiftMove(files: Array<FileObject>, target: FileObject) {
    const currentNodeData = this.getCurrentFolder()
    const children = currentNodeData.children
    const newChildren: Array<FileObject> = []
    // 获取选择文件所在文件夹与目标文件夹的前后关系
    const node = this.elTree.getNode(files[0].id)
    let parent: FileObject = node.parent.data
    // 选中对象所在文件夹索引
    const dragIndex = children.findIndex(child => child === parent)
    // 目标文件夹索引
    const targetIndex = children.findIndex(child => child === target)
    const shift = dragIndex - targetIndex
    if (shift === 0) {
      this.clearDragData()
      return
    }

    // 还原选中文件的拖动状态
    files.forEach((file: FileObject) => {
      file.move = false
      file.draging = false
    })

    // 变化的所有文件
    const resetFiles: Array<FileObject> = []
    const fileNumArr: Array<number> = []
    // 独立文件，不在文件夹内
    const fileArr: Array<FileObject> = []
    if (shift < 0) {
      // 由前向后顺移
      for (let i = 0; i < children.length; i++) {
        const temp: FileObject = children[i]
        // 从目标文件夹处开始，每个文件夹内向后移动相同数量的文件
        if (i < dragIndex) {
          newChildren.push(temp)
          continue
        }

        if (temp.type === 1) {
          if (i === dragIndex) {
            fileNumArr.push(
              this.getRealFileLength(temp.children) - files.length
            )
          } else {
            fileNumArr.push(this.getRealFileLength(temp.children))
          }
          // 将原文件夹中的内容保存到重排列表中
          temp.children.forEach((child: FileObject) => {
            !child.temp && resetFiles.push(child)
          })
          // 原文件夹清空
          temp.children.splice(0, temp.children.length)
        } else {
          resetFiles.push(temp)
          fileArr.push(temp)
        }
      }
    } else {
      // 由后向前顺移
      for (let i = 0; i < children.length; i++) {
        const temp: FileObject = children[i]
        // 从最后开始，每个文件夹内向前移动相同数量的文件
        if (i < targetIndex) {
          newChildren.push(temp)
          continue
        }

        if (temp.type === 1) {
          if (i === targetIndex) {
            fileNumArr.push(
              this.getRealFileLength(temp.children) + files.length
            )
          } else {
            fileNumArr.push(this.getRealFileLength(temp.children))
          }
          // 将原文件夹中的内容保存到重排列表中
          temp.children.forEach((child: FileObject) => {
            !child.temp && resetFiles.push(child)
          })
          // 原文件夹清空
          temp.children.splice(0, temp.children.length)
        } else {
          resetFiles.push(temp)
          fileArr.push(temp)
        }
      }
    }

    // 从children移除独立文件，后面通过重排列表再分配
    fileArr.forEach((file: FileObject) => {
      const index = children.findIndex(item => item === file)
      index > -1 && children.splice(index, 1)
    })

    // 文件重新分配
    const startIndex = dragIndex < targetIndex ? dragIndex : targetIndex
    for (let i = 0; i < children.length; i++) {
      if (i < startIndex) {
        continue
      }

      const folder: FileObject = children[i]
      const fileNum: number = fileNumArr[i - startIndex]
      if (folder.type === 1) {
        // 按文件夹原有个数放入文件
        for (let j = 0; j < fileNum; j++) {
          const file = resetFiles[0]
          if (file) {
            folder.children.push(file)
            resetFiles.splice(0, 1)
          }
        }
        newChildren.push(folder)
      }
    }
    // 如果文件夹重排完后还有多余文件，则放到外层中去
    resetFiles.forEach((file: FileObject) => {
      newChildren.push(file)
    })

    const childrenStr = JSON.stringify(newChildren)
    this.$set(currentNodeData, 'children', JSON.parse(childrenStr))

    // 清空拖动临时数据
    this.clearDragData()
  }

  // 获取文件个数，除去临时文件
  getRealFileLength(files): number {
    let num: number = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.temp) {
        continue
      }
      num++
    }
    return num
  }

  // 文件夹中是否存在同名文件
  isFileNameExist(file: FileObject, folder: FileObject) {
    if (folder.type === 0) {
      return false
    }

    const realId = file.id.split('_temp')[0]
    const dragNode = this.elTree.getNode(realId)
    if (dragNode && dragNode.parent && dragNode.parent.data === folder) {
      return false
    }
    let result: boolean = false
    folder.children.forEach((child: FileObject) => {
      if (child.name === file.name && !child.temp) {
        result = true
      }
    })
    return result
  }

  // 清空临时数据
  clearDragData() {
    // 还原拖动节点状态
    this.selects.forEach((select: FileObject) => {
      select.move = false
      select.draging = false
    })
    // 清空临时节点
    this.tempFiles.forEach((tempFile: FileObject) => {
      const tempNode = this.elTree.getNode(tempFile)
      tempNode && tempNode.remove()
    })

    this.selects = []
    this.tempFiles = []
    this.tempFileMap = {}
    this.target = null
    this.isShiftMove = false
  }
}
</script>

<style lang="scss">
.category-tree-container {
  // padding: 16px 4px;
  padding: 0;

  .el-scrollbar {
    height: calc(100vh - 146px);

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }

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

    .custom-tree-node-name {
      position: relative;

      span {
        position: relative;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      }

      input {
        border: none;
        outline: none;
        background-color: transparent;
      }
    }

    &:hover {
      .tree-tools-btns {
        display: inline-block;
      }
    }

    .tree-tools-btns {
      position: absolute;
      right: 12px;
      display: none;
    }
  }
}
</style>


