const config = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}

if (process.env.S3_ENDPOINT) {
  const spacesEndpoint = new AWS.Endpoint(process.env.S3_ENDPOINT)
  config.endpoint = spacesEndpoint
}

const AWS = require('aws-sdk')
AWS.config.update()
const s3 = new AWS.S3()
const storagePath = process.env.STORAGE_PATH || `/data`

module.exports = {
  exists,
  read,
  readImage,
  write,
  writeImage,
  deleteFile
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

async function deleteFile(path) {
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
    throw new Error(`invalid-file`)
  }
}

async function write(file, contents) {
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
    Body: contents.toString('utf-8')
  }
  await s3.putObject(params).promise()
}

async function writeImage(file, buffer) {
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

async function read(file) {
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
  return object.Body.toString('utf-8')
}

async function readImage(file) {
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
