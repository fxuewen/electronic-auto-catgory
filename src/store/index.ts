import Vue from 'vue'
import Vuex, { ActionTree, MutationTree } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import State from './state.d'

Vue.use(Vuex)

let state: State = {
	admin: {
		active: true,
		actions: {
			loginout: false
		}
	},
	autoDetection: {
		active: true,
		actions: {
			upLoadDirectory: false,
			detectAction: false,
			getThresholdEnum: false,
			openDirectory: false
		}
	},
	debugging: {
		active: true,
		actions: {
			debug: false,
			debuggingState: false
		}
	},
	index: {
		active: true,
		actions: {
			loadData: false,
			getFiles: false,
			getMenuFile: false,
			getDirectoryInfo: false,
			uploadDirectoryFloder: false,
			uploadDirectoryImg: false,
			createCatalogues: false,
			createCataloguesMenu: false
		}
	},
	login: {
		active: true,
		actions: {
			login: false,
			readCache: false
		}
	},
	settingPage: {
		active: true,
		actions: {
			getConfigInfo: false,
			changeDownloadDefaultFolder: false,
			changeAllowCreatePdf: false,
			openFolder: false
		}
	}
}

export default new Vuex.Store({
	state,
	actions,
	getters,
	mutations
})
