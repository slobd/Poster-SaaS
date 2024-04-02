module.exports = ({ env }) => ({
    sentry: {
        dsn: env('SENTRY_DSN'),
        debug: env('NODE_ENV') === 'development'
    },
    upload: {
        provider: 'aws-s3',
        providerOptions: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_ACCESS_SECRET'),
            region: 'eu-central-1',
            params: {
                Bucket: env('S3_BUCKET'),
            },
        },
    },
})
