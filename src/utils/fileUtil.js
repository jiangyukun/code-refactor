let fs = require('fs')
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

module.exports = {
    writeCodeToFile
}
