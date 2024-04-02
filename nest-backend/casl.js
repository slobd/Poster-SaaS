const Ability = require('@casl/ability').Ability
const subject = require('@casl/ability').subject

const comment = subject('Workspace', {
    tenantId: 1,
}


)

const ability = new Ability([
    {
        subject: 'Workspace',
        action: 'create',
        conditions: {
            'tenantId': 1
        },
    },
])
console.log(ability.can('create', comment))