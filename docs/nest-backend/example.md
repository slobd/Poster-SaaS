# Poster Module

The following sections explain about creating a poster module based on the guidelines for creating a feature module. Before we start first create a folder called ```posters``` inside the ```nest-backend/src``` folder and store all the files relating to the module inside this folder.
- [Poster Module](#poster-module)
  * [Controllers](#controllers)
  * [Entity, Repository and DTO](#entity--repository-and-dto)
    + [Poster Entity](#poster-entity)
    + [Repository](#repository)
    + [DTO](#dto)
  * [Route Handler](#route-handler)
    + [Poster Get Handler](#poster-get-handler)
    + [Poster Get-One Handler](#poster-get-one-handler)
    + [Poster Post Handler](#poster-post-handler)
    + [Poster Patch Handler](#poster-patch-handler)
    + [Poster Delete Handler](#poster-delete-handler)
  * [Provider](#provider)
  * [Module](#module)
  * [Permissions](#permissions)
    + [Owner permissions](#owner-permissions)
    + [Author Permissions](#author-permissions)
    + [Group Manager Permissions](#group-manager-permissions)
    + [Group Member Permission](#group-member-permission)
  * [Testing](#testing)
    + [Unit Test](#unit-test)
    + [E2E Test](#e2e-test)


## Controllers

The controller file is created to open api routes for the module. There are 5 routes created for the poster module. These routes are secured using ```JwtAuthGuard``` and ```PolicyGuard```.  
```@Controller('posters')``` indicates that the api end points for poster module can be accessed by:  
```
http://<backend-url/posters
```

The get route to get a poster by an id is given below:

```ts
posters.controller.ts


@Controller('posters')
export class PostersController {
    constructor(
        private readonly postersGetOneHandler: PostersGetOneHandler,
    ) {}

    @Get(':id')
    @UseGuards(PolicyGuard)
    @Policy(permissions.POSTER.READ_ONE)
    @ApiOperation({
        operationId: 'Poster_fetch_one'
    })  
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Poster | string> {
        return this.postersGetOneHandler.handle(id)
    }
}
```
Here the ```@Get(':id')``` route is secured using the ```PolicyGuard``` to check for the READ_ALL permissions. Below you can find all the permissions related to the poster module:
```ts
permissions.POSTER.EDIT,
permissions.POSTER.ADMIN,
permissions.POSTER.READ_ONE,
permissions.POSTER.READ_ALL,
permissions.POSTER.EDIT_ONLINE_SESSION,
```
## Entity, Repository and DTO

### Poster Entity
The properties for the poster modules are compiled together to form an entity file. An entity file with some of the entities used in the poster module is given below:


```ts
poster.entity.ts

@Entity()
export class Poster {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Tenant, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    tenant?: Tenant

    @IsOptional()
    @IsString()
    @Column({
        nullable: true,
    })
    title?: string

    @Type(() => Upload)
    @OneToOne(() => Upload, {
        nullable: true,
    })
    @JoinColumn()
    pdf: Upload

    @ApiProperty({ type: String })
    @ValidateNested()
    @Transform(({ value }) => plainToClass(PosterType, { name: value }))
    @ManyToOne(() => PosterType)
    type: PosterType

    @ApiProperty({ type: String })
    @ValidateNested()
    @Transform(({ value }) => plainToClass(PosterVisibility, { name: value }))
    @ManyToOne(() => PosterVisibility)
    visibility: PosterVisibility

    @Type(() => User)
    @ManyToMany(() => User, (user) => user.authoredPosters)
    @JoinTable()
    authors: User[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
```
After creating the entity file, register the poster entities inside the ```nest-backend/src/database/entities.ts``` file

Once the entity is registered, do the migration to make the database changes. To run the migrations execute the following command:

```
yarn typeorm:migrate <name-of-module/activity>
```

If for some reason the migration done has to be reverted execute the following command and delete the migration file that was created inside the ```nest-backend/sr/database/migrations folder``` when the migration was done: 

```
yarn typeorm:revert
```

### Repository

Custom repository files can be created to carry out database operations on the entity. The repository file with the method to fetch a poster by an id from the database is give below:

```ts
poster.repository.ts

@EntityRepository(Poster)
export class PosterRepository extends Repository<Poster> {
    async findOneById(id: number): Promise<Poster> {
        const poster: Poster = await this.findOne(id, {
            relations: [
                'authors',
                'pdf',
                'type',
                'visibility',
                'tenant',
            ],
        })

        return poster
    }
}
```

### DTO

The DTO's are used to filter the api request and response. These can be used to make sure than no sensitive data is given out as response from a api request. For the poster module DTO can be created for operations like fetch create, update etc. The DTO for create poster is given below:

```ts
create-poster.dto.ts

export class CreatePosterData extends OmitType(Poster, [
    'id',
    'pdf',
    'image',
    'authors',
    'createdAt',
    'updatedAt',
] as const) {
    @Type(() => User)
    authors: User[]

    pdf?: Upload

    image?: Upload
}

export class CreatePosterDto extends PosterBinariesDto {
    @ApiProperty({ description: 'Schema: CreatePosterData' })
    @ValidateNested()
    @Transform(({ value }) => plainToClass(CreatePosterData, JSON.parse(value)))
    data: CreatePosterData
}
```

## Route Handler
Once the entity and repository files are set up create the handler files for each routes. 

### Poster Get Handler 
This handler is used to fetch a list of posters in the tenant. This can be either used to get all the posters in the tenant or get a filtered list of posters based on the search tags like keywords, topics, visibility etc. The entry function to the handler is given below:

```ts
posters-get.handler.ts

@Injectable({})
export class PostersGetHandler {
    private readonly logger = new Logger(PostersGetHandler.name)

    constructor(private readonly posterRepository: PosterRepository) {}

    async handle(
        query: FindPosterDto,
        tenant: Tenant,
        user: SanitizedUserDto,
    ): Promise<Poster[]> {
        this.validateFindRequest(query.visibility, tenant, user)

        try {
            if (this.isSearchQuery(query)) {
                return this.search(query, user?.id, tenant)
            } else {
                return this.find(query, user?.id, tenant)
            }
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}
```

### Poster Get-One Handler
This handler is used to fetch a poster based on id.

```ts
posters-get-one.handler.ts

@Injectable({ scope: Scope.REQUEST })
export class PostersGetOneHandler {
    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly postersService: PostersService,
    ) {}

    async handle(id: number): Promise<FindOnePosterResDto> {
        const poster = await this.posterRepository.findOneById(id)

        if (!poster) throw new NotFoundException()

        const res = this.postersService.serializePoster(poster)

        return res
    }
}
```

### Poster Post Handler

This handler handles the creation of the poster and its associated permissions in the database. When a post request is successfully received, the poster is added to the database and permissions to the author and the co-authors are added. The entry function to the poster-post route handler is given below:

```ts
posters-post.handler.ts

@Injectable({ scope: Scope.REQUEST })
export class PostersPostHandler {
    private readonly logger = new Logger(PostersPostHandler.name)
    private user: SanitizedUserDto
    private tenant: Tenant
    private createdPoster: Poster

    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly postersService: PostersService,
        private readonly enforcerService: EnforcerService,
        private readonly uploadsService: UploadsService,
        private readonly permissionService: PosterPermissionsService,
    ) {}

    async handle(
        body: CreatePosterDto,
        files: MulterS3FileRecord,
        user: SanitizedUserDto,
        tenant: Tenant,
    ): Promise<Poster> {
        this.user = user
        this.tenant = tenant

        const newPoster: CreatePosterData = body.data
        newPoster.user = this.user
        newPoster.tenant = this.tenant

        await this.validate(newPoster)

        const { image, pdf } = await this.postersService.storePosterAssets(
            files,
            newPoster,
        )

        if (image) newPoster.image = image
        if (pdf) newPoster.pdf = pdf

        try {
            newPoster.authors = await this.postersService.posterAuthorsToUsers(
                newPoster,
            )

            this.createdPoster = await this.posterRepository.save(newPoster)

            await this.handlePermissions()

            return this.createdPoster
        } catch (e) {
            this.logger.error('Error while creating poster', null, e)
            if (image) this.uploadsService.deleteUpload(image)
            if (pdf) this.uploadsService.deleteUpload(pdf)

            throw new InternalServerErrorException()
        }
    }
}
```

### Poster Patch Handler
The patch route handler is used to handle any edit request for a poster. This handler manages the change in the properties of the poster like title, visibility etc and also the permissions associated with the poster. The entry method for the poster patch route handler is given below:

```ts
posters-patch.handler.ts

@Injectable({ scope: Scope.REQUEST })
export class PostersPatchHandler {
    files: MulterS3FileRecord
    user: SanitizedUserDto
    tenant: Tenant
    posterBeforeUpdate: Poster
    posterToUpdate: UpdatePosterData
    POSTER_RESOURCE: string
    permissions = {
        admin: false,
        editOnlineSession: false,
    }
    newAuthors: UpdateAuthorDto[]

    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly postersService: PostersService,
        private readonly enforcerService: EnforcerService,
        private readonly mailService: MailService,
        private readonly tenantService: TenantService,
    ) {}

    async handle(
        id: number,
        body: UpdatePosterDto,
        files: MulterS3FileRecord,
        user: SanitizedUserDto,
        tenant: Tenant,
    ): Promise<any> {
        this.user = user
        this.tenant = tenant
        this.files = files

        this.posterBeforeUpdate = await this.posterRepository.findOneById(id)
        this.POSTER_RESOURCE = `${Resources.POSTER}/${id}`

        this.posterToUpdate = this.pruneBodyData(body.data)

        await this.findPermissions()

        await this.validateRequest()

        await this.handleOnlineSessionLink()

        await this.handleFilesUpload()

        await this.transformAllAuthorsToUsers()

        await this.handleRemovedAuthors()

        await this.handleNewAuthors()

        const updatedPoster = await this.posterRepository.save(
            this.mergePosterUpdate(),
        )

        await this.handlePermissionsChanges(updatedPoster)

        return this.postersService.serializePoster(updatedPoster)
    }
}
```

### Poster Delete Handler
The delete handler handles all the delete request for the posters. This handler deletes the poster whose id was passed in the request and also removes all permissions associated with that poster. The entry function for the poster delete handler is given below:

```ts
posters-delete.handler.ts

@Injectable({ scope: Scope.REQUEST })
export class PostersDeleteHandler {
    private poster: Poster

    constructor(
        private readonly posterRepository: PosterRepository,
        private readonly postersService: PostersService,
        private readonly uploadsService: UploadsService,
        private readonly permissionService: PosterPermissionsService,
        private readonly enforcerService: EnforcerService,
    ) {}

    async handle(id: number): Promise<void> {
        this.poster = await this.posterRepository.findOne(id, {
            relations: [
                'authors',
                'image',
                'pdf',
                'user',
                'visibility',
                'tenant',
                'group',
            ],
        })

        const result = await this.posterRepository.delete(id)
        console.log(result)

        if (result.affected !== 1) {
            throw new InternalServerErrorException(
                'The document could not be deleted',
            )
        }

        await this.deletePosterAssets()

        await this.deletePermissions()

        return null
    }
}
```

## Provider 

The providers or service file can be used to write logic that can be shared across the route handler. The poster service file with a method to upload assets for a poster is given below:

```ts
posters.service.ts

@Injectable()
export class PostersService {
    private readonly logger = new Logger(PostersService.name)

    constructor(
        private readonly userRepository: UserRepository,
        private readonly uploadsService: UploadsService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        private readonly tenantService: TenantService,
        private readonly enforcerService: EnforcerService,
        private readonly permissionService: PosterPermissionsService,
    ) {}

    /**
     * Check if the poster assets where send and store them
     * @param files Object returned by the MulterS3 middleware
     * @param poster it gets the id of the png or image from the Poster
     */
    async storePosterAssets(
        files: MulterS3FileRecord,
        poster: DeepPartial<Poster>,
    ): Promise<{ image: Upload | null; pdf: Upload | null }> {
        let image: Upload
        let pdf: Upload
        try {
            image = await this.storePosterAsset(files, poster, 'image')
            pdf = await this.storePosterAsset(files, poster, 'pdf')

            return {
                image,
                pdf,
            }
        } catch (error) {
            if (image) this.uploadsService.deleteUpload(image)
            if (pdf) this.uploadsService.deleteUpload(image)
            throw new InternalServerErrorException(
                'Error while saving poster assets',
            )
        }
    }
}
```

## Module

Once all the required files for the poster module is created, create a module file to import all these files. The module file for poster module is given below:

```ts
posters.module.ts

@Module({
    imports: [
        TypeOrmModule.forFeature([PosterRepository, Keyword, Topic, Author]),
        UploadsModule,
        UsersModule,
        PermissionsModule,
        MailModule,
        TenantModule,
        AwsModule,
    ],
    controllers: [PostersController],
    providers: [
        PostersService,
        PostersGetOneHandler,
        PostersGetHandler,
        PostersPostHandler,
        PostersPatchHandler,
        PostersDeleteHandler,
    ],
})
export class PostersModule {}
```

Once the module file is created, register the module in the app module in the root directory. The app module file is given below:

```ts
@Module({
    imports: [
        Logger,
        ConfigModule.forRoot(configModuleSettings),
        SentryModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                dsn: configService.get('SENTRY_DSN'),
                debug: configService.get('NODE_ENV') === 'development',
                environment: configService.get('NODE_ENV'),
            }),
            inject: [ConfigService],
        }),

        TypeOrmModule.forRootAsync({
            useFactory: (config: ConfigService) => {
                console.log('DATABASE_HOST', config.get('DATABASE_HOST'))
                return {
                    type: 'postgres',
                    host: config.get('DATABASE_HOST'),
                    port: config.get<number>('DATABASE_PORT'),
                    username: config.get('DATABASE_USERNAME'),
                    password: config.get('DATABASE_PASSWORD'),
                    database: config.get('DATABASE_NAME'),
                    entities,
                    subscribers: [],
                    logging: ['error'],
                    migrationsRun: config.get('NODE_ENV') !== 'test',
                    dropSchema: false,
                    migrations: [
                        config.get('NODE_ENV') === 'test'
                            ? join(
                                  __dirname,
                                  '../',
                                  'src/database/migrations/**/*{.ts,.js}',
                              )
                            : join(
                                  __dirname,
                                  'database/migrations/**/*{.ts,.js}',
                              ),
                    ],
                    keepConnectionAlive: true,
                }
            },
            inject: [ConfigService],
        }),
        DatabaseModule,
        PostersModule,
        AuthModule,
        UsersModule,
        UploadsModule,
        MailModule,
        AwsModule,
        UtilsModule,
        IamModule,
        TenantModule,
        TenantThemeModule,
        CommentsModule,
        GroupsModule,
        MembershipModule,
        InviteModule,
        RoleModule,
        PermissionsModule,
        CmsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
    exports: [DatabaseModule],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(TenantMiddleware)
            .exclude(
                { path: 'tenants', method: RequestMethod.POST },
                { path: 'tenants', method: RequestMethod.GET },
                { path: 'tenants/:id', method: RequestMethod.PATCH },
                { path: 'tenants/cms', method: RequestMethod.POST },
                { path: 'tenants/cms/:id', method: RequestMethod.PATCH },
                'tenants/by-origin',
                'auth/profile',
                'auth/confirm-email',
            )
            .forRoutes('*')
        consumer.apply(UserMiddleware).forRoutes('*')
    }
}
```
## Permissions

When a poster is created, a set of permissions are granted to the owner and any co-authors linked to that poster. If the poster is uploaded inside a group then the permissions are also granted to the group manager and also the members in that group.

### Owner permissions
To get the list of permissions to be granted for the owner of the poster call the ```getPosterOwnerPermissions``` method inside the ```PosterService``` provider with the poster as an argument. Once the permissions are received the ```addPolicies``` method inside the ```EnforcerService``` can be used to attach thee permissions to the user.

```ts
async function addPosterOwnerPermissions(poster: Poster): Promise<boolean[]> {
    const policies =
        this.permissionService.getPosterOwnerPermissions(poster)

    return Promise.all(
        policies.map((policy) => this.enforcerService.addPolicy(policy)),
    )
}
```

To remove the owner permissions while deleting a poster do the same process as above for getting the list of permissions and then pass it to the ```removePolicy``` method inside the ```EnforcerService```

```ts
async function removePosterOwnerPermissions(poster: Poster): Promise<boolean[]> {
    const policies =
        this.permissionService.getPosterOwnerPermissions(poster)

    return Promise.all(
        policies.map((policy) => this.enforcerService.removePolicy(policy)),
    )
}
```

### Author Permissions

READ_ONE permission is given to any co authors linked to a poster.

```ts
async function addAuthorsPermissions(
    poster: Poster,
    authors?: User[],
): Promise<void> {
    const users = authors || poster.authors

    const readPosterPolicy = (user: User) => [
        user.id.toString(),
        poster.tenant.id.toString(),
        ...permissions.POSTER.READ_ONE(poster.id),
    ]

    await Promise.all(
        users.map((user) => {
            return this.enforcerService.addPolicy(readPosterPolicy(user))
        }),
    )
}
```

When the poster is deleted or the co-author is unlinked from the poster the READ_ONE permission will have to be removed.

```ts
async function removeAuthorsPermissions(poster: Poster): Promise<void> {
    const users = poster.authors

    const readPosterPolicy = (user: User) => [
        user.id.toString(),
        poster.tenant.id.toString(),
        ...permissions.POSTER.READ_ONE(poster.id),
    ]

    await Promise.all(
        users.map((user) => {
            return this.enforcerService.removePolicy(readPosterPolicy(user))
        }),
    )
}
```

### Group Manager Permissions
When a poster is uploaded inside a group, the group manager gets the ADMIN, EDIT and READ_ONE permissions for that poster. Similar to how the poster owner gets the permission, the grouo manager also is granted all permission on the poster.

```ts
async function addGroupManagerPolicies() {
    const permissions =
        this.permissionService.getGroupPosterManagerPermissions(
            this.createdPoster,
        )

    await this.enforcerService.addPolicies(permissions)
}
```
The permissions from the group manager is removed when he is no longer the manager of that group or the user itself is deleted.

### Group Member Permission
When a poster is uploaded inside a group all the members of that group is given the READ_ONE permission for that poster.

```ts
private async addGroupMemberPolicies() {
    const permissions =
        this.permissionService.getGroupPosterMemberPermissions(
            this.createdPoster,
        )
    await this.enforcerService.addPolicies(permissions)
}
```


## Testing

Two types of testing are implemented for each module before its release. Unit test and E2E test. 

### Unit Test

Unit tests are written to test the individual route handler files of the poster module. A unit test written for the poster get handler is given below:

```ts
poster-get.handler.spec.ts

async function createTestingModule(
    customProviders: Provider[],
): Promise<TestingModule> {
    const postersService = createMock<PostersService>()
    const defaultProviders: Provider[] = [
        {
            provide: PostersService,
            useValue: postersService,
        },
    ]
    const providers: Provider[] = unionBy(
        customProviders,
        defaultProviders,
        'provide',
    )
    const module: TestingModule = await Test.createTestingModule({
        providers: [PostersGetHandler, ...providers],
    }).compile()

    return module
}

describe('PosterGetHandler', () => {
    const createUser: DeepPartial<User> = {
        id: 2
    }
    const userWIthRole: DeepPartial<User> = {
        id: 2,
        roles: [
            {
                tenant: { id: 1}
            }
        ]
    }
    describe('handle', () => {
        var defaultUser = userWIthRole as SanitizedUserDto
        var defaultTenant = { id: 2 } as Tenant
        var defaultBody = { data: {} } as CreatePosterDto
        const defaultPoster = { id: 1 } as Poster
        const callHandleFunction =
            (module: TestingModule) =>
            async (query = {},tenant = {}, user = {}) => {
                
                const defaultQuery = {
                    visibility: PosterVisibilityEnum.ORGANIZATION
                }

                
                const postersGetHandler = await module.resolve<PostersGetHandler>(
                    PostersGetHandler,
                )
                
                return postersGetHandler.handle(
                    {
                        ...defaultQuery,
                        ...query,
                        
                    },
                    {
                        ...defaultTenant,
                        ...tenant,
                    },
                    {
                        ...defaultUser,
                        ...user,
                    },
                )
            }

        beforeEach(() => {
            jest.clearAllMocks()
        })
        
        const posterRepository = createMock<PosterRepository>()
        

        test('Poster get fails when user doesnt have access to visibility ORGANIZATION', async () => {
            const querySelect = await posterRepository.posterSelectQuery()
            
            const providers: Provider[] = [
                {
                    provide: PosterRepository,
                    useValue: posterRepository
                },
            ]
            const module = await createTestingModule(providers)
            try {
                const res = await callHandleFunction(module)()
                expect(posterRepository.posterSelectQuery).toHaveBeenCalled()
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException)
            }
            
            
        })
    })
})

```

```createTestingModule``` function is used to initialize  the list of providers required for that speicif part of the handler file to run the test. This function can be called to initiliaze for a single or group of tests. 

### E2E Test

E2E is used to test the whole api route workflow. E2E test is written for each api route of the poster module. A test for the poster get route is given below:

```ts
poster - get.e2e - spec.ts

describe('/posters/get route', () => {
  let server: Server
  let app: INestApplication
  let jwtService: JwtService
  let enforcer: Enforcer

  let userRepository: Repository<User>
  let posterRepository: Repository<Poster>
  let tenantRepository: Repository<Tenant>
  let createTestUser: ReturnType<typeof initCreateTestUser>
  let createTestPoster: ReturnType<typeof initCreateTestPoster>
  let createTestTenant: ReturnType<typeof initCreateTestTenant>
  const login = (email, id) => {
    const payload = { email: email, sub: id }
    return jwtService.sign(payload)
  }
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(new ValidationPipe(validationPipeOption))

    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    userRepository = moduleFixture.get < Repository < User >> (
      getRepositoryToken(User),
    )
    posterRepository = moduleFixture.get < Repository < Poster >> (
      getRepositoryToken(Poster),
    )
    tenantRepository = moduleFixture.get < Repository < Tenant >> (
      getRepositoryToken(Tenant),
    )

    jwtService = moduleFixture.get(JwtService)

    createTestUser = initCreateTestUser(userRepository)
    createTestPoster = initCreateTestPoster(posterRepository)
    createTestTenant = initCreateTestTenant(tenantRepository)

    await app.init()

    enforcer = moduleFixture.get < Enforcer > (CASBIN_ENFORCER)

    server = app.getHttpServer()
  })

  beforeEach(async (done) => {
    await clearDatabase(app, async () => {
      await bootstrapLookupTables(app)
      await bootstrapDefaultTenant(app)
      console.log('BEFORE EACH')
      done()
    })

  })

  afterAll(async () => {
    await app.close()
  })

  describe('Check permission and functionality', () => {

    test('Return 403 if the user does not have the permission [POSTER, READ_ALL] for the given tenant', async (done) => {

      const user = await createTestUser({})
      const tenant = await createTestTenant({})

      const access_token = login(user.email, user.id)

      const response = await getRequest(
        '/posters',
        server,
        tenant.id,
        access_token
      )

      expect(response.status).toBe(HttpStatus.FORBIDDEN)

      done()
    })
  })
})

```
