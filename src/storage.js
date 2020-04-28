const AWS = require('aws-sdk')
const config = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}
if (process.env.S3_ENDPOINT) {
  const spacesEndpoint = new AWS.Endpoint(process.env.S3_ENDPOINT)
  config.endpoint = spacesEndpoint
}
AWS.config.update(config)
const s3 = new AWS.S3()

const storagePath = process.env.STORAGE_PATH || '/data'

module.exports = {
  exists,
  list,
  read,
  readMany,
  readImage,
  write,
  writeImage,
  deleteFile
}

async function emptyS3Directory (bucket, dir) {
  const listParams = {
    Bucket: bucket,
    Prefix: dir
  }
  const listedObjects = await s3.listObjectsV2(listParams).promise()
  if (listedObjects.Contents.length === 0) {
    return
  }
  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] }
  }
  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key })
  })
  await s3.deleteObjects(deleteParams).promise()
  if (listedObjects.IsTruncated) {
    await emptyS3Directory(bucket, dir)
  }
}

if (process.env.NODE_ENV === 'testing') {
  let created = false
  module.exports.flush = async () => {
    if (!created) {
      await s3.createBucket({ Bucket: process.env.S3_BUCKET_NAME })
      created = true
    }
    await emptyS3Directory(process.env.S3_BUCKET_NAME, storagePath)
  }
}

async function exists (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
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
}

async function deleteFile (path) {
  if (!path) {
    throw new Error('invalid-file')
  }
  if (path.indexOf('/') === path.length - 1) {
    throw new Error('invalid-file')
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${storagePath}/${path}`
  }
  try {
    await s3.deleteObject(params).promise()
  } catch (error) {
    throw new Error('invalid-file')
  }
}

async function write (file, contents) {
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
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${storagePath}/${file}`,
    Body: contents.toString()
  }
  await s3.putObject(params).promise()
}

async function writeImage (file, buffer) {
  if (!file) {
    throw new Error('invalid-file')
  }
  if (!buffer || !buffer.length) {
    throw new Error('invalid-buffer')
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${storagePath}/${file}`,
    Body: buffer
  }
  await s3.putObject(params).promise()
}

async function read (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${storagePath}/${file}`
  }
  let object
  try {
    object = await s3.getObject(params).promise()
  } catch (error) {
    throw new Error('invalid-file')
  }
  return object.Body.toString()
}

async function readMany (prefix, files) {
  if (!files || !files.length) {
    throw new Error('invalid-files')
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME
  }
  const data = {}
  for (const file of files) {
    params.Key = `${storagePath}/${prefix}/${file}`
    let object
    try {
      object = await s3.getObject(params).promise()
    } catch (error) {
      throw new Error('invalid-file')
    }
    data[file] = object.Body.toString()
  }
  return data
}

async function readImage (file) {
  if (!file) {
    throw new Error('invalid-file')
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${storagePath}/${file}`
  }
  let object
  try {
    object = await s3.getObject(params).promise()
  } catch (error) {
    throw new Error('invalid-file')
  }
  return object.Body
}

async function list (path) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    MaxKeys: 2147483647,
    Prefix: `${storagePath}/${path}`
  }
  let data
  try {
    data = await s3.listObjectsV2(params).promise()
  } catch (error) {
  }
  if (data && data.Contents && data.Contents.length) {
    const files = []
    for (const item of data.Contents) {
      files.push(item.Key.substring(storagePath.length + 1))
    }
    return files
  }
  return null
}
