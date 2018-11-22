interface FileObject {
    name: string,
    path: string,
    fullName: string,
    children: Array<Object>,
    type: 0 | 1,
    id: string,
    temp?: true | false
    checked: false | true,
    draging: false | true,
    move: false | true,
    input: {
        show: false | true,
        value: string,
        type: string
    }
}

interface FileListChangeData {
    selects: Array<FileObject>,
    draging: FileObject,
    target: FileObject,
    outer: boolean
}

export { FileObject, FileListChangeData }