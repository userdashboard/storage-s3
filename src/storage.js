const util = require('util')

module.exports = {
  setup: util.promisify((moduleName, callback) => {
    if (!callback) {
      callback = moduleName
      moduleName = null
    }
    const Log = require('@userdashboard/dashboard/src/log.js')('s3')
    const accessKeyId = process.env[`${moduleName}_ACCESS_KEY_ID`] || process.env.ACCESS_KEY_ID
    const secretAccessKey = process.env[`${moduleName}_SECRET_ACCESS_KEY`] || process.env.SECRET_ACCESS_KEY
    const bucketName = process.env[`${moduleName}_S3_BUCKET_NAME`] || process.env.S3_BUCKET_NAME
    const s3EndPoint = process.env[`${moduleName}_S3_ENDPOINT`] || process.env.S3_ENDPOINT
    const storagePath = process.env[`${moduleName}_STORAGE_PATH`] || process.env.STORAGE_PATH || '/data'
    const AWS = require('aws-sdk')
    const config = { accessKeyId, secretAccessKey }
    AWS.config.update(config)
    const s3Options = {}
    if (process.env.NODE_ENV === 'testing') {
      s3Options.s3ForcePathStyle = true
    }
    if (s3EndPoint) {
      s3Options.endpoint = s3EndPoint
    }
    const s3 = new AWS.S3(s3Options)
    if (s3EndPoint) {
      s3.setEndpoint(s3EndPoint)
    }
    const container = {
      bucketName,
      storagePath,
      s3,
      exists: util.promisify((file, callback) => {
        if (!file) {
          return callback(new Error('invalid-file'))
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        return s3.headObject(params, (error, found) => {
          if (error && error.code !== 'NotFound') {
            Log.error('error checking exists', error)
            return callback(new Error('unknown-error'))
          }
          return callback(null, found !== null && found !== undefined)
        })
      }),
      list: util.promisify((path, callback) => {
        const params = {
          Bucket: bucketName,
          MaxKeys: 2147483647,
          Prefix: `${storagePath}/${path}`
        }
        return s3.listObjectsV2(params, (error, data) => {
          if (error) {
            Log.error('error listing', error)
            return callback(new Error('unknown-error'))
          }
          if (data && data.Contents && data.Contents.length) {
            data.Contents.sort((a, b) => {
              return a.LastModified < b.LastModified ? 1 : -1
            })
            const files = []
            for (const item of data.Contents) {
              files.push(item.Key.substring(storagePath.length + 1))
            }
            return callback(null, files)
          }
          return callback()
        })
      }),
      read: util.promisify((file, callback) => {
        if (!file) {
          return callback(new Error('invalid-file'))
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        return s3.getObject(params, (error, object) => {
          if (error) {
            Log.error('error reading', error)
            return callback(new Error('invalid-file'))
          }
          return callback(null, object.Body.toString())
        })
      }),
      readMany: util.promisify((prefix, files, callback) => {
        if (!files || !files.length) {
          return callback(new Error('invalid-files'))
        }
        const params = {
          Bucket: bucketName
        }
        const data = {}
        function nextFile () {
          if (!files.length) {
            return callback(null, data)
          }
          const file = files.shift()
          params.Key = `${storagePath}/${prefix}/${file}`
          return s3.getObject(params, (error, object) => {
            if (error) {
              Log.error('error reading many', error)
              return callback(new Error('invalid-file'))
            }
            data[file] = object.Body.toString()
            return nextFile()
          })
        }
        return nextFile()
      }),
      readBinary: util.promisify((file, callback) => {
        if (!file) {
          return callback(new Error('invalid-file'))
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        return s3.getObject(params, (error, object) => {
          if (error) {
            Log.error('error reading binary', error)
            return callback(new Error('unknown-error'))
          }
          return callback(null, object.Body)
        })
      }),
      write: util.promisify((file, contents, callback) => {
        if (!file) {
          return callback(new Error('invalid-file'))
        }
        if (!contents && contents !== '') {
          return callback(new Error('invalid-contents'))
        }
        if (!contents.substring) {
          contents = JSON.stringify(contents)
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`,
          Body: contents.toString()
        }
        return s3.putObject(params, (error) => {
          if (error) {
            Log.error('error writing', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      }),
      writeBinary: util.promisify((file, buffer, callback) => {
        if (!file) {
          return callback(new Error('invalid-file'))
        }
        if (!buffer || !buffer.length) {
          return callback(new Error('invalid-buffer'))
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`,
          Body: buffer
        }
        return s3.putObject(params, (error) => {
          if (error) {
            Log.error('error writing binary', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      }),
      delete: util.promisify((file, callback) => {
        if (!file) {
          return callback(new Error('invalid-file'))
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        return s3.deleteObject(params, (error) => {
          if (error) {
            Log.error('error deleting', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      })
    }
    if (process.env.NODE_ENV === 'testing') {
      if (process.env.DELAY_WRITES) {
        container.write = util.promisify((file, contents, callback) => {
          if (!file) {
            return callback(new Error('invalid-file'))
          }
          if (!contents && contents !== '') {
            return callback(new Error('invalid-contents'))
          }
          if (!contents.substring) {
            contents = JSON.stringify(contents)
          }
          const params = {
            Bucket: bucketName,
            Key: `${storagePath}/${file}`,
            Body: contents.toString()
          }
          return s3.putObject(params, (error) => {
            if (error) {
              Log.error('error writing', error)
              return callback(new Error('unknown-error'))
            }
            return setTimeout(callback, 0)
          })
        })
      }
      const listParams = {
        MaxKeys: 2147483647,
        Bucket: bucketName,
        Prefix: storagePath
      }
      container.flush = util.promisify((callback) => {
        return s3.listObjectsV2(listParams, (error, listedObjects) => {
          if (error) {
            if (error.code === 'NoSuchBucket') {
              return callback()
            }
            Log.error('error deleting', error)
            return callback(new Error('unknown-error'))
          }
          if (listedObjects.substring) {
            try {
              listedObjects = JSON.parse(listedObjects)
            } catch (error) {
            }
          }
          if (listedObjects.Contents.length === 0) {
            return callback()
          }
          const deleteParams = {
            Bucket: bucketName,
            Delete: { Objects: [] }
          }
          for (const object of listedObjects.Contents) {
            deleteParams.Delete.Objects.push({ Key: object.Key })
          }
          return s3.deleteObjects(deleteParams, (error) => {
            if (error) {
              if (error.code === 'NoSuchBucket') {
                return callback()
              }
              Log.error('error deleting', error)
              return callback(new Error('unknown-error'))
            }
            return callback()
          })
        })
      })
    }
    return callback(null, container)
  })
}
