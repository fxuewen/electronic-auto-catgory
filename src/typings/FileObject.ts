export default interface FileObject {
    name: string,
    path: string,
    fullName: string,
    children: Array<Object>,
    type: 0 | 1
}