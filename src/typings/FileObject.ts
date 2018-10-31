interface FileObject {
    name: string,
    path: string,
    fullName: string,
    children: Array<Object>,
    select: 0 | 1,
    type: 0 | 1
}

interface FileListChangeData {
    selects: Array<FileObject>,
    target: FileObject,
    dragParent: FileObject
}

export { FileObject, FileListChangeData }