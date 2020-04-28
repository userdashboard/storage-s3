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



# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

## Support and documentation

Join the freenode IRC #dashboard chatroom for support.  [Web IRC client](https://kiwiirc.com/nextclient/)

- [Developer documentation home](https://userdashboard.github.io/home)
- [Administrator documentation home](https://userdashboard.github.io/administrators/home)
- [User documentation home](https://userdashboard.github.io/users/home)

#### Development

Development takes place on [Github](https://github.com/userdashboard/storage-s3) with releases on [NPM](https://www.npmjs.com/package/@userdashboard/storage-s3).

#### License

This software is distributed under the MIT license.
