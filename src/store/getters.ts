import { GetterTree } from 'vuex'

const getters: GetterTree<any, any> = {
  // 模块激活状态
  isModuleActive: (state) => (name) => {
    return state[name].active
  },
  // 模块内方法激活状态
  isModuleActionActive: (state) => (name, action) => {
    return state[name].actions[action]
  }
}

export default getters
