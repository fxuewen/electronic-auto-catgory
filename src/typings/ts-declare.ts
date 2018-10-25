declare global {
    interface Window {
        vm: Object,
        // 首页winform提供的接口对象
        IndexActions: {
            getFiles:Function,

        }
    }
    // interface IndexActions{
    //     GetFiles:Function,
    // }
}
export default global;