const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({});
const couchbase = require('couchbase');
const clusterConnStr = process.env.CONNECT_STRING;
const username = process.env.COUCHBASE_USER;
const password = process.env.COUCHBASE_PASSWORD;
const bucketName = process.env.COUCHBASE_BUCKET;
const scopeName = process.env.COUCHBASE_SCOPE;
const collectionName = process.env.COUCHBASE_COLLECTION;
const batchSize = 100;

exports.handler = async (event, context) => {
    const s3bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;

    const params = {
        Bucket: s3bucketName,
        Key: objectKey
    };

    try {
        const cluster = await couchbase.connect(clusterConnStr, {
            username: username,
            password: password,
        });
        const bucket = cluster.bucket(bucketName);
        const collection = bucket.scope(scopeName).collection(collectionName)

        const command = new GetObjectCommand(params);
        const response = await client.send(command);
        const body = await response.Body.transformToString();
        const json = JSON.parse(body);
        console.log('Loaded', json.length, 'documents');
        const processBatch = async (data, size) => {
            for (let i = 0; i < data.length; i += size) {
                const batch = data.slice(i, i + size);
                const promises = batch.map(doc => collection.upsert(doc.id, doc));
                await Promise.all(promises);
            }
        };
        await processBatch(json, batchSize)
            .then(() => console.log('Documents successfully loaded'))
            .catch(err => console.error('Error:', err));
    } catch (err) {
        console.log(err);
        throw err;
    }
};
