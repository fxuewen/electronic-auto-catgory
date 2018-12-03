<template>
    <el-container id="autoDetection">
      <el-container>
        <el-aside width="200px" style="position:relative;">
             <div>
                <p>上传待检测的卷宗</p>
                <p>待检测文件只支持以文件夹的方式上传</p>
                <el-button plain style="width:100%;" @click="getDirectories()"><i class="iconfont">&#xe7d3;</i>上传文件夹</el-button>
             </div>
             <div>
                <p>设定图片清晰度阀值</p>
                <p>清晰度阀值“中(5000)”是推荐值，你也可以选择其他阀值或者手动输入阀值。下拉框中只允许输入0~2147483647之间的整数。</p>
                <el-select v-model="value8" 
                  clearable
                  filterable
                  allow-create
                  default-first-option placeholder="请选择"
                  style="width:100%;"
                  @change="change"
                >
                  <el-option
                    v-for="item in thresholdEnumList"
                    :key="item.code"
                    :label="item.displayValue"
                    :value="item.en">
                  </el-option>
                </el-select>
             </div>
             <div>
               <label>温馨提示：</label>
               <div>
                   <div>1、卷宗智能检测用于检测图片清晰度，并且筛选出低于阀值的卷宗文件。</div>
                   <div>2、在上传待检测文件之后，需要设定一个清晰度阀值，系统会默认选中推荐值。</div>
                   <div>3、检测完成之后不合格的文件会在右边“检测不合格文件”中汇总。</div>
               </div>
             </div>
             <div>
                 <el-button type="primary" @click="startCheck()">开始检测</el-button>
             </div>
        </el-aside>
        <el-main>
             <div class="changeTab">
               <ul>
                  <li @click="changeTab(1)" :class="[activeItem === 1?'active':'']">文件列表</li>
                  <li @click="changeTab(2)" :class="[activeItem === 2?'active':'']">不合格文件</li>
               </ul>
             </div>
             <div class="detectionFile" v-loading="uploadLoading" element-loading-text="正在上传,请稍等">
                <div class="fileList" v-if="activeItem === 1" :class="[cancelPreviewFlag?'cancelPreview':'']">
                    <div class="fileListwrap" v-show="allImgList.length > 0"  ref="fileListwrap">
                         <div v-for="(item,index) in allImgList" :key="item.id" style="float:left;">
                            <div class="imgFile" @dblclick="previewImg(item)">
                              <div>
                                  <div class="pendingCheck" v-if="!item.isDetected">
                                    清晰度待检测
                                  </div>
                                  <div class="checkNormal" v-if="item.isDetected &&  parseInt(item.detectValue) >= parseInt(value8)">
                                    {{item.detectValue | numFilter}}
                                  </div>
                                  <div class="checkNoNormal" v-if="item.isDetected &&  parseInt(item.detectValue) < parseInt(value8)">
                                     {{item.detectValue | numFilter}}
                                  </div>
                                  <div>
                                      <img :src="item.fullName" alt="" v-if="item.fileType === 'bmp' || item.fileType === 'png' || item.fileType === 'gif' || item.fileType === 'jpg' || item.fileType === 'jpeg'">
                                      <img src="../assets/noLegalImg.png" alt="" v-if="item.fileType !== 'bmp' && item.fileType !== 'png' && item.fileType !== 'gif' && item.fileType !== 'jpg'  && item.fileType !== 'jpeg'">
                                      <div class="preview-eye">
                                          <i class="iconfont" @click="previewImg(item)" title="预览">&#xe7ef;</i>
                                      </div>
                                  </div>
                                </div>
                                <p v-bind:title="item.name">{{item.name}}</p>
                            </div>
                            <div v-bind:style="{ 'width': distance + 'px' }" style="float:left;height:230px;" v-if="(index+1)%num !== 0"></div>
                         </div>
                    </div>
                    <div  class="no-result" v-if="allImgList.length === 0 && !loading">
                      <img src="../assets/no_result.png" alt="">
                      <p style="text-align: center;">该列表暂无数据！</p>
                    </div>
                </div>
                <div class="fileList" v-if="activeItem === 2" :class="[cancelPreviewFlag?'cancelPreview':'']">
                  <div class="fileListwrap" v-show="noNormalList.length > 0"  ref="fileListwrapNo">
                      <div v-for="(item1,index1) in noNormalList" :key="item1.id" style="float:left;" v-if="item1.isDetected &&  parseInt(item1.detectValue) < parseInt(value8)">
                        <div class="imgFile" @dblclick="previewImg(item1)">
                          <div>
                            <div class="checkNoNormal">
                                {{item1.detectValue | numFilter}}
                            </div>
                            <div>
                                <img :src="item1.fullName" alt="" v-if="item1.fileType === 'bmp' || item1.fileType === 'png' || item1.fileType === 'gif' || item1.fileType === 'jpg' || item1.fileType === 'jpeg'">
                                <img src="../assets/noLegalImg.png" alt="" v-if="item1.fileType !== 'bmp' && item1.fileType !== 'png' && item1.fileType !== 'gif' && item1.fileType !== 'jpg'  && item1.fileType !== 'jpeg'">
                                <div class="preview-eye">
                                    <i class="iconfont" @click="previewImg(item1)" title="预览">&#xe7ef;</i>
                                </div>
                            </div>
                          </div>
                          <p v-bind:title="item1.name">{{item1.name}}</p>
                        </div>
                        <div v-bind:style="{ 'width': distanceNo + 'px' }" style="float:left;height:230px;" v-if="(index1+1)%noNormalNum !== 0"></div>
                      </div>
                  </div>
                  <div  class="no-result" v-show="noNormalList.length === 0">
                      <img src="../assets/no_result.png" alt="">
                      <p style="text-align: center;">该列表暂无数据！</p>
                    </div>
                </div>
                <div class="imgPreview" :class="[cancelPreviewFlag?'cancelPreview':'']">
                   <preview-img :imgObj="imgObj"></preview-img>
                </div>
                <div class="checking" v-if="loading">
                    <img src="../assets/checking.gif" alt="" >
                </div>
             </div>
        </el-main>
      </el-container>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import PreviewImg from '@/components/PreviewImg.vue'

@Component({
  components: { PreviewImg },
  filters: {
    numFilter(value) {
      // 截取当前数据到小数点后两位
      let realVal = Number(value).toFixed(0) // num.toFixed(2)获取的是字符串
      return Number(realVal)
    }
  }
})
export default class AutoDetection extends Vue {
  activeItem: number = 1
  cancelPreviewFlag: boolean = true
  distance: number = 0
  distanceNo: number = 0
  num: number = 0
  noNormalNum: number = 0
  allImgList: Array<any> = []
  timeOut: any = null
  timeOut1: any = null
  value8: any = ''
  firstFlag: any = true
  noNormalList: Array<any> = []
  loading: any = false
  uploadLoading: any = false
  defaultValue: any = '' // 默认的阀值
  imgObj: any = {}
  thresholdEnum: any = {
    code: '200',
    status: '200',
    message: 'success',
    data: []
  }
  thresholdEnumList: Array<Object> = []

  created() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
    if (this.timeOut1) {
      clearTimeout(this.timeOut1)
    }
    this.firstFlag = true
    // 获取阀值列表
    try {
      window.AutoDetectionActions.getThresholdEnum()
    } catch (error) {
      console.log(error)
    }
    // 解绑事件
    this.offEvent()
    // 绑定事件
    this.bindEvent()
  }

  mounted() {}

  // 绑定事件
  bindEvent() {
    this.$root.$data.eventHub.$on('closeImgPreview', () => {
      this.cancelPreviewFlag = true
      this.$nextTick(() => {
        if (this.activeItem === 1) {
          this.getImgDistance()
        } else {
          this.getImgDistanceNo()
        }
      })
    })

    this.$root.$data.eventHub.$on('autoDetection', data => {
      const detectFileInfo = data.detectFileInfo
      this.onThresholds(data.thresholds)

      // 选择文件
      this.onFileSelect(detectFileInfo)

      if (this.loading) {
        // 图片检测
        this.onDetection(detectFileInfo)
      }
    })

    this.$root.$data.eventHub.$on('page2login', this.clearData)
  }

  // 解绑事件
  offEvent() {
    this.$root.$data.eventHub.$off('autoDetection')
  }

  // 获取阈值回调
  onThresholds(thresholds) {
    if (thresholds.status === 'OK' && this.thresholdEnumList.length === 0) {
      this.thresholdEnumList = thresholds.data
      this.thresholdEnumList.forEach((item: any) => {
        if (item.cn === '推荐') {
          item.displayValue = item.en + '(推荐)'
          this.value8 = item.en
          this.defaultValue = item.en
        } else {
          item.displayValue = item.en
        }
      })
      this.firstFlag = false
    }
  }

  // 选择文件夹
  getDirectories() {
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'autoDetection',
      action: 'upLoadDirectory',
      active: true
    })
    try {
      window.AutoDetectionActions.upLoadDirectory()
    } catch (error) {
      console.log(error)
    }
  }

  // 选择文件夹回调
  onFileSelect(detectFileInfo) {
    // 未执行任何操作
    if (!detectFileInfo.Msg) {
      return
    }

    this.changeTab(1)
    // 正在上传图片
    if (detectFileInfo.upLoadDirectoryPath) {
      this.uploadLoading = true
      return
    }

    const isActionActive = this.$store.getters.isModuleActionActive('autoDetection', 'upLoadDirectory')
    if (!isActionActive) {
      return
    }
    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'autoDetection',
      action: 'upLoadDirectory',
      active: false
    })
    // 图片上传状态
    this.uploadLoading = false

    // 图片上传完成
    this.allImgList = detectFileInfo.directoryInfos
    if (detectFileInfo.directoryInfos.length) {
      this.allImgList.forEach(item => {
        item.fileType = item.name.substring(item.name.indexOf('.') + 1, item.name.length + 1).toLowerCase()
      })
      this.$nextTick(() => {
        if (this.activeItem === 1) {
          this.noNormalList = []
          this.getImgDistance()
        } else {
          this.getImgDistanceNo()
        }
      })
      this.$message({
        message: detectFileInfo.Msg,
        type: 'success',
        duration: 3000
      })
    } else {
      this.noNormalList = []
      this.$message({
        message: detectFileInfo.Msg,
        type: 'warning',
        duration: 3000
      })
    }

    // 选择图片后需要重置图片检测的状态
    this.loading = false
    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'autoDetection',
      action: 'detectAction',
      active: false
    })
  }

  // 图片检测
  startCheck() {
    if (this.allImgList.length === 0) {
      this.$message({
        message: '请先上传文件夹',
        type: 'warning',
        duration: 3000
      })
      return
    }
    if (this.value8 === '') {
      this.$message({
        message: '阀值不能为空',
        type: 'error',
        duration: 3000
      })
    } else {
      this.loading = true
      // 数据使用后将当前模块取消激活
      this.$store.dispatch('setModuleActionStatus', {
        moduleName: 'autoDetection',
        action: 'detectAction',
        active: true
      })
      let that = this
      this.timeOut = setTimeout(function() {
        try {
          window.AutoDetectionActions.detectAction(that.value8)
        } catch (error) {
          console.log(error)
        }
      }, 500)
    }
  }

  // 图片检测回调
  onDetection(detectFileInfo) {
    // 正在检测
    if (detectFileInfo.isChecking) {
      return
    }

    const isActionActive = this.$store.getters.isModuleActionActive('autoDetection', 'detectAction')
    if (!isActionActive) {
      return
    }

    // 数据使用后将当前模块取消激活
    this.$store.dispatch('setModuleActionStatus', {
      moduleName: 'autoDetection',
      action: 'detectAction',
      active: false
    })
    this.loading = false
    this.allImgList = detectFileInfo.directoryInfos
    if (detectFileInfo.directoryInfos.length) {
      this.allImgList.forEach(item => {
        item.fileType = item.name.substring(item.name.indexOf('.') + 1, item.name.length + 1).toLowerCase()
      })
      this.$nextTick(() => {
        if (this.activeItem === 1) {
          this.noNormalList = []
          this.getImgDistance()
        } else {
          this.getImgDistanceNo()
        }
      })
    } else {
      this.noNormalList = []
    }
    this.$message({
      message: '清晰度检测完成',
      type: 'success',
      duration: 3000
    })
    this.changeTab(2)
  }

  // 切换tab
  changeTab(type: number) {
    if (this.activeItem !== type) {
      this.activeItem = type
      this.cancelPreviewFlag = true
    }
    if (this.activeItem === 2) {
      this.noNormalList = []
      this.allImgList.forEach(item => {
        if (item.isDetected && parseInt(item.detectValue) < parseInt(this.value8)) {
          this.noNormalList.push(item)
        }
      })
      let that = this
      this.timeOut1 = setTimeout(() => {
        that.getImgDistanceNo()
      }, 10)
    } else {
      this.$nextTick(() => {
        this.getImgDistance()
      })
    }
  }

  // 预览图片
  previewImg(item) {
    this.cancelPreviewFlag = false
    if (this.activeItem === 2) {
      this.$nextTick(() => {
        this.getImgDistanceNo()
      })
    } else {
      this.$nextTick(() => {
        this.getImgDistance()
      })
    }
    this.imgObj = item
  }

  // 获取全部图片间的间距
  getImgDistance() {
    let aa: any = this.$refs.fileListwrap
    if (aa) {
      let width: number = aa.clientWidth - 49
      this.num = Math.floor(width / 120)
      if (this.num > this.allImgList.length) {
        this.distance = 24
        return
      }
      let extra: number = width % 120
      this.distance = extra / (this.num - 1)
      if (this.distance < 10) {
        this.num = this.num - 1
        this.distance = (width - this.num * 120) / (this.num - 1)
      }
    }
  }

  // 获取不合格图片间的间距
  getImgDistanceNo() {
    let aa: any = this.$refs.fileListwrapNo
    if (aa && aa.clientWidth > 0) {
      let width: number = aa.clientWidth - 49
      this.noNormalNum = Math.floor(width / 120)
      if (this.noNormalNum > this.noNormalList.length) {
        this.distanceNo = 24
        return
      }
      let extra: number = width % 120
      this.distanceNo = extra / (this.noNormalNum - 1)
      if (this.distanceNo < 10) {
        this.noNormalNum = this.noNormalNum - 1
        this.distanceNo = (width - this.noNormalNum * 120) / (this.noNormalNum - 1)
      }
    }
  }

  // 阈值变化
  change() {
    if (this.value8 === '') {
      this.value8 = this.defaultValue
    }
    if (!/(^[1-9]\d*$)/.test(this.value8) || parseInt(this.value8) > 2147483647) {
      this.$message({
        message: '阀值必须为大于0的整数，且不能超过2147483647',
        type: 'warning',
        duration: 3000
      })
      this.value8 = this.defaultValue
    }
    if (this.activeItem === 2) {
      this.noNormalList = []
      this.allImgList.forEach(item => {
        if (item.isDetected && parseInt(item.detectValue) < parseInt(this.value8)) {
          this.noNormalList.push(item)
        }
      })
      this.$nextTick(() => {
        this.getImgDistanceNo()
      })
    }
  }

  // 清空数据
  clearData() {
    this.activeItem = 1
    this.cancelPreviewFlag = true
    this.distance = 0
    this.distanceNo = 0
    this.num = 0
    this.noNormalNum = 0
    this.allImgList = []
    this.timeOut = null
    this.timeOut1 = null
    this.noNormalList = []
    this.loading = false
    this.uploadLoading = false
    this.imgObj = {}
    this.value8 = this.defaultValue
  }
}
</script>

<style lang="scss">
#autoDetection {
  height: 100%;
  p {
    margin: 0;
  }
  header {
    background-color: #42a0f8;
  }
  aside {
    width: 360px !important;
    padding: 30px 24px 32px;
    border-right: 1px solid #e8e8e8;
    > div {
      &:nth-child(1) {
        margin-bottom: 30px;
        p {
          &:nth-child(1) {
            color: #333;
            margin-bottom: 4px;
          }
          &:nth-child(2) {
            color: #999;
            margin-bottom: 14px;
          }
        }
        button {
          padding: 8px 20px;
          color: #42a0f8;
          span {
            display: inline-block;
            vertical-align: middle;
            height: 18px;
            line-height: 18px;
          }
          i {
            display: inline-block;
            color: #42a0f8;
            font-size: 18px;
            vertical-align: middle;
            position: relative;
            bottom: 1px;
            margin-right: 5px;
          }
        }
      }
      &:nth-child(2) {
        margin-bottom: 30px;
        p {
          &:nth-child(1) {
            color: #333;
            margin-bottom: 4px;
          }
          &:nth-child(2) {
            color: #999;
            margin-bottom: 14px;
          }
        }
        input {
          height: 36px;
          line-height: 36px;
          padding: 0 16px;
        }
        i {
          &:before {
            position: relative;
            top: -2px;
          }
          &:after {
            position: relative;
            top: 2px;
          }
        }
        .el-input__suffix {
          right: 8px;
        }
      }
      &:nth-child(3) {
        > label {
          color: #333;
          margin-bottom: 12px;
        }
        > div {
          > div {
            color: #999;
            margin-bottom: 12px;
            &:nth-child(1) {
              margin-top: 12px;
            }
          }
        }
      }
      &:nth-child(4) {
        position: absolute;
        bottom: 32px;
        left: 24px;
        width: calc(100% - 48px);
        button {
          width: 100%;
          border-radius: 0;
        }
      }
    }
  }
  main {
    padding: 0;
    .changeTab {
      height: 48px;
      line-height: 48px;
      border-bottom: 1px solid #e8e8e8;
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          float: left;
          margin: 0 24px;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          line-height: 47px;
          &.active {
            color: #42a0f8;
            border-bottom: 2px solid #42a0f8;
          }
          &:hover {
            color: #42a0f8;
          }
        }
      }
      span {
        float: right;
        margin-right: 24px;
        color: #42a0f8;
        cursor: pointer;
        vertical-align: middlel;
        i {
          vertical-align: middle;
          font-size: 18px;
          position: relative;
          bottom: 1px;
        }
      }
    }
    .detectionFile {
      position: relative;
      height: calc(100vh - 109px);
      overflow-x: hidden;
      .checking {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: #fff;
        img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: 100%;
          max-height: 100%;
          z-index: 100;
          background-color: #fff;
        }
      }
      .no-result {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
        text-align: center;
        img {
          margin-bottom: 10px;
        }
        p {
          margin: 0;
        }
      }
      .fileList {
        float: left;
        width: 60%;
        height: 100%;
        &.cancelPreview {
          width: 100%;
        }
        .fileListwrap {
          padding: 24px 24px 0 24px;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          max-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          .imgFile {
            width: 120px;
            height: 230px;
            float: left;
            margin-bottom: 16px;
            cursor: pointer;
            > div {
              border: 1px solid #ddd;
              > div {
                &:nth-child(1) {
                  height: 30px;
                  line-height: 30px;
                  text-align: center;
                  border-bottom: 1px solid #ddd;
                  &.pendingCheck {
                    background-color: #485a6c;
                    color: #fff;
                  }
                  &.checkNormal {
                    background-color: #0dc87b;
                    color: #fff;
                  }
                  &.checkNoNormal {
                    background-color: #efa208;
                    color: #fff;
                  }
                }
                &:nth-child(2) {
                  position: relative;
                  height: 170px;
                  &:hover {
                    .preview-eye {
                      display: block;
                    }
                  }
                  > img {
                    width: 100%;
                    position: absolute;
                    top: 50%;
                    transform: translate(0, -50%);
                  }
                  .preview-eye {
                    display: none;
                    width: 100%;
                    height: 32px;
                    line-height: 32px;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    background-color: rgba(0, 0, 0, 0.75);
                    text-align: center;
                    i {
                      color: #fff;
                      font-size: 18px;
                    }
                  }
                }
              }
            }
            p {
              max-width: 115px;
              overflow: hidden;
              height: 30px;
              line-height: 30px;
              text-align: center;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 12px;
              margin: 0 auto;
            }
          }
        }
      }
      .imgPreview {
        position: absolute;
        top: 0;
        left: 60%;
        float: right;
        height: 100%;
        background-color: #f4f6f8;
        width: calc(40% - 1px);
        border-left: 1px solid #e8e8e8;
        transition: left 0.5s;
        &.cancelPreview {
          left: 100%;
          // right: - calc(40% - 1px);
        }
      }
    }
  }
}
.el-select-dropdown__item.selected {
  background-color: #42a0f8 !important;
  color: #fff !important;
}
</style>


