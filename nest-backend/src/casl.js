const Ability = require('@casl/ability').Ability
const subject = require('@casl/ability').subject

const user = subject('User', {
    id: 1,
    workspaces: [
        {
            id: 1,
            name: 'Tenant 1',
            description:
                'Welcome to your new collaboration space. In our app, the Workspace is the place to share, monitor, and track R&D projects with your partners',
            visibility: 'PUBLIC',
            tenantId: 1,
        },
    ],
    roles: [
        {
            roleId: 4,
            userId: 1,
            role: {
                id: 4,
                system: true,
                name: 'Owner',
                domain: 'Workspace/1',
                tenantId: 1,
                description: 'Default owner role',
            },
        },
    ],
})

const ability = new Ability([
    {
        subject: 'User',
        action: 'update',
        conditions: {
            // 'roles.role.domain': 'Workspace/1',
            roles: {
                $elemMatch: {
                    'role.domain': 'Workspace/1',
                },
            },
        },
    },
    // {
    //     subject: 'User',
    //     action: 'update',
    //     conditions: {
    //         workspaces: {
    //             $elemMatch: {
    //                 id: 1,
    //             },
    //         },
    //     },
    // },
])

console.log(ability.can('update', user))
