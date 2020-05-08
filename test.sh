if [ ! -d instance ]; then
    git clone https://github.com/userdashboard/dashboard.git instance
    cd instance
    npm install aws-sdk mocha puppeteer@2.1.1 --no-save
else 
    cd instance
fi
rm -rf node_modules/@userdashboard/storage-s3
mkdir -p node_modules/@userdashboard/storage-s3
cp ../index.js node_modules/@userdashboard/storage-s3
cp -R ../src node_modules/@userdashboard/storage-s3

NODE_ENV=testing \
FAST_START=true \
DASHBOARD_SERVER="http://localhost:9000" \
DOMAIN="localhost" \
STORAGE="@userdashboard/storage-s3" \
S3_ENDPOINT="http://localhost:4566" \
S3_BUCKET_NAME="testing" \
SECRET_ACCESS_KEY="using-mock-aws-s3" \
ACCESS_KEY_ID="using-mock-aws-s3" \
GENERATE_SITEMAP_TXT=false \
GENERATE_API_TXT=false \
npm test