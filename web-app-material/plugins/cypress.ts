/* eslint-disable dot-notation */
const isCypress = typeof window['Cypress'] !== 'undefined'
// process.client &&
export default (context) => {
    if (isCypress) {
        window['$nuxt'] = context
    }
    if (process['client']) {
        if (window['Cypress']) {
            // add property "appReady" to window
            window['appReady'] = true
            window['nuxt'] = 'nuxt'
            // eslint-disable-next-line no-console
            console.log('Context ##########:', context, 'Is Cypress ##########:', isCypress)
        }
    }
}
