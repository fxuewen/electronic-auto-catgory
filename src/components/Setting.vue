<template>
    <div class="category-setting">
      <el-dialog title="系统配置" :close-on-click-modal="false" :visible="settingDialog" width="30%" top="calc(50vh - 180px)" @close="close">
        <div class="setting-pdf">
          <span>PDF制作开关设置</span>
          <el-switch
            v-model="config.isAllowCreatePdf"
            active-color="#42a0f8"
            @change="isAllowCreatePdfChange">
          </el-switch>
          <div class="description">系统可通过配置项根据配置项决定在上传后是否需要对卷宗文件进行“生成pdf”模拟操作。（该操作在卷宗系统中会将pdf进行压缩）</div>
        </div> 
        <div class="setting-path">
          <div class="title">目录保存路径设置</div>
          <div class="path" v-bind:title="config.downloadDefaultFolder">{{config.downloadDefaultFolder}}</div>
          <div class="description">系统默认把下载的文件保存到此文件夹中</div>
        </div>
        <div class="path-btns">
            <button class="path-btns-set" @click="changeDownloadDefaultFolder"><i class="btn-icon iconfont icon-icon-bianji"></i>更改路径</button>
            <button class="path-btns-open" @click="openFolder"><i class="btn-icon iconfont icon-icon-dakaiwenjianjia"></i>打开文件</button>
        </div>    
      </el-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
// import { Switch } from 'iview/src/components/switch'

@Component({
  // components: { Switch },
  props: {
    settingDialog: Boolean
  }
})
export default class Setting extends Vue {
  config: any = {}

  created() {
    this.$root.$data.eventHub.$on('settingPage', data => {
      this.config = data
    })
  }

  mounted() {
    try {
      // 获取配置信息
      window.SettingActions.getConfigInfo()
    } catch (error) {
      console.log(error)
    }
  }

  destroyed() {
    this.$root.$data.eventHub.$off('settingPage')
  }

  // 关闭设置对话框
  close() {
    this.$root.$data.eventHub.$emit('closeSettingDialog')
  }

  // 模拟PDF生成开关设置
  isAllowCreatePdfChange(value) {
    try {
      // 通过winform更改默认下载保存地址
      window.SettingActions.changeAllowCreatePdf(value)
    } catch (error) {
      console.log(error)
    }
  }

  // 更改默认下载位置
  changeDownloadDefaultFolder() {
    try {
      // 通过winform更改默认下载保存地址
      window.SettingActions.changeDownloadDefaultFolder()
    } catch (error) {
      console.log(error)
    }
  }

  // 打开文件夹
  openFolder() {
    try {
      // 通过winform打开文件夹
      window.SettingActions.openFolder(this.config.downloadDefaultFolder)
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<style lang="scss">
.category-setting {
  .el-dialog__header {
    background-color: #f5f5f5;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .setting-pdf {
    .el-switch {
      float: right;
    }

    .description {
      margin-top: 8px;
      color: #999;
    }
  }

  .setting-path {
    .title {
      margin-top: 16px;
      color: #333;
    }

    .path {
      border: 1px solid #ddd;
      height: 36px;
      line-height: 36px;
      margin: 16px 0 8px 0;
      padding: 0 12px;
      color: #666;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .description {
      margin-top: 8px;
      color: #999;
    }
  }

  .path-btns {
    color: #42a0f8;
    margin-top: 16px;

    button {
      background-color: transparent;
      color: #42a0f8;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px 10px;
      cursor: pointer;
      outline: none;

      &:hover {
        color: #5fb1fe;
        border-color: #5fb1fe;
      }

      &.path-btns-open {
        margin-left: 32px;
      }

      i {
        margin-right: 6px;
      }
    }
  }
}
</style>


