This file documents JITSI referencing the `/nest-backend` folder

# How to create a new feature module

A feature module simply organizes code relevant for a specific feature, keeping code organized and establishing clear
boundaries.

A module comprises of a controller, route handlers, a provider and a repository. While creating a new feature module we
first create the controller, route handlers, provider and repository files.

In the following section you can find how to create a new feature module named ```Cats```.

## Initial setup

1. All modules are saved inside the ```nest-backend/src``` folder. Create a folder cats inside ```nest-backend/src``` to
   save all files to be created for the new module cats.

2. Create the controller, route handler, provider(service) and repository files for cats module inside the cats folder.
   Make sure to use the same name that you have considered for the module as the name for the files created with their
   appropriate post-fixes.

### Controllers

The controller file is where you describe an endpoint for your backend services. You can create the end points for get,
post, patch and delete http methods inside the controller file. The controllers are left alone from logic and is only
used for filtering and receiving requests through all routes.

[More about controller](https://docs.nestjs.com/controllers)

The format for these files are given below:

```ts
cats.controller.ts

import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';

@Controller('cats')
export class CatsController {

    @Get('') fetch() {
        return 'fetches cats data'
    }

    @Post('') create() {
        return 'cats created'
    }

    @Patch(':id') edit() {
        return 'cats edited'
    }

    @Delete(':id') delete() {
        return 'cats deleted'
    }
}
```

```@Controller('cats')``` indicates that the entry point for the endpoints for this module will be 'cats'

#### Securing routes

Authorization guards are used to filter the requests based on Jwt tokens and/or permissions. The classes used are given
below:

**JwtAuthGuard**

This class is used to check for Bearer tokens from the incoming requests. Bearer token are created once a user
successfully log in.

Usage:

```ts
class CatController {
    @UseGuards(JwtAuthGuard)
    @Post('')
    create() {
        // ...
    }
}
```

[More about JWT](https://docs.nestjs.com/security/authentication#jwt-functionality)

**PolicyEnforcementPointInterceptor**

This class is used to check permissions specific to the user or resources in the request. You can use a  ```@Policy()```
decorator to specify the permissions that need to be checked and then use the PolicyGuard to implement the check.

Usage:

```ts
// Here a user that has permission to the action READ_ALL on the resource CAT can only call the get request
import { UseInterceptors } from "@nestjs/common";
import { PolicyEnforcementPointInterceptor } from "./policy-enforcement-point.interceptor";

class CanController {
    @Policy({
        subject: ResourceEnum.Cat,
        action: ActionEnum.read
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    @Get('')
    fetch() {
        return 'fetch cat data'
    }
}
```

Data Transfer Object (DTO)

Are as a validator for a request object for each route. A DTO is an object that defines how the data will be
sent over the network. We use class definition to create a DTO. DTO can be created specific to each route.

[More on DTO](https://docs.nestjs.com/controllers#request-payloads)

You can add validator to the DTO using the [class-validator](https://github.com/typestack/class-validator) library

To make it easier to create multiple similar DTOs, use [@nestjs/swagger](https://docs.nestjs.com/openapi/mapped-types) mapped types

The format for a DTO for a "create" route which takes all entities excepts the auto created id is given below:

```ts
create - cat.dto.ts

import { OmitType } from '@nestjs/swagger'
import { Cat } from '../entities/cat.entity'

export class CreateCatDto extends OmitType(Cat, [
    'id',
] as const) {
}
```

Below shows how the DTO is used:

```ts
cats.controller.ts

class CatController {
    @Post()
    async create(@Body() body: CreateCatDto) {
        return 'This action adds a new cat';
    }
}
```

### Route Handlers

The route handler is where you write the logic for each endpoint. The handlers can be created for each http method.
Create a folder called "route-handler" inside the module folder and store all handler files inside it. The handler file
names should end with .handler.ts.

The format for a post handler file is given below:

```ts
cats - post.handler.ts

@Injectable()
export class CatsPostHandler {
    create() {
        return 'Cats created'
    }
}
```

### Provider

The provider or service file is where you write common logic to all handlers or shared methods between modules. The
service file names should end with .service.ts.

[More on provider](https://docs.nestjs.com/providers)

The format for the service file is given below:

```ts
cats.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
}
```

### Repository

The repository classes contain the logic of that handles the interaction with the database.

Inside the repository file you define the types of the entities returned from the database. This way we can be precise
about the shape of the tenant inside the system coming from the database.

For more information about type safety with prisma
read: https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/prisma-validator

The format for a repository file for the tenant module is given below:

```ts
tenant.repository.ts

const catWithOwner = Prisma.validator<Prisma.CatArgs>()({
    include: {
        owner: true,
    },
})

export type CatWithOwner = Prisma.CatGetPayload<typeof catWithOwner>

@Injectable()
export class CatRepository {
    constructor(private readonly prisma: PrismaService) {
    }

    async findUnique(
        where: Prisma.CatWhereUniqueInput,
    ): Promise<CatWithOwner> {
        return this.prisma.cat.findUnique({
            where,
            ...catWithOwner,
        })
    }

    async findCatsByOwner(ownerId: number): Promise<Cat[]> {
        // ...
    }

    async findOneById(id: number): Promise<CatWithOwner> {
        // ...
    }

    async create(cat: Prisma.CatCreateInput): Promise<Cat> {
        // ...
    }
}
```

3. Once the controller, route handler, service and repository files are created, create a module file called
   cats.module.ts inside the cats folder.

```ts
cats.module.ts

import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CatsPostHandler } from './route-handlers/cat-post.handler'
import { CatsRepository } from './cats.repository'

@Module({
    imports: [],
    controllers: [CatsController],
    providers: [
        CatsService,
        CatsPostHandler,
        CatRepository
    ],
})
export class CatsModule {
}
```

4. The last thing we need to do is import this module into the root module (the AppModule, defined in the app.module.ts
   file inside the nest-backend/src folder).

```ts
app.module.ts

import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
    imports: [CatsModule],
})
export class AppModule {
}
```

## Permissions

### Overview

We use an authorization library called `Casl` to decide if a user has permission to do an action upon a resource. The
roles, rules, and users are managed by us directly on the database so all the actions like creating roles, rules, adding
roles to a user, are simple database operation

The existing rules in the system are defined inside the 'rules.constants.ts' file

### Add a new rule

Use the method ``create`` of ``RulesService`` class to create a rule

### Manage roles of a user

Check users-roles.service.ts

### Check for permission

Create a casl ability instance and call ability.can() function of casl

### Update rule of a role

Use the method ``updateRole`` of ``RolesService`` class to update all the rules of a role rule

### Create a rule for a user

Use the method ``create`` of ``RulesService`` class to create and pass the id of the user for which you want to create
rule

## Testing

We use Jest as a testing framework for unit and e2e tests in the
backend. [You can find more on Jest here](https://docs.nestjs.com/fundamentals/testing#unit-testing). Unit tests are a
minimum requirement when backend module is created. Test has to be created for each new feature that's developed.

Create a folder called ```tests``` inside the module folder to store all test files related to that module. The file
name of the test file corresponding to each file the test is writted on should have ```.spec.ts``` following the name of
the file.

Below you can find a post route handler file for Cats module and a unit test written for it:

```ts
cats - post.handler.ts

@Injectable()
export class CatsPostHandler {

    constructor(
        private readonly catsRepository: CatsRepository) {
    }

    async handle(body: CreateCatDto): Promise<Cat> {
        try {
            const cat = this.catsRepository.save(body)
            return cat

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}
```

```ts
cat - post.handler.spec.ts

async function createTestingModule(
    customProviders: Provider[],
): Promise<TestingModule> {
    const catsRepository = createMock<CatsRepository>()
    const defaultProviders: Provider[] = [
        {
            provide: CatsRepository,
            useValue: catsRepository,
        },
    ]
    const providers: Provider[] = unionBy(
        customProviders,
        defaultProviders,
        'provide',
    )
    const module: TestingModule = await Test.createTestingModule({
        providers: [CatPostHandler, ...providers],
    }).compile()

    return module
}


describe('handle', () => {
    const sampleCat1: DeepPartial<Cat> = {
        age: 3
    }

    const sampleCat2: DeepPartial<Cat> = {
        id: 1,
        name: 'Tom',
        age: 3
    }

    const callHandleFunction =
        (module: TestingModule) =>
            async (body = {}) => {
                const catsPostHandler = await modile.resolve <CatsPostHandler>(
                    CatsPostHandler,
                )

                return catsPostHandler.handler(sampleCat1)
            }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('throw InternalServerErrorException when a new record cannot be created', async () => {
        const providers: Provider[] = [
            {
                provide: CatsRepository,
                useValue: createMock<CatsRepository>({
                    save: async () => sampleCat2
                })
            }
        ]
        const module = await createTestingModule(providers)

        try {
            const res = await callHandleFunction(module)()
        } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException)
        }

    })
})
```

The ```createTestingModule``` function is created to have only a default amount of providers while creating the testing
module. If a module uses more providers it can dynamically be added using this function before creating the testing
module.

## Example modules from the project

1. [Posters Module](nest-backend/POSTERS.MD)