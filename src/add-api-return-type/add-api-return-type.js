let fs = require('fs')
let path = require('path')
let recast = require('recast')
let tsParser = require('recast/parsers/typescript')

let config = require('../config')
let fileUtil = require('../utils/fileUtil')

let builders = recast.types.builders

function findTsFile(fileDir) {
    let list = fs.readdirSync(fileDir)
    for (let fileName of list) {
        let filePath = fileDir + '/' + fileName
        let stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {
            // 递归子文件夹
            let path = findTsFile(filePath)
            if (path) {
                return path
            }
        } else {
            if (filePath.endsWith('.ts')) {
                if (filePath.indexOf('effects') != -1) {
                    try {
                        let code = fs.readFileSync(filePath).toString()
                        parse(code, filePath)
                        // console.log(filePath)
                    } catch (e) {
                        console.log(filePath + ' 解析失败')
                    }

                }
            }
        }
    }
    return null
}

function parse(code, filePath) {
    let ast = recast.parse(code, {
        parser: require('recast/parsers/typescript')
    })
    let serviceRelativePath = null
    let typeAdded = false
    recast.visit(ast, {
        visitImportDeclaration(path) {
            let code = recast.print(path.value).code
            if (code.indexOf('services') != -1) {
                serviceRelativePath = path.value.source.value
            }
            return false
        },

        visitAwaitExpression(path) {
            let serviceUrl = null
            this.visit(path, {
                visitCallExpression(path) {
                    let methodName = path.value.callee.property.name;
                    serviceUrl = findServiceUrl(filePath, serviceRelativePath, methodName)
                    typeAdded = true
                    return false
                }
            })
            if (serviceUrl) {
                let interfaceName = findInterfaceName(serviceUrl)
                if (interfaceName) {
                    if (path.parentPath.value.type == 'VariableDeclarator') {
                        let id = builders.identifier.from({
                            name: path.parentPath.value.id.name,
                            typeAnnotation: builders.tsTypeAnnotation(builders.tsTypeReference(builders.identifier(interfaceName)))
                        })
                        path.parentPath.replace(builders.variableDeclarator(id, path.value))
                    }
                }
            }
            return false
        },

    })
    if (typeAdded) {
        // console.log(recast.print(ast).code);
        fileUtil.writeCodeToFile(filePath, recast.print(ast).code)
    }
}


function findServiceUrl(filePath, serviceRelativePath, methodName) {
    let url = path.join(filePath, '../', serviceRelativePath) + '/index.ts'
    let isExist = fs.existsSync(url)
    // console.log(url, isExist);
    if (!isExist) {
        return null
    }

    let code = fs.readFileSync(url).toString()
    let ast = recast.parse(code, {
        parser: require('recast/parsers/typescript')
    })
    let pathUrl = null
    recast.visit(ast, {
        visitObjectProperty(path) {
            // let code = recast.print(path.value).code
            if (path.value.key.name == methodName) {
                pathUrl = path.value.original.value.value
            }
            return false
        }
    })
    return pathUrl
}

function findInterfaceName(url) {
    let dir = fs.readdirSync(config.interfacesDirection)
    for (let fileName of dir) {
        let filePath = config.interfacesDirection + '/' + fileName
        let stat = fs.statSync(filePath)
        if (stat && stat.isDirectory()) {

        } else {
            if (filePath.endsWith('.ts')) {
                let code = fs.readFileSync(filePath).toString()
                if (code.indexOf(url) != -1) {
                    let ast = recast.parse(code, {parser: tsParser})
                    recast.visit(ast, {
                        visitExportNamedDeclaration(path) {
                            if (url.indexOf(path.value.comments[0].value) != -1) {
                                return path.value.declaration.id.name
                            }
                            return false
                        }
                    })
                    return 'Todo'
                }
            }
        }
    }
    return null
}

findTsFile(config.tsDirection)
