<template>
    <div :class="['category-item-content item-content',{ 'file': file.type==0, 'folder': file.type==1}]" @mouseover="itemOver(file.id)" @mouseout="itemOut()">
        <div :class="{'folder': file.type==1, 'file': file.type==0, 'draging': file.draging, 'move': file.move}">
            <div class="item-content-icon" :class="{'bordered':currentItemOverId === file.id}" @dblclick="dblclickToPreview(file)">
              <span v-show="file.checked" class="icon-check"><i class="iconfont icon-icon-xuanzhong"></i></span>
              <img v-if="file.type==0" :src="imgUrl">
              <svg v-else class="icon" aria-hidden="true">
                <use xlink:href="#icon-icon-wenjianjia"></use>
              </svg>
              <div class="item-content-bot" v-show="currentItemOverId === file.id" @click.stop>
                <span title="预览" @click="dblclickToPreview(file)" v-if="file.type === 0">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-icon-yulan"></use>
                  </svg>
                </span>
                <span title="删除" @click="deleteItem(file)">
                  <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-icon-shanchu"></use>
                  </svg>
                </span>   
              </div>
            </div>
            <div class="item-content-text" :title="file.name">{{file.name}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Utils from '../utils/utils'

@Component({
  props: {
    file: Object
  }
})
export default class FileContent extends Vue {
  // 开发模式下显示的图片，发布时需改为false，使用真实图片路径
  isDebug: boolean = true
  currentItemOverId: string = ''

  created() {}

  mounted() {}

  destroyed() {
    this.$root.$data.eventHub.$off('debugging')
  }

  // 鼠标经过文件单元
  itemOver(id) {
    this.currentItemOverId = id
  }
  // 鼠标离开文件单元
  itemOut() {
    this.currentItemOverId = ''
  }

  // 删除文件单元
  deleteItem(file) {
    this.currentItemOverId = file.id
    this.$root.$data.eventHub.$emit('deleteFiles', [file])
  }

  // 点击预览
  dblclickToPreview(file) {
    this.$root.$data.eventHub.$emit('dblclickToPreviewEvent', file)
  }

  // 计算属性
  get imgUrl() {
    const file = this.$props.file
    const extension = Utils.getNameExtension(file.name)
    const images = ['jpg', 'jpeg', 'png', 'bmp', 'gif']
    let imgUrl = this.$props.file.fullName
    if (images.indexOf(extension) < 0) {
      imgUrl = '../assets/noLegalImg.png'
    }
    if (this.isDebug) {
      imgUrl = 'http://i7.hexunimg.cn/2013-08-13/157022446.jpg'
    }
    return imgUrl
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;
.category-item-content {
  .file,
  .folder {
    border: 1px solid transparent;

    &.draging {
      border: 1px solid $defaultBlue;
      .item-content-icon {
        opacity: 0.5;
      }
    }

    &.move {
      border: 1px dashed $defaultBlue;
      .item-content-icon {
        opacity: 0;
      }

      .item-content-text {
        opacity: 0;
      }
    }
  }

  .item-content-icon {
    width: 120px;
    height: 150px;
    // box-sizing: border-box;
    // border: 1px solid #ddd;
    border: 1px solid transparent;
    background-color: #fff;
    position: relative;
    outline: none;
    // border: 1px solid red;
    &.bordered {
      border: 1px solid $hoverBlue;
      // width: 128px;
      // height: 148px;
      // box-sizing: border-box;
    }
    .item-content-bot {
      display: flex;
      background-color: #404040 !important;
      width: calc(100% + 2px);
      height: 32px;
      line-height: 32px;
      position: absolute;
      bottom: 0;
      left: -1px;
      text-align: center;
      span {
        text-align: center;
        align-items: stretch;
        svg {
          cursor: pointer;
          display: inline-block;
          // width: 20px;
          height: 22px;
          margin-top: 5px;
          &.icon {
            use {
              stroke-width: 1;
              fill: white;
            }
          }

          &:hover {
            use {
              stroke-width: 1;
              fill: $hoverBlue;
            }
          }

          &:active {
            use {
              stroke-width: 1;
              fill: $clickBlue;
            }
          }
        }
      }
    }

    .icon-check {
      position: absolute;
      right: -2px;
      top: -2px;
      color: #23ca85;

      i {
        font-size: 24px;
      }
    }

    img {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .item-content-text {
    max-width: 120px;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    margin: 0 auto;
  }
}
</style>


