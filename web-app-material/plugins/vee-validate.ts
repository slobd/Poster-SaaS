import Vue from 'vue'
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate'
import { messages } from 'vee-validate/dist/locale/en.json'
import * as rules from 'vee-validate/dist/rules'

Object.keys(rules).forEach((rule) => {
    extend(rule, {
        // eslint-disable-next-line import/namespace
        ...rules[rule], // copies rule configuration
        message: messages[rule], // assign message
    })
})

// hasNumbers checks if the text has numbers
extend('hasNumbers', {
    validate: (value) => {
        const allNumbers = /[0-9]/
        return allNumbers.test(value)
    },
    message: 'The {_field_} must have at least one number',
})
// hasUppercase checks if the text has capital letters
extend('hasUppercase', {
    validate: (value) => {
        const allUppercase = /[A-Z]/
        return allUppercase.test(value)
    },
    message: 'The {_field_} must have at least one uppercase character',
})
// hasLowercase checks if the text has capital letters
extend('hasLowercase', {
    validate: (value) => {
        const allLowercase = /[a-z]/
        return allLowercase.test(value)
    },
    message: 'The {_field_} must have at least one lowercase character',
})
// hasSpecial checks if the text has any character that isn't a letter, a number or a whitespace
extend('hasSpecial', {
    validate: (value) => {
        const allCharacters = /[A-Za-z0-9\s]/g
        return value.replace(allCharacters, '').length !== 0
    },
    message: 'The {_field_} must have at least one special character',
})
// Repetitive returns true if there is 3 equal characters in a row or increasing values (123)
extend('notRepetitive', {
    validate: (value) => {
        let quantity = 0
        const before = 0
        let i
        for (i = 0; i < value.length; i++) {
            if (Number(i) === before + 1 || i === before) {
                quantity += 1
                if (quantity === 3) {
                    break
                }
            } else {
                quantity = 0
            }
        }
        return quantity === 3
    },
    message: 'The {_field_} must not have repetitive characters',
})

extend('mimeType', {
    params: ['mimeType'],
    validate: (value: File, params: Record<string, any>) => {
        if (!(value instanceof File)) return false

        if (Array.isArray(params.mimeType)) return params.mimeType.includes(value.type)
        else return value.type === params.mimeType
    },
    message: (fieldName, placeholders) => {
        if (!(placeholders._value_ instanceof File))
            return `The value of the ${fieldName} field is not of type FILE`
        // return `The ${fieldName} field's file must have MIME type ${placeholders.mimeType}`
        return 'Please upload a file in supported format'
    },
})
extend('length', {
    message: 'The {_field_} field is required',
})

Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)
