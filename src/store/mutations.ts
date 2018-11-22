import TYPES from './types'
import { MutationTree } from 'vuex'
// 模块方法映射关系
const moduleMap = {
  admin: 'Admin',
  autoDetection: 'AutoDetectionActions',
  debugging: 'DebugActions',
  index: 'IndexActions',
  login: 'LoginActions',
  settingPage: 'SettingActions'
}

const mutations: MutationTree<any> = {
  [TYPES.SET_MODULE_STATUS](state, status: { moduleName: string, active: boolean }): void {
    const active = status.active === undefined ? false : status.active
    state[status.moduleName].active = active
    const actions = state[status.moduleName].actions
    if (!active) {
      Object.keys(actions).forEach(key => {
        actions[key] = false
      })
    }
  },

  [TYPES.SET_MODULE_ACTIONS_STATUS](state, status: { moduleName: string, action: string, active: boolean }): void {
    const moduleName: string = status.moduleName
    const action: string = status.action
    const active: boolean = status.active === undefined ? true : status.active
    // 更新对应模块中方法的状态
    state[moduleName].actions[action] = active
    // 模块的整体激活状态，当模块内有方法是激活状态时，模块应为激活状态
    let moduleActive: boolean = false
    if (active) {
      moduleActive = true
    } else {
      // 取消时需要更新当前模块的整体状态
      const actions = state[moduleName].actions
      Object.keys(actions).forEach(key => {
        if (actions[key]) {
          moduleActive = true
        }
      })
      state[moduleName]
    }
    state[moduleName].active = moduleActive
  }
}
export default mutations
