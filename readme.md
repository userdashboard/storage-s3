# S3 Storage for Dashboard
![Test suite status](https://github.com/userdashboard/storage-s3/workflows/test-and-publish/badge.svg?branch=master)

Install this module to use [Amazon S3](https://aws.amazon.com/s3) for data storage.

You will need to launch with additional configuration variables:

    STORAGE=@userdashboard/storage-s3
    S3_BUCKET_NAME=the_name
    ACCESS_KEY_ID=secret from amazon
    SECRET_ACCESS_KEY=secret from amazon

To use with S3-equivalent services such as [Digital Ocean\'s spaces]() requires more:

    S3_ENDPOINT=nyc3.digitaloceanspaces.com

You can use this storage for a module:

    MODULE_NAME_STORAGE=@userdashboard/storage-s3
    MODULE_NAME_S3_BUCKET_NAME=the_name
    MODULE_NAME_ACCESS_KEY_ID=secret from amazon
    MODULE_NAME_SECRET_ACCESS_KEY=secret from amazon
    MODULE_NAME_S3_ENDPOINT=nyc3.digitaloceanspaces.com

# Dashboard

Dashboard is a NodeJS project that provides a reusable account management system for web applications. 

Dashboard proxies your application server to create a single website where pages like signing in or changing your password are provided by Dashboard.  Your application server can be anything you want, and use Dashboard's API to access data as required.

Using modules you can expand Dashboard to include organizations, subscriptions powered by Stripe, or a Stripe Connect platform.

# Support and contributions

If you have encountered a problem post an issue on the appropriate [Github repository](https://github.com/userdashboard).  

If you would like to contribute check [Github Issues](https://github.com/userdashboard/dashboard) for ways you can help. 

For help using or contributing to this software join the freenode IRC `#userdashboard` chatroom - [Web IRC client](https://kiwiirc.com/nextclient/).

## License

This software is licensed under the MIT license, a copy is enclosed in the `LICENSE` file.

Copyright (c) 2017 - 2020 Ben Lowry

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.