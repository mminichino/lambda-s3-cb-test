# lambda-s3-cb-test

Modifying and uploading an AWS Lambda function on macOS with the Couchbase SDK.

Create an AWS Lambda function using Node.js 20 on arm64 (i.e. with WebStorm or IntelliJ)

Add the Linux Couchbase SDK:

Run a Docker container:
```
docker run -v $(pwd):/workbench -it amazonlinux
```

Add the Couchbase Node.js SDK for Linux:
```
cd /workbench
yum install -qy tar gzip
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 20.18.0
npm install couchbase --save
```

Check that the Linux packages along with the Darwin package are installed:
```
npm list --depth 1
```

Create a ZIP file to upload the function to AWS:
```
zip -x .\* -FSr ~/aws_lambda.zip .
```

This Lambda function will accept an S3 PUT event when a JSON file is added to an S3 bucket. It will add the list of JSON objects to the keyspace (bucket, scope, and collection) with each JSON object in the list as a new document. 
