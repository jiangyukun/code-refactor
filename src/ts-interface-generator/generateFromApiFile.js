let generateApiType = require('./generateApiType')
let {list} = require('./api-data.json')


console.log(list.filter(item => item.url != null).length);
for (let data of list) {
    if (data.url) {
        generateApiType(data.url, data.data)
    }
}

