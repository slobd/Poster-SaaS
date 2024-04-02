export const veeValidateProps = {
    /**
     * Sets input name show in the Validation error message
     */
    name: {
        type: String,
        default: '',
    },
    /**
     * v-id of veevalidate (key of the ValidationObserver's errors object for this input)
     */
    vid: {
        type: String,
        default: '',
    },
    /**
     * VeeValidate rules
     */
    rules: {
        type: [Object, String],
        default: null,
    },
}

export const sharedInputProps = {
    /**
     * Sets input label
     */
    label: {
        type: String,
        default: '',
    },
    /**
     * Sets height
     */
    height: {
        type: [String, Number],
        default: undefined,
    },
    /**
     * Applies the outlined style to the input
     */
    outlined: {
        type: Boolean,
        default: false,
    },
    /**
     * Add input clear functionality, default icon is Material Design Icons mdi-clear
     */
    clearable: {
        type: Boolean,
        default: false,
    },
    /**
     * Hint text
     */
    hint: {
        type: String,
        default: '',
    },
    /**
     * Forces hint to always be visible
     */
    persistentHint: {
        type: Boolean,
        default: false,
    },
    /**
     * Hides hint and validation errors. When set to auto messages will be rendered only
     * if there's a message (hint, error message, counter value etc) to display
     */
    hideDetails: {
        type: [String, Boolean],
        default: false,
    },
    counter: {
        type: [String, Boolean, Number],
        default: undefined,
    },
}
