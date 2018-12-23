beforeEach(async () => {
  await deleteS3Data()
})

before(async () => {
  await deleteS3Data()
})

after(async () => {
  await deleteS3Data()
})

async function deleteS3Data() {
  const AWS = require('aws-sdk')
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  })
  const s3 = new AWS.S3()
  const contents = await readS3()
  if (!contents || !contents.length) {
    return
  }
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: { Objects: [] }
  }
  for (const object of contents) {
    params.Delete.Objects.push({ Key: object.Key })
  }
  await s3.deleteObjects(params).promise()
}

async function readS3() {
  const AWS = require('aws-sdk')
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  })
  const s3 = new AWS.S3()
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    MaxKeys: 2147483647
  }
  const data = await s3.listObjectsV2(params).promise()
  return data.Contents
}
