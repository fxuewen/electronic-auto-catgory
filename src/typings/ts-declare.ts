declare global {
  interface Window {
    vm: Object
    // 首页winform提供的接口对象
    IndexActions: {
      loadData: Function
      getFiles: Function
      getMenuFile: Function
      getDirectoryInfo: Function,
      uploadDirectoryFloder: Function
      uploadDirectoryImg: Function
    }
    LoginActions: {
      login: Function
      readCache: Function
    }
    SettingActions: {
      getConfigInfo: Function
      changeDownloadDefaultFolder: Function
      changeAllowCreatePdf: Function
      openFolder: Function
    }
    AutoDetectionActions: {
      upLoadDirectory: Function
      detectAction: Function
      getThresholdEnum: Function
      openDirectory: Function
    }
    Admin: {
      loginout: Function
    }
    DebugActions: {
      debug: Function
      debuggingState: Function
    }
    userOrpasswordErrer: Function
    eDossier: any
  }
}
export default global
