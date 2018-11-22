<template>
    <el-container id="login">
      <el-header style="">
           <span class="header-title"><img src="../assets/logo-login.png" alt=""></span>
           <span cfx-ui-command="close" class="iconfont icon-guanbi header-close" title="关闭"></span>
      </el-header>
      <el-main>
          <form action="">
              <div class="login-item">
                 <input type="text" placeholder="请输入账号" v-model="userName" @input="userInput('userName')" @keyup.enter="login" maxlength="30">
                 <i class="iconfont user-i"> &#xe7e7;</i>
              </div>
              <div class="login-item" style="margin-bottom:18px;">
                 <input type="password" placeholder="请输入密码" v-model="password" @input="userInput()" @keyup.enter="login" maxlength="30">
                 <i class="iconfont password-i"> &#xe7cf;</i>
              </div>
              <div class="remenber-item">
                  <el-checkbox v-model="remember">记住密码</el-checkbox>
              </div>
              <div class="submit-item">
                   <el-button plain  @click="login()" :disabled="disabledFlag" :loading="loadingFlag && !disabledFlag">立即登录</el-button>
              </div>
          </form>
      </el-main>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  components: {}
})
export default class Login extends Vue {
  remember: any = false
  userName: any = ''
  cacheUserName: any = ''
  password: any = ''
  cachePassword: any = ''
  disabledFlag: boolean = true
  loadingFlag: boolean = false
  timeOut: any = null
  cacheFlag: any = true
  cacheRemember: any = false
  created() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
    window.LoginActions.readCache()
    // 点击登录后的回调，winform调用
    this.$root.$data.eventHub.$on('login', (data: any) => {
      console.log(data)
      if (this.cacheFlag === true) {
        this.remember = data.remember
        this.cacheRemember = data.remember
        this.userName = data.userName
        this.cacheUserName = data.userName
        this.cachePassword = data.password
        if (this.remember) {
          this.disabledFlag = false
          this.password = data.password
        }
        this.cacheFlag = false
      } else {
        if (data.isLoginSuccess) {
          this.loadingFlag = false
          if (!this.remember) {
            this.password = ''
            this.disabledFlag = true
          }
          // localStorage.setItem('userName', data.userName)
          // localStorage.setItem('password', data.password)
          // localStorage.setItem('remember', data.remember)
        } else {
          if (data.status !== null) {
            let that: any = this
            this.timeOut = setTimeout(() => {
              that.loadingFlag = false
              that.$message({
                message: data.message,
                type: 'error',
                customClass: 'loginMessage'
              })
            }, 1000)
          }
        }
      }
    })
  }

  mounted() {}

  // destroyed() {
  //   this.$root.$data.eventHub.$off('login')
  // }

  login() {
    if (!this.disabledFlag) {
      this.loadingFlag = true
      window.LoginActions.login(this.userName, this.password, this.remember)
    }
  }
  handleCheckOneChange() {}
  userInput(type: string) {
    if (type === 'userName') {
      this.password = ''
      if (this.cacheRemember) {
        if (this.userName === this.cacheUserName) {
          this.password = this.cachePassword
          console.log(this.cachePassword)
          console.log(this.password)
        }
      }
    }

    if (this.userName !== '' && this.password !== '') {
      this.disabledFlag = false
    } else {
      this.disabledFlag = true
    }
  }
}
</script>

<style lang="scss">
.loginMessage {
  margin-top: 120px;
}
#login {
  width: 360px;
  // margin: 200px auto 0;
  header {
    height: 48px !important;
    line-height: 48px;
    padding: 0 0 0 24px;
    background-color: #42a0f8;
    -webkit-app-region: drag;
    img {
      vertical-align: middle;
    }
    .header-close {
      cursor: pointer;
      float: right;
      color: white;
      font-size: 20px;
      -webkit-app-region: no-drag;
      padding: 0 12px;

      &:hover {
        background-color: #1d6ed2;
      }
    }
  }
  main {
    padding: 24px;
    .login-item {
      position: relative;
      margin-bottom: 24px;
      input {
        width: 100%;
        height: 36px;
        border: 1px solid #ddd;
        padding-left: 40px;
        padding-right: 2px;
        // text-indent: 40px;
        outline: none;
        box-sizing: border-box;
        &:focus {
          border: 1px solid #42a0f8 !important;
          + i {
            color: #42a0f8;
          }
        }
        &:hover {
          border: 1px solid #42a0f8 !important;
        }
      }
      i {
        position: absolute;
        left: 14px;
        top: 10px;
        &.user-i {
          color: #99a9bf;
        }
        &.password-i {
          color: #99a9bf;
        }
      }
    }
    .submit-item {
      margin-top: 28px;
      button {
        width: 100%;
        color: #42a0f8;
        border: 1px solid #42a0f8;
        border-radius: 0;
        &:hover {
          background-color: #42a0f8;
          color: #fff;
        }
        &.is-disabled {
          background-color: #f0f0f0;
          border: none;
          color: #ccc;
        }
      }
    }
    .remenber-item {
      position: relative;
      // > input {
      //   width: 14px;
      //   height: 14px;
      //   background-color: #fff;
      //   -webkit-appearance: none;
      //   border: 1px solid #c9c9c9;
      //   border-radius: 2px;
      //   outline: none;
      //   vertical-align: middle;
      //   margin-left: 0;
      //   border-radius: 0;
      //   &:focus,
      //   &:hover {
      //     border-color: #42a0f8;
      //   }
      // }
      // input[type='checkbox']:checked {
      //   background: url('../assets/gou.png') no-repeat center;
      //   background-color: #42a0f8;
      //   border: none;
      // }
      // em {
      //   display: inline-block;
      //   width: 20px;
      //   height: 14px;
      //   position: absolute;
      // }
      span {
        color: #333;
        left: 0;
        top: 0;
        vertical-align: middle;
      }
    }
  }
}
</style>


