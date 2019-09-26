let express = require('express')
let path = require('path')
let fs = require('fs')
let bodyParse = require('body-parser')

let generateType = require('./generate-type')
let {writeCodeToFile} = require("../utils/fileUtil")

const app = express()
app.use(bodyParse.json())
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

let apiList = []

app.post('/generate', (req, res) => {

    let url = req.body.url
    let data = req.body.data

    apiList.push({url, data})

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
        item = item.replace('-', '').replace(':', '')
        return name + item.replace(item[0], item[0].toUpperCase())
    }, '') + '_Type'

    console.log(interfaceName)

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
            writeCodeToFile(interfacePath, oldContent + '\n\n' + interfaceTxt)
        } else {
            console.log(`    重复的interface ${interfaceName}`)
        }
    }
    res.send('ok')
})

/**
 * 缓存前端发过来的api数据，避免重复的前端点击操作去生成对应的interface
 */
app.get('/save', (req, res) => {
    writeCodeToFile(path.join(__dirname, 'api-data.json'), JSON.stringify({list: apiList}))
    res.send('ok')
})

app.listen(3333, () => console.log('interface generator listening on port 3333!'))
