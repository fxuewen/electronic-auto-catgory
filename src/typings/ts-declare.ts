declare global {
    interface Window {
        vm: Object,
        // 首页winform提供的接口对象
        IndexActions: any,
    }
}
export default global;