module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: ['@nuxtjs/eslint-config-typescript', 'plugin:nuxt/recommended', 'prettier'],
    plugins: ['unused-imports'],
    // add your custom rules here
    rules: {
        'unused-imports/no-unused-imports': 'error',
        'vue/valid-v-slot': ['error', { allowModifiers: true }],
    },
}
