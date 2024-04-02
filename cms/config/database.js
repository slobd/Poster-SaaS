module.exports = ({ env }) => ({
    defaultConnection: 'default',
    connections: {
        default: {
            connector: 'bookshelf',
            settings: {
                client: 'postgres',
                host: env(
                    'DATABASE_HOST',
                    'localhost'
                ),
                port: env.int('DATABASE_PORT', 5432),
                database: env('DATABASE_NAME', 'dev_cms'),
                username: env('DATABASE_USERNAME', 'postgres'),
                password: env('DATABASE_PASSWORD', 'development'),
                ssl: env.bool('DATABASE_SSL', false)
                    ? { rejectUnauthorized: false }
                    : false,
            },
            options: {},
        },
    },
});
