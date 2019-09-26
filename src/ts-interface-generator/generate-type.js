/**
 * 根据对象生成对应的 interface
 */
function generateObjectType(obj) {
    let keys = Object.getOwnPropertyNames(obj)

    let props = keys.reduce((result, key) => {
        let value = obj[key]
        let prop = `${key}: `
        if (value == null) {
            prop += 'any'
        } else if (typeof value === 'number') {
            prop += 'number'
        } else if (typeof value === 'boolean') {
            prop += 'boolean'
        } else if (typeof value === 'string') {
            prop += 'string'
        } else if (value instanceof Array) {
            prop += generateArrayType(value)
        } else if (typeof value == 'object') {
            prop += generateObjectType(value)
        }
        return result + '\n' + prop
    }, '')
    return '{\n' + props + '\n}'
}

function generateArrayType(arr) {
    let item = arr[0]
    if (item == null) {
        return 'any[]'
    }
    if (typeof item == 'string') {
        return 'string[]'
    }
    if (typeof item == 'number') {
        return 'number[]'
    }
    if (typeof item == 'boolean') {
        return 'boolean[]'
    }
    return generateObjectType(item) + '[]'
}

function generate(modal, interfaceName) {
    if (modal == null) {
        return null
    }
    let props
    if (modal instanceof Array) {
        if (modal[0]) {
            props = generateObjectType(modal[0])
            return `interface ${interfaceName} 
      ${props}
      `
        }

    } else if (typeof modal == 'object') {
        props = generateObjectType(modal)
        return `interface ${interfaceName} 
      ${props}
      `
    }
    return null

}


module.exports = generate
