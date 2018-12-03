<template>
    <el-container class="admin-container">
        <el-header>
          <span class="header-title"><img src="../assets/title_logo.png"></span>
          <span class="header-routes">
            <router-link tag="li" class="router-link" to="/category">
              <span class="iconfont icon-icon-juanzongbianmu"></span>
              <span class="text">卷宗自动编目</span>
            </router-link>
            <router-link tag="li" class="router-link" to="/detection">
              <span class="iconfont icon-icon-qingxidujiance"></span>
              <span class="text">卷宗智能检测</span>
            </router-link>
          </span>
          <span class="header-title-btns">
            <span class="group-user">
              <el-dropdown>
                <span class="el-dropdown-link">
                  <span class="group-user-icon iconfont icon-icon-yonghu"></span>
                  {{userInfo.userName || ''}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown" class="admin-dropdown-menu">
                  <el-dropdown-item @click.native="showSettingDialog"><span class="iconfont icon-icon-shezhi"></span>系统设置</el-dropdown-item>
                  <el-dropdown-item :divided="true" @click.native="loginOut"><span class="iconfont icon-icon-tuichudenglu"></span>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
            <span cfx-ui-command="minimize" class="btn">
              <i class="iconfont icon-zuixiaohua" title="最小化"></i>
            </span>
            <span ref="closeBtn" :cfx-ui-command="close" class="btn" @click="closeClient">
              <i class="iconfont icon-guanbi" title="关闭"></i>
            </span> 
          </span>
        </el-header>
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
        <setting :settingDialog.sync="settingDialog"></setting>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Setting from '@/components/Setting.vue'

@Component({
  components: { Setting }
})
export default class Admin extends Vue {
  msg: string = '首页'

  settingDialog: boolean = false

  userInfo: Object = {}

  close: string = 'keep'

  created() {}

  mounted() {
    this.$root.$data.eventHub.$on('closeSettingDialog', this.closeSettingDialog)
    this.$root.$data.eventHub.$on('admin', this.updateData)
  }

  updateData(data) {
    this.userInfo = data.userInfo || {}
  }

  // 打开设置对话框
  showSettingDialog() {
    this.settingDialog = true
  }

  destroyed() {
    this.$root.$data.eventHub.$off('closeSettingDialog')
    this.$root.$data.eventHub.$off('admin')
  }

  // 关闭设置对话框
  closeSettingDialog() {
    this.settingDialog = false
  }

  // 关闭客户端
  closeClient(): void {
    if (this.close === 'close') {
      this.close = 'keep'
      return
    }
    this.$confirm('是否退出', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      type: 'warning'
    })
      .then(() => {
        this.close = 'close'
        const closeBtn: any = this.$refs.closeBtn
        this.$nextTick(() => {
          closeBtn.click()
        })
      })
      .catch(() => {
        this.close = 'keep'
      })
  }

  // 退出登录
  loginOut() {
    // 退出登录前清空数据
    this.$root.$data.eventHub.$emit('page2login', true)
    try {
      window.Admin.loginout()
    } catch (error) {}
  }
}
</script>

<style lang="scss">
$defaultBlue: #42a0f8;
$hoverBlue: #5fb1fe;
$clickBlue: #2e96f7;

.admin-container {
  height: 100%;

  header {
    background-color: $defaultBlue;
    color: #fff;
    line-height: 60px;

    &.el-header {
      padding-left: 24px;
      padding-right: 0;
    }

    .header-title {
      img {
        vertical-align: middle;
      }
    }

    .header-routes {
      margin-left: 150px;
      display: inline-block;
      height: 100%;

      .router-link {
        height: 58px;
        display: inline-block;
        cursor: pointer;
        padding: 0 16px;
        vertical-align: middle;
        transform: perspective(1px) translateZ(0);

        &:before {
          content: ' ';
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(66, 160, 248, 0), rgba(0, 72, 218, 1));
          top: -1px;
          left: 0;
          bottom: 0;
          right: 0;
          opacity: 0.5;
          transform: scaleY(0);
          transform-origin: 50% 100%;
          transition-property: transform;
          transition-duration: 0.3s;
          transition-timing-function: ease-out;
        }
        &:hover:before,
        &.router-link-active:before {
          transform: scaleY(1);
        }

        span {
          display: inline-block;
          position: relative;
          font-size: 16px;
          color: #fff;
          &.text {
            height: 35px;
            line-height: 35px;
            font-size: 14px;
          }
        }
      }
    }

    .header-title-btns {
      float: right;
      white-space: nowrap;
      .group-user {
        height: 60px;
        line-height: 60px;
        display: inline-block;
        position: relative;

        .el-dropdown {
          height: 30px;
          color: #fff;
          height: 46px;

          .el-dropdown-link {
            position: relative;
            cursor: pointer;
            height: 60px;
            line-height: 60px;
            display: inline-block;
            top: -2px;
            padding: 0 16px;

            &:hover {
              background-color: #1d6ed2;
            }

            .group-user-icon {
              font-size: 30px;
              float: left;
              margin-right: 8px;
            }
          }
        }
      }

      .btn {
        height: 59px;
        cursor: pointer;
        display: inline-block;
        padding: 0 16px;

        &:hover {
          background-color: #1d6ed2;
        }

        i {
          font-size: 20px;
        }
      }
    }
  }
}

.admin-dropdown-menu {
  li {
    width: 118px;
  }

  &.el-popper[x-placement^='bottom'] .popper__arrow {
    display: none;
  }
}
</style>