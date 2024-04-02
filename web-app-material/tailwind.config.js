module.exports = {
    jit: true,
    important: true,
    corePlugins: {
        preflight: false,
    },
    prefix: 'tw-',
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                primary: '#1C2268',
                secondary: '#43b7b6',
                'pl-dot': '#C4E8E6',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require('@tailwindcss/line-clamp')],
}
