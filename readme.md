# S3 Storage for Dashboard

Install this module to use [Amazon S3](https://aws.amazon.com/s3) for data storage.

You will need to launch with additional configuration variables:

  STORAGE_ENGINE=@userdashboard/storage-s3
  S3_BUCKET_NAME=the_name
  ACCESS_KEY_ID=secret from amazon
  SECRET_ACCESS_KEY=secret from amazon

To use with S3-equivalent services such as [Digital Ocean\'s spaces]() requires more:

  S3_ENDPOINT=nyc3.digitaloceanspaces.com

To test this module use [Dashboard](https://github.com/userdashboard/dashboard)'s test suite configured with this storage engine.

#### Development

Development takes place on [Github](https://github.com/userdashboard/storage-s3) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/storage-s3).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.
