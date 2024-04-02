# How to implement the authorization layer of a feature

## Read how to use CASL

Specially but not limited to:

- https://casl.js.org/v5/en/guide/intro
- https://casl.js.org/v5/en/guide/define-rules
- https://casl.js.org/v5/en/guide/conditions-in-depth
- https://casl.js.org/v5/en/guide/restricting-fields
- https://casl.js.org/v5/en/guide/subject-type-detection (May help debugging)

## Relevant files

- **/access-control/policy-enforcement-point.interceptor.ts**: Enforce the system's authorization policies upon the
  request and response payload of an HTTP request.
- **/access-control/policy-information-point.service.ts**: Provides the Policy Enforcer with Information necessary to
  enforce the authorization rules
- **/access-control/policy-decorator**: It is used to specify on a per-route basis which authorization rules apply
- **/access-control/rules/rules.constants.ts**: Specify all the rules of the system
- **/access-control/access-control.types.ts**: Contains the typing information of the access-control module. You will
  need to update this file when adding new rules
- **/access-control/roles/default-roles.service.ts**: Specify which are the default roles and their corresponding
  permissions

## Policy Enforcer Flow

https://miro.com/app/board/uXjVOC5wjnw=/?moveToWidget=3458764521739874986&cot=14

## Get the business requirements

First, you need to be sure that the business requirements are specified in the task.

For example:

1. Owner, Admin and Member role can edit public projects
2. All the workspace roles can see public projects

In case the task does not specify the business requirements, consult with the Lead Developer or Product Owner to see if
there is something missing

## Translate the rule into CASL conditions

The next thing you need to do is translate the rule into a CASL condition.

For rule (1) and (2) we can know the project have to have some kind of visibility property, and also we know that
implicitly a user with a workspace role can only do actions inside the workspace to which his role belongs. Moreover,
the entity is called **Project**, so this will be our CASL's subject. The actions are **"update"** and **"read"** (and
probably also "list" more on that later) respectively.

If you have no Entity you need to create one in the `schema.prisma` file:

```prisma
model Project {
  id              Int                   @id() @default(autoincrement())
  name            String
  visibility      ProjectVisibilityEnum
  workspace       Workspace             @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId     Int
}
```

For the workspace id you have two options. Either "workspaceId" or "workspace.id", difference lie is that "workspaceId"
is in the same project table whereas
"workspace.id" means access the id project of the workspace object, what requires a SQL Join with the workspace table
(project joins workspace on workspace.id = workspaceId)

#### Owner, Admin and Member role can edit public projects

```ts
import {ActionEnum, SubjectEnum} from "./access-control.types";
import {ProjectVisibilityEnum} from "@prisma/client";

const rule = {
    subject: SubjectEnum.Project,
    action: ActionEnum.update,
    conditions: {
        visibility: ProjectVisibilityEnum.PUBLIC,
        workspaceId: 1 // The id of the workspace of the role
    }
}
```

#### All the workspace roles can see public projects

```ts
import {ActionEnum, SubjectEnum} from "./access-control.types";
import {ProjectVisibilityEnum} from "@prisma/client";

const rule = {
    subject: SubjectEnum.Project,
    action: ActionEnum.read,
    conditions: {
        visibility: ProjectVisibilityEnum.PUBLIC,
        workspaceId: 1 // The id of the workspace of the role
    }
}
```

The previous rules were *RAW* rules. This means that these rules are interpreted directly by CASL. In order to complete
define a rule in our system we need to also add a feature and a rule name.

## Defining the Access Control types

The following work is done inside the `access-control.types.ts`.

### Defining Subject and Action

First you need to define the 'Subject' inside `SubjectEnum` type. In our case it would be the *Project* subject:

```ts
export enum SubjectEnum {
    Project = 'Project',
    //...
}
```

Then inside the `ActionEnum` you may define additional actions you may need. In most cases you will use `create`, `read`
, `list`, `update` and `delete` so this is not necessary.

Inside the type `Abilities` you have to define all the possible `Subject` - `Action`
combinations. For our example we have:

```ts
type Abilities =
    | [ActionEnum.update | ActionEnum.read, SubjectEnum.Project]
```

That means that something like "Project" + "create" is not valid. This is only TS validation, so it won't have any
effect on runtime.

For more information
read: [CASL - Safer permissions inference](https://casl.js.org/v5/en/advanced/typescript#safer-permissions-inference)

### Defining a feature

Next you have to define a feature inside the `FeatureEnum` type. The rules of thumb of defining a feature are:

- It is a separate feature per business requirement. For example there is the Gallery feature and the Project feature
- A Feature also define a "scope" for the rules. For example the Kanban Board feature and the General Information tab
  feature are in the 'Project' scope
- Features can be enabled or disable in the CMS so if some particular functionality needs to be enabled or disable based
  on the license of a tenant then it should be its own feature

#### CMS feature and Schema.prisma feature

Since the features can be toggled for each tenant, you have to update the "TenantFeatures" table in the cms and in the
schema.prisma file

For the CMS just do it directly from the ADMIN user interface.

For the NestJS backend you have to do it inside the schema.prisma file:

```prisma
model TenantFeatures {
  id               Int     @id() @default(autoincrement())
  AccessControl    Boolean @default(true)
  TenantManagement Boolean @default(true)
  // For example for the Project feature of our example rules
  Project          Boolean @default(true)
  // ...
  tenantId         Int?    @unique()
  tenant           Tenant? @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

### Defining the names of the rules

The rule names help to differentiate between *RAW* rules with the same `Subject` and `Action`. You have to define a
rules enum for the feature you are working with in case this one does not exist. The name have to follow the
format `${FeatureName}Rules`.

For example:

```ts
export enum ProjectRules {
    updatePublicProject = 'updatePublicProject',
    readProject = 'readProject',
}
```

Then you have to register it in the `Rules` interface:

```ts
export interface Rules {
    ProjectRules: ProjectRules
}
```

## Defining the Rules

Now that you have a Subject, Action, Conditions, Feature and rule name you can properly define the rules
inside `rules.constants.ts`.

There we can also define a **description** and **options** property that will help us in the future to display the rules
in the client side and validate the input.

The way it works is that the options are stored in the database, so we can change the function that generate the
conditions at runtime without any kind of migration, as long as the options remain the same.

Every rule property implements the `RuleMetadata` interface

```ts
export const FeaturesRules: FeaturesTable = {
    Project: {
        updatePublicProject: {
            name: ProjectRules.updatePublicProject,
            feature: FeaturesEnum.Project,
            description: 'Allow the user to update a public project',
            subject: SubjectEnum.Project,
            action: ActionEnum.update,
            getConditions: (opts: { id: string; workspaceId: number }) => {
                const conditions: any = {
                    workspaceId: opts.workspaceId,
                    visibility: ProjectVisibilityEnum.PUBLIC,
                }

                return {
                    conditions,
                }
            },
            options: [
                {
                    name: 'Workspace Id',
                    description: 'Id of the workspace',
                    key: 'workspaceId',
                },
            ],
        },
        readProject: {
            name: ProjectRules.readProject,
            description:
                'Grant permission for the user to read a project with Id',
            feature: FeaturesEnum.Project,
            subject: SubjectEnum.Project,
            action: ActionEnum.read,
            getConditions: (opts) => ({
                conditions: {
                    workspaceId: opts.workspaceId,
                    visibility: ProjectVisibilityEnum.PUBLIC,
                    deleted: false,
                },
            }),
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can read workspaces',
                    key: 'workspaceId',
                },
            ],
        },
    }
}
```

### Defining field level access in the rules

It is also possible to define field level access for the rules. This is useful you want to limit which property can be
created, updated or read by a user. In the previous example, let's say we only want `name` and `visibility` to be
readable by the users, then we would add a `fields`
property to the object returned by the `getConditions` method.

```ts
export const FeaturesRules: FeaturesTable = {
    Project: {
        readProject: {
            name: ProjectRules.readProject,
            description:
                'Grant permission for the user to read a project with Id',
            feature: FeaturesEnum.Project,
            subject: SubjectEnum.Project,
            action: ActionEnum.read,
            getConditions: (options) => ({
                conditions: {
                    workspaceId: options.workspaceId,
                    visibility: ProjectVisibilityEnum.PUBLIC,
                    deleted: false,
                },
                fields: ['name', 'visibility']
            }),
            options: [
                {
                    name: 'Workspace Id',
                    description:
                        'Id of the workspace to which you can read workspaces',
                    key: 'workspaceId',
                },
            ],
        },
    }
}
```

**NOTE**: one important remark is that since the fields is inside the `getConditions` method. It can either be **hard
code**
or **dynamic** by passing it as a property of the **options** argument.

## Policy Information Point (PIP)

The policy information point in Attribute Based Access Control is the service that is in charge of proving information
about the entity upon which the rules are going to be evaluated. This service can be found under
policy-information-point.service.ts

There are two configuration options that have to be done for the rules to work.

1. Map a subject from SubjectEnum to an entity from the prisma client inside ResourceEntityMap

```ts
const ResourceEntityMap = {
    [SubjectEnum.Project]: 'project' as const,
}
```

2. Define which properties should be selected or included by the prisma orm for a given entity. For more information
   about selecting fields
   read [Select fields](https://www.prisma.io/docs/concepts/components/prisma-client/select-fields)
   and [Include](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#include)

```ts
const SelectOrIncludeArgs = {
    [SubjectEnum.Project]: {
        select: {
            id: true,
            visibility: true,
            workspaceId: true,
        },
    } as Prisma.ProjectArgs,
}
```

If you don't map a subject with an entity, then rules that need the PIP won't know how to fetch the resource.

In case of defining the properties to be selected if you don't define it will select the default properties (
Check [Return default selection fields](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#include))
and if your rule needs to join a relationship then you need to include it there.

For example let's pretend the workspace have a visibility property which you want check for a rule name "Can read
projects of public workspace" with the shape of:

```ts
const rule = {
    subject: SubjectEnum.Project,
    action: ActionEnum.read,
    conditions: {
        "workspace.id": 1,
        "workspace.visibility": 'PUBLIC'
    }
}
```

Then the select statement would look like following:

```ts
const SelectOrIncludeArgs = {
    [SubjectEnum.Project]: {
        select: {
            workspace: {
                select: {
                    id: true,
                    visibility: true
                }
            }
        },
    } as Prisma.ProjectArgs,
}
```

## Updating the default roles of a user

Once your permissions are defined you need to add then to the default roles of the platform. This is possible inside the
`default-roles.service.ts` file.

You can add permissions to the tenant and workspaces roles by adding/removing the permissions 
to/from templates inside the `getTenantRolesTemplate` and `getWorkspaceRolesTemplate`.

### Passing information to the roles templates

Each `getRolesTemplate` argument define some arguments that are passed as options to the permissions of the role
for example for the workspace roles, the id of the workspace is passed. You can add more options by extending that
argument.

**IMPORTANT**: You have to define unique default string values since those are used when verifying if the roles where updated

```ts
{
    domain = '<%= domain %>',
    workspace = { id: '<%= workspace.id %>' }
}
```

### Migrating the roles

Every time the app bootstraps it will check for those templates in order to see if the roles changed and migrate
all the default roles of the platform.

## Applying Access Control to a Rest API

Once all the previous setup is done the next step is to actually protect your Rest APIs. There are two parts involved in
this the `PolicyEnforcementPoint` interceptor and the
`Policy` decorator.

### Policy Enforcement Point (PEP) Interceptor

The PEP in ABAC (Attribute Based Access Control) is the service on charge of enforcing the authorization rules inside
the system. This is done by working with the PIP and the
**Policy Decision Point (PDP)**, which in our case would be _CASL_, in order to evaluate if a given user is allowed to
access a resource.

In order to use the PEP is a nestjs interceptor so for more information about Interceptors please
check [NestJS Interceptor](https://docs.nestjs.com/interceptors).

Whenever you want to enforce access control in a controller you have to add the interceptor to it

```ts
import {UseInterceptors} from "@nestjs/common";
import {PolicyEnforcementPointInterceptor} from "@/access-control/policy-enforcement-point.interceptor";

@Controller('projects')
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class ProjectController {
}
```

In case you need to use the FileInterceptor to handle files upload, you are going to have to add the interceptors at the
method level.

**IMPORTANT**: The FileInterceptor will parse the multipart/form-data instead of the default body parses of express.
Therefore, the `PolicyEnforcementPointInterceptor` have to be **AFTER** the `FileInterceptor`

```ts
import {UseInterceptors} from "@nestjs/common";
import {PolicyEnforcementPointInterceptor} from "@/access-control/policy-enforcement-point.interceptor";

@Controller('projects')
export class ProjectController {
    @Patch(':id/uploads')
    @UseGuards(JwtAuthGuard)
    @Policy({
        subject: SubjectEnum.Project,
        action: ActionEnum.update,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'), PolicyEnforcementPointInterceptor)
    async uploadFile(
        @UploadedFile() file: MulterS3File,
        @Param('workspaceId', ParseIntPipe) _workspaceId: number,
        @Param('id', ParseIntPipe) _id: number,
    ): Promise<Upload> {
        return await this.uploadRepository.create(file)
    }
}
```

### Policy Decorator

The policy decorator provides metadata about which validation should be applied to a specific route the mandatory fields
are `subject` and `action`. For a complete documentation of the API check
`policy.decorator.ts`

In the above example you can see how the Policy decorator is used to specify that this route will evaluate rules that
match the subject **Project** and the action **update**.

```ts
@Policy({
    subject: SubjectEnum.Project,
    action: ActionEnum.update,
})
```

It's also possible to customize the Policy Information Provider for a route using the Policy decorator.

```ts
@Policy({
  subject: SubjectEnum.Project,
  action: ActionEnum.list,
  informationProvider: {
    entity: SubjectEnum.Workspace,
    identifier: 'workspaceId',
  },
})
```

#### PIP Identifier
By default, the PIP uses the "id" param of a request to identify the entity it wants to fetch, but it is possible
to override this behavior and use another parameter by using ``informationProvider.identifier``. For example in the previous code snipped we used "workspaceId"

#### PIP entity

In some cases like when listing the project, you want to evaluate the permissions upon a different entity.
In order to do that you can specify it using the ``ìnformationProvider.entity``.

## Per entity authorization and GET many routes

In the previous rule "All the workspace roles can see public projects", we are only defining the permissions for a
single entity that will be applied to a route such as `GET /projects/:id`. What about `GET /projects`? In case you have
a route that fetch multiple entities you have to use the **list** action.

One important thing about the list actions is that they are evaluated on the request and on the response.

In case of the request. The subject upon which the list rule is evaluated is the "parent entity" of the subject defined
in the Rule definition. For example in case of subject "Project" the respective parent entity is the "Workspace". A good
analogy is to think about files and folders. To list the files inside the directory "example/*" you need to verify that
the user can read the files inside the parent folder named "example"

A rule to list project would look like:

```ts
const listProjects = {
    name: ProjectRules.listProjects,
    description:
        'Grant permission to the user to list all projects in the workspace',
    feature: FeaturesEnum.Project,
    subject: SubjectEnum.Project, // THE PARENT OF THE PROJECT IS THE WORKSPACE
    action: ActionEnum.list,
    /**
     *  THIS IS EVALUATED AGAINST THE WORKSPACE ENTITY SO ID THERE MEANS WORKSPACE ID
     */
    getConditions: (opts) => ({
        conditions: {
            id: opts.workspaceId,
        },
    }),
    options: [
        {
            name: 'Workspace Id',
            description:
                'Id of the workspace to which you can read workspaces',
            key: 'workspaceId',
        },
    ],
}
```

When fetching multiple entities you may have 2 cases:

### With per entity authorization

In some cases you will have to use "**list**" and "**read**" permissions together. First "**list**" tells the user if
they can fetch many entities. Then for each entity, we will apply the "**read**" action.

### Without per entity authorization

In some other cases, like getting the users of a workspace, you don't need to evaluate "**read**" for every entity,
since you either can see the users of a workspace or can not. In this case you need to set the
'**evaluateReadForListAction**' property to false in the @Policy decorator

```ts
import {SubjectEnum} from "./access-control.types";

@Policy({
    action: ActionEnum.list,
    subject: SubjectEnum.User,
    evaluateReadForListAction: false,
    informationProvider: {
        // Selects the information provider when evaluating "List" actions
        entity: SubjectEnum.Workspace
    }
})
```

## How to test policies

TODO in a future sprint

# Frontend Authorization

In order to make the UI represent the permissions that a user have we need to hide or show UI components or pages based
upon the rules of a user. In order to do that we use the [CASL vue](https://casl.js.org/v5/en/package/casl-vue) library.

To verify if a user have permission to do an action over subject use `$can(action, subject)`

```vue
<div v-if="$can('update', caslProject)">
  <ProjectUpdateForm />
</div>
```

## Defining the subject

Defining the subject for frontend authorization is more flexible since you can decide to shape it however you want, but also it may be harder
to properly implement since you need more understanding of how the rules work. In order for casl to recognize the subject type we use the `subject`
utility function

```ts
import { subject } from '@casl/ability'

const caslProject = computed(() =>
    subject('Project', {
        // ...properties of the project
    })
)
```

The Project that you fetch from the Rest API should in most cases have all the necessary properties to decide if a user can do an action upon it.

In some simple cases, let's say the user itself is the owner of the project. He will probably have a rule that allow him to edit a project with a specific id.
In that case you only need the ID of the project for the rule to be evaluated as true and for the UI component to be rendered
