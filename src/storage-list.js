const fs = require('fs')
const path = require('path')
const util = require('util')

module.exports = {
  setup: util.promisify((storage, moduleName, callback) => {
    if (!callback) {
      if (moduleName) {
        callback = moduleName
        moduleName = null
      } else if (storage) {
        callback = storage
        storage = null
      }
    }
    const bucketName = process.env[`${moduleName}_S3_BUCKET_NAME`] || process.env.S3_BUCKET_NAME
    const storagePath = process.env[`${moduleName}_STORAGE_PATH`] || process.env.STORAGE_PATH || '/data'
    const dashboardPath1 = path.join(global.applicationPath, 'node_modules/@userdashboard/dashboard/src/log.js')
    let Log
    if (fs.existsSync(dashboardPath1)) {
      Log = require(dashboardPath1)('s3-list')
    } else {
      const dashboardPath2 = path.join(global.applicationPath, 'src/log.js')
      Log = require(dashboardPath2)('s3-list')
    }
    const container = {
      add: util.promisify((path, itemid, callback) => {
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/list/${path}/${itemid}`,
          Body: ''
        }
        return storage.s3.putObject(params, (error) => {
          if (error) {
            Log.error('error writing', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      }),
      addMany: util.promisify((items, callback) => {
        const keys = Object.keys(items)
        function nextItem () {
          if (!items.length) {
            return callback()
          }
          const path = keys.shift()

          const params = {
            Bucket: bucketName,
            Key: `${storagePath}/list/${path}/${items[path]}`,
            Body: ''
          }
          return storage.s3.putObject(params, (error) => {
            if (error) {
              Log.error('error writing', error)
              return callback(new Error('unknown-error'))
            }
            return callback()
          })
        }
        return nextItem()
      }),
      count: util.promisify((path, callback) => {
        const params = {
          Bucket: bucketName,
          MaxKeys: 2147483647,
          Prefix: `${storagePath}/list/${path}`
        }
        return storage.s3.listObjectsV2(params, (error, data) => {
          if (error) {
            Log.error('error listing', error)
            return callback(new Error('unknown-error'))
          }
          if (data && data.Contents && data.Contents.length) {
            return callback(null, data.Contents.length)
          }
          return callback(null, 0)
        })
      }),
      exists: util.promisify((path, itemid, callback) => {
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/list/${path}/${itemid}`
        }
        return storage.s3.headObject(params, (error, found) => {
          if (error && error.code !== 'NotFound') {
            Log.error('error checking exists', error)
            return callback(new Error('unknown-error'))
          }
          return callback(null, found !== null && found !== undefined)
        })
      }),
      list: util.promisify((path, offset, pageSize, callback) => {
        if (!callback) {
          if (pageSize) {
            callback = pageSize
            pageSize = null
          } else if (offset) {
            callback = offset
            offset = null
          }
        }
        offset = offset || 0
        if (pageSize === null || pageSize === undefined) {
          pageSize = global.pageSize
        }
        if (offset < 0) {
          return callback(new Error('invalid-offset'))
        }
        const params = {
          Bucket: bucketName,
          MaxKeys: 2147483647,
          Prefix: `${storagePath}/list/${path}`
        }
        return storage.s3.listObjectsV2(params, (error, listedObjects) => {
          if (error) {
            Log.error('error listing', error)
            return callback(new Error('unknown-error'))
          }
          if (listedObjects.substring) {
            try {
              listedObjects = JSON.parse(listedObjects)
            } catch (error) {
            }
          }
          if (listedObjects && listedObjects.Contents && listedObjects.Contents.length) {
            const list = listedObjects.Contents
            if (offset) {
              list.splice(0, offset)
            }
            if (list.length > pageSize) {
              list.length = pageSize
            }
            for (const i in list) {
              list[i] = list[i].split('/').pop()
            }
            return callback(null, list)
          }
          return callback()
        })
      }),
      listAll: util.promisify((path, callback) => {
        const params = {
          Bucket: bucketName,
          MaxKeys: 2147483647,
          Prefix: `${storagePath}/list/${path}`
        }
        return storage.s3.listObjectsV2(params, (error, listedObjects) => {
          if (error) {
            Log.error('error listing', error)
            return callback(new Error('unknown-error'))
          }
          if (listedObjects.substring) {
            try {
              listedObjects = JSON.parse(listedObjects)
            } catch (error) {
            }
          }
          if (listedObjects && listedObjects.Contents && listedObjects.Contents.length) {
            const list = listedObjects.Contents
            for (const i in list) {
              list[i] = list[i].split('/').pop()
            }
            return callback(null, list)
          }
          return callback()
        })
      }),
      remove: util.promisify((path, itemid, callback) => {
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/list/${path}/${itemid}`
        }
        return storage.s3.deleteObject(params, (error) => {
          if (error) {
            Log.error('error deleting', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      })
    }
    return callback(null, container)
  })
}
