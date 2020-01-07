let path = require('path')
let fs = require('fs')
let Prettier = require('prettier')

let generateType = require('./generate-type')
let {writeCodeToFile} = require("../utils/fileUtil")

module.exports = function (url, data) {
    let convertUrl = url
    if (convertUrl.indexOf('|') != -1) {
        convertUrl = url.split('|')[0]
    }
    let parts = convertUrl.split('/')
    if (parts[0] == '') {
        parts.shift()
    }

    let interfaceName = parts.reduce((name, item) => {
        if (/^\d+$/.test(item)) {
            return name + '_Num'
        }
        if (item == 'true' || item == 'false') {
            return name + '_Bool'
        }
        item = item.replace(/-\w/g, item=>item[1].toUpperCase()).replace(':', '')
        return name + item.replace(item[0], item[0].toUpperCase())
    }, '') + '_Type'

    // console.log(interfaceName)

    let interfaceTxt = generateType(data, interfaceName)
    if (interfaceTxt) {
        interfaceTxt = `// ${url} \nexport ` + interfaceTxt

        let interfacePath = path.join(__dirname, `dist/${parts[0]}.ts`)
        if (parts[0] == 'models') {
            interfacePath = path.join(__dirname, `dist/${parts[1]}.ts`)
        }

        let oldContent = ''
        if (fs.existsSync(interfacePath)) {
            oldContent = fs.readFileSync(interfacePath).toString()
        }

        if (oldContent.indexOf(interfaceName) == -1) {
            writeCodeToFile(interfacePath, Prettier.format(oldContent + '\n\n' + interfaceTxt, {parser: 'typescript',printWidth: 150, semi:false}))
        } else {
            console.log(`    重复的interface ${interfaceName}`)
        }
    }
}
