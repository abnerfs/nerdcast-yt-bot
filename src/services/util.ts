export const changeExt = (pathStr: string, ext: string) => {
    const arr = pathStr.split('.');
    arr.pop();

    return arr.join('.') + ext;
}