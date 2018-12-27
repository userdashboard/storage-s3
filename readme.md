# S3 Storage for Dashboard

Install this module to use [Amazon S3](https://aws.amazon.com/s3) for data storage.

You will need to launch with additional configuration variables:

  STORAGE_ENGINE=@userappstore/storage-s3
  S3_BUCKET_NAME=the_name
  ACCESS_KEY_ID=secret from amazon
  SECRET_ACCESS_KEY=secret from amazon

To use with S3-equivalent services such as [Digital Ocean\'s spaces]() requires more:

  S3_ENDPOINT=nyc3.digitaloceanspaces.com

To test this module use [Dashboard](https://github.com/userappstore/dashboard)'s test suite configured with this storage engine.
