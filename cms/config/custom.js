module.exports = ({ env }) => ({
    backendUrl: env('BACKEND_URL', 'localhost:2828')
});
