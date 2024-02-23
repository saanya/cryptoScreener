exports.unpack = (param) => {
  return new Promise((resolve, reject) => {
    let result = null

    try {
      result = JSON.parse(JSON.stringify(param[0]))
    } catch (err) {
      reject(err)

      return
    }

    resolve(result)
  })
}

exports.unpackMulti = (params) => {
  return new Promise((resolve, reject) => {
    let results = []

    try {
      results = JSON.parse(JSON.stringify(params))
    } catch (err) {
      reject(err)

      return
    }

    resolve(results)
  })
}
