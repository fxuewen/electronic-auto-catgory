export default interface State {
	admin: {
		active: boolean
		actions: {
			loginout: boolean
		}
	}
	autoDetection: {
		active: boolean
		actions: {
			upLoadDirectory: boolean
			detectAction: boolean
			getThresholdEnum: boolean
			openDirectory: boolean
		}
	}
	debugging: {
		active: boolean
		actions: {
			debug: boolean
			debuggingState: boolean
		}
	}
	index: {
		active: boolean
		actions: {
			loadData: boolean
			getFiles: boolean
			getMenuFile: boolean
			getDirectoryInfo: boolean
			uploadDirectoryFloder: boolean
			uploadDirectoryImg: boolean
			createCatalogues: boolean
			createCataloguesMenu: boolean
		}
	}
	login: {
		active: boolean
		actions: {
			login: boolean
			readCache: boolean
		}
	}
	settingPage: {
		active: boolean
		actions: {
			getConfigInfo: boolean
			changeDownloadDefaultFolder: boolean
			changeAllowCreatePdf: boolean
			openFolder: boolean
		}
	}
}
