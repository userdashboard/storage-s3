
module.exports = {
  setup: async (moduleName) => {
    const accessKeyId = process.env[`${moduleName}_ACCESS_KEY_ID`] || process.env.ACCESS_KEY_ID
    const secretAccessKey = process.env[`${moduleName}_SECRET_ACCESS_KEY`] || process.env.SECRET_ACCESS_KEY
    const bucketName = process.env[`${moduleName}_S3_BUCKET_NAME`] || process.env.S3_BUCKET_NAME
    const s3EndPoint = process.env[`${moduleName}_S3_ENDPOINT`] || process.env.S3_ENDPOINT
    const storagePath = process.env[`${moduleName}_STORAGE_PATH`] || process.env.STORAGE_PATH || '/data'
    const AWS = require('aws-sdk')
    const config = { accessKeyId, secretAccessKey }
    if (s3EndPoint) {
      config.endpoint = new AWS.Endpoint(s3EndPoint)
    }
    AWS.config.update(config)
    const s3Options = {}
    if (process.env.NODE_ENV === 'testing') {
      s3Options.s3ForcePathStyle = true
    }
    const s3 = new AWS.S3(s3Options)
    const container = {
      exists: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        let found
        try {
          await s3.headObject(params).promise()
          found = true
        } catch (error) {
          found = false
        }
        return found
      },
      list: async (path) => {
        const params = {
          Bucket: bucketName,
          MaxKeys: 2147483647,
          Prefix: `${storagePath}/${path}`
        }
        let data
        try {
          data = await s3.listObjectsV2(params).promise()
        } catch (error) {
          if (process.env.DEBUG_ERRORS) {
            console.log('[s3-storage]', error)
          }
          throw new Error('unknown-error')
        }
        if (data && data.Contents && data.Contents.length) {
          data.Contents.sort((a, b) => {
            return a.LastModified < b.LastModified ? 1 : -1
          })
          const files = []
          for (const item of data.Contents) {
            files.push(item.Key.substring(storagePath.length + 1))
          }
          return files
        }
        return null
      },
      read: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        let object
        try {
          object = await s3.getObject(params).promise()
        } catch (error) {
          if (process.env.DEBUG_ERRORS) {
            console.log('[s3-storage]', error)
          }
          throw new Error('invalid-file')
        }
        return object.Body.toString()
      },
      readMany: async (prefix, files) => {
        if (!files || !files.length) {
          throw new Error('invalid-files')
        }
        const params = {
          Bucket: bucketName
        }
        const data = {}
        for (const file of files) {
          params.Key = `${storagePath}/${prefix}/${file}`
          let object
          try {
            object = await s3.getObject(params).promise()
          } catch (error) {
            if (process.env.DEBUG_ERRORS) {
              console.log('[s3-storage]', error)
            }
            throw new Error('invalid-file')
          }
          data[file] = object.Body.toString()
        }
        return data
      },
      readBinary: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        let object
        try {
          object = await s3.getObject(params).promise()
        } catch (error) {
          if (process.env.DEBUG_ERRORS) {
            console.log('[s3-storage]', error)
          }
          throw new Error('unknown-error')
        }
        return object.Body
      },
      write: async (file, contents) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (!contents && contents !== '') {
          throw new Error('invalid-contents')
        }
        if (!contents.substring) {
          contents = JSON.stringify(contents)
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`,
          Body: contents.toString()
        }
        await s3.putObject(params).promise()
      },
      writeBinary: async (file, buffer) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        if (!buffer || !buffer.length) {
          throw new Error('invalid-buffer')
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`,
          Body: buffer
        }
        await s3.putObject(params).promise()
      },
      delete: async (file) => {
        if (!file) {
          throw new Error('invalid-file')
        }
        const params = {
          Bucket: bucketName,
          Key: `${storagePath}/${file}`
        }
        try {
          await s3.deleteObject(params).promise()
        } catch (error) {
          if (process.env.DEBUG_ERRORS) {
            console.log('[s3-storage]', error)
          }
          throw new Error('invalid-file')
        }
      }
    }
    if (process.env.NODE_ENV === 'testing') {
      let created = false
      container.flush = async () => {
        if (!created) {
          await s3.createBucket({ Bucket: bucketName }).promise()
          created = true
        }
        const listParams = {
          MaxKeys: 2147483647,
          Bucket: bucketName,
          Prefix: storagePath
        }
        let listedObjects = await s3.listObjectsV2(listParams).promise()
        if (listedObjects.substring) {
          try {
            listedObjects = JSON.parse(listedObjects)
          } catch (error) {
          }
        }
        if (listedObjects.Contents.length === 0) {
          return
        }
        const deleteParams = {
          Bucket: bucketName,
          Delete: { Objects: [] }
        }
        for (const object of listedObjects.Contents) {
          deleteParams.Delete.Objects.push({ Key: object.Key })
        }
        await s3.deleteObjects(deleteParams).promise()
      }
    }
    return container
  }
}
