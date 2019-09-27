let express = require('express')
let path = require('path')
let fs = require('fs')
let bodyParse = require('body-parser')


let generateApiType = require('./generateApiType')
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


app.post('/generateApiType', (req, res) => {

    let url = req.body.url
    let data = req.body.data
    if (apiList.find(item => item.url == url) == undefined) {
        apiList.push({url, data})
    }

    generateApiType(url, data)

    res.send('ok')
})

app.post('/generateApiTypes', (req, res) => {
    let list = req.body.list

    for (let apiData of list) {
        let url = apiData.url
        let data = apiData.data
        if (apiList.find(item => item.url == url) == undefined) {
            apiList.push({url, data})
        }

        generateApiType(url, data)
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
