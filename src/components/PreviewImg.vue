<template>
    <div id="preview-img">
        <div class="imgPreview-title">
            <span><div>图片预览：</div><div v-bind:title="imgObj.name">{{imgObj.name}}</div></span>
            <i class="iconfont" @click="canelPreview()" title="关闭">&#xe7d1;</i>
            <i class="iconfont"  @click="openDirectory()" title="打开文件夹" style="margin-right:10px;">&#xe7ec;</i>
        </div>
        <div class="imgPreview-content">
             <div>
                <img :src="imgObj.fullName" alt="" v-if="imgObj.fileType === 'bmp' || imgObj.fileType === 'png' || imgObj.fileType === 'gif' || imgObj.fileType === 'jpg' || imgObj.fileType === 'jpeg'">
                <div v-if="imgObj.fileType !== 'bmp' && imgObj.fileType !== 'png' && imgObj.fileType !== 'gif' && imgObj.fileType !== 'jpg' && imgObj.fileType !== 'jpeg'">
                  <img src="../assets/noLegalImgBig.png" alt="">
                  <p>无法预览此格式图片，仅支持BMP、JPG、PNG、JPEG、GIF格式预览</p> 
                </div>
                
             </div>
        </div> 
    </div> 
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    imgObj: Object
  }
})
export default class PreviewImg extends Vue {
  created() {}

  mounted() {}

  canelPreview() {
    this.$root.$data.eventHub.$emit('closeImgPreview')
  }

  // 打开文件夹
  openDirectory() {
    window.AutoDetectionActions.openDirectory(this.$props.imgObj.fullName)
  }
}
</script>


<style lang="scss">
#preview-img {
  width: 100%;
  height: 100%;
  .imgPreview-title {
    height: 40px;
    line-height: 40px;
    background-color: #fff;
    span {
      display: inline-block;
      margin-left: 24px;
      width: calc(100% - 100px);
      color: #333;
      font-size: 16px;
      line-height: 40px;
      div {
        &:nth-child(1) {
          display: inline-block;
          font-size: 16px;
          font-style: normal;
          vertical-align: middle;
        }
        &:nth-child(2) {
          display: inline-block;
          color: #333;
          font-size: 16px;
          cursor: text;
          max-width: calc(100% - 100px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
      }
    }
    i {
      float: right;
      margin-right: 22px;
      font-size: 18px;
      cursor: pointer;
      position: relative;
      top: 1px;
      &:hover {
        color: #42a0f8;
      }
    }
  }
  .imgPreview-content {
    width: 100%;
    height: calc(100% - 41px);
    padding: 8px;
    box-sizing: border-box;
    > div {
      height: 100%;
      width: 100%;
      // background-color: #fff;
      position: relative;
      > img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
      }
      > div {
        width: 80%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
        text-align: center;
        p {
          text-align: center;
          margin-top: 8px;
        }
      }
    }
  }
}
</style>


