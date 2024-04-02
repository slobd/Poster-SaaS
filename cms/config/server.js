module.exports = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 7999),
    url: env('CMS_URL', 'http://localhost:7999'),
    admin: {
        auth: {
            secret: env('ADMIN_JWT_SECRET', ''),
        },
    }
})
