import { ActionTree } from 'vuex'
import TYPES from './types'

const actions: ActionTree<any, any> = {
  // 设置模块的激活状态
  setModuleStatus({ state, commit }, status: { moduleName: string, active: boolean }): void {
    commit(TYPES.SET_MODULE_STATUS, status)
  },
  // 设置模块内方法的激活状态
  setModuleActionStatus({ state, commit }, status: { moduleName: string, action: string, active: boolean }): void {
    commit(TYPES.SET_MODULE_ACTIONS_STATUS, status)
  }
}

export default actions
