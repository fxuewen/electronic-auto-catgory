<template>
    <div class="select-catgory-container">
        <div class="catgory auto" v-for="(item, index) in itemArr" v-bind:key="index">
          <div class="catgory-icon"></div>
          <div class="catgory-action"><a @click="selectCatgory(item)">{{item.title}}</a></div>
          <div>{{item.discrip}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    propMessage: String
  }
})
export default class SelectCatgory extends Vue {
  msg: string = 'this is a component named width select-catgory'
  itemArr: Array<Object> = []

  data() {
    return {
      // Will be reactive
      msg: 'msg',
      itemArr: [
        {
          title: '自动编目',
          name: 'auto',
          icon: '',
          discrip:
            '系统支持对目录图片上传，并解析图片中卷宗目录的内容，自动将目录文件所在文件夹内的文件进行编目，在系统中生成树形结构展示'
        },
        {
          title: '手动编目',
          name: 'hand',
          icon: '',
          discrip:
            '系统支持打开已存在的文件夹，如本地已整理好文件夹目录结构，则系统会复制一份该目录结构，同时提供手动编辑目录功能'
        }
      ]
    }
  }

  created() {
    // console.log(`created:${this.msg}`)
  }

  // 计算属性
  get computedMsg(): string {
    return 'computed ' + this.msg
  }

  mounted() {
    // console.log(`mounted:${this.msg}`)
  }

  selectCatgory(item: any) {
    try {
      console.log(`${item.title}`)
      window.IndexActions.getFiles()
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;

.select-catgory-container {
  text-align: center;
  margin-top: 80px;

  .catgory {
    padding: 40px 16px 40px 16px;
    color: #999;

    .catgory-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 1px solid #ddd;
      display: inline-block;
    }

    .catgory-action {
      margin-top: 20px;
      margin-bottom: 8px;
      color: $defaultBlue;

      a {
        cursor: pointer;
        font-size: 16px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>


