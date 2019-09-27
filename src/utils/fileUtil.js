let fs = require('fs')
let path = require('path')
let mkdirp = require('mkdirp')

function writeCodeToFile(distPath, code) {
    if (!code) {
        return
    }
    let distDir = distPath.substring(0, distPath.lastIndexOf('/') + 1)
    mkdirp(distDir, () => {
        fs.writeFileSync(distPath, code)
    })
}

function getRelativePath(currentModulePath, depModulePath) {
    let currentPath = currentModulePath
    let out = ''
    if (depModulePath.indexOf(currentModulePath) != -1) {
        return ('./' + depModulePath.substring(currentModulePath.length)).replace('//', '/')
    }
    while (depModulePath.indexOf(currentPath) == -1) {
        currentPath = path.join(currentPath, '../')
        out += '../'
    }
    out += depModulePath.substring(currentPath.length)
    return out
}

module.exports = {
    writeCodeToFile,
    getRelativePath
}


/*
let d = getRelativePath('a/b/c', 'a/c/d')
console.log(d);

let d1 = getRelativePath('a/b', 'a/b/c')
console.log(d1);

let d2 = getRelativePath('a/b/', 'a/b/c/d')
console.log(d2);
*/
