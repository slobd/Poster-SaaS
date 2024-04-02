# Dynamic fields research

## Example APIs

### Create a custom field
The `typeConfig` is the field configuration. For example in ClickUp you can set the min
and max value of a number field

`POST /prisma/custom-fields`

Example request body:

```js
// Creates a Field of type Number
const data = {
    name: 'Estimated Days',
    type: CustomFieldTypeEnum.NUMBER,
    typeConfig: {
        min: 1,
        max: 10
    }
}
// Creates a Field of type Text
const data = {
    name: 'Status',
    type: CustomFieldTypeEnum.TEXT,
    typeConfig: {
        required: true
    }
}
// Creates a Field of type Users
const data = {
    name: 'People',
    type: CustomFieldTypeEnum.USERS,
    typeConfig: {
        includeGuests: false,
        includeTeamMembers: false
    }
}
```

### Get a list of all the custom fields

`GET /prisma/custom-fields`

Example response:

```json
[
    {
        "id": 1,
        "name": "Estimated Days",
        "type": "NUMBER",
        "typeConfig": {
            "max": 10,
            "min": 1
        }
    },
    {
        "id": 2,
        "name": "Status",
        "type": "TEXT",
        "typeConfig": {
            "required": true
        }
    },
    {
        "id": 3,
        "name": "People",
        "type": "USERS",
        "typeConfig": {
            "includeGuests": false,
            "includeTeamMembers": false
        }
    }
]
```

### Create a task
NOTE: Sending the typeConfig with every field could help to avoid doing some extra fetches in the 
backend for validation but could cause the typeConfig data to be stale if it was 
modified by another user just before the POST request was sent. 

`POST /prisma/tasks`

Example body:

```json
{
    "name": "Create task 1",
    "customFields": [
        {
            "customFieldId": 1,
            "type": "TEXT",
            "value": "Text Field Value",
            "typeConfig": {
                "required": true
            }
        },
        {
            "customFieldId": 2,
            "type": "USERS",
            "value": [
                { "id": 1 },
                { "id": 2 }
            ],
            "typeConfig": {
                "includeGuests": false,
                "includeTeamMembers": true
            }
        },
        {
            "customFieldId": 3,
            "type": "NUMBER",
            "value": 3,
            "typeConfig": {
                "max": 10,
                "min": 1
            }
        }
    ]
}
```

### Get all tasks
NOTE: With Prisma we can filter by virtually any column, one-to-one, 
one-to-many, or many-to-many relationship (impossible with TypeORM).

Sorting must be done on the frontend though. It is not possible to sort by 
many-to-many relationships. We can still do it ourselves in the backend or frontend.

`GET /prisma/tasks`

Example response:

```json
[
  {
    "id": 1,
    "name": "Task 1",
    "customFields": [
      {
        "id": 1,
        "customFieldId": 3,
        "name": "People",
        "type": "USERS",
        "typeConfig": {
          "includeGuests": false,
          "includeTeamMembers": false
        },
        "value": [
          {
            "id": 1,
            "firstName": "Fayas",
            "lastName": "Backer",
            "email": "fayas@posterlab.co"
          },
          {
            "id": 2,
            "firstName": "Santi",
            "lastName": "Porta",
            "email": "santi@posterlab.co"
          }
        ]
      },
      {
        "id": 2,
        "customFieldId": 2,
        "name": "Status",
        "type": "TEXT",
        "typeConfig": {
          "required": true
        },
        "value": "TO DO"
      },
      {
        "id": 3,
        "customFieldId": 1,
        "name": "Estimated Days",
        "type": "NUMBER",
        "typeConfig": {
          "max": 10,
          "min": 1
        },
        "value": 5
      }
    ]
  },
  {
    "id": 2,
    "name": "Task 2",
    "customFields": [
      {
        "id": 4,
        "customFieldId": 3,
        "name": "People",
        "type": "USERS",
        "typeConfig": {
          "includeGuests": false,
          "includeTeamMembers": false
        },
        "value": [
          {
            "id": 1,
            "firstName": "Fayas",
            "lastName": "Backer",
            "email": "fayas@posterlab.co"
          },
          {
            "id": 3,
            "firstName": "Carsten",
            "lastName": "Blau",
            "email": "carsten@posterlab.co"
          }
        ]
      },
      {
        "id": 5,
        "customFieldId": 2,
        "name": "Status",
        "type": "TEXT",
        "typeConfig": {
          "required": true
        },
        "value": "DOING"
      },
      {
        "id": 6,
        "customFieldId": 1,
        "name": "Estimated Days",
        "type": "NUMBER",
        "typeConfig": {
          "max": 10,
          "min": 1
        },
        "value": 3
      }
    ]
  },
  {
    "id": 3,
    "name": "Task 3",
    "customFields": [
      {
        "id": 7,
        "customFieldId": 3,
        "name": "People",
        "type": "USERS",
        "typeConfig": {
          "includeGuests": false,
          "includeTeamMembers": false
        },
        "value": [
          {
            "id": 2,
            "firstName": "Santi",
            "lastName": "Porta",
            "email": "santi@posterlab.co"
          },
          {
            "id": 3,
            "firstName": "Carsten",
            "lastName": "Blau",
            "email": "carsten@posterlab.co"
          }
        ]
      },
      {
        "id": 8,
        "customFieldId": 2,
        "name": "Status",
        "type": "TEXT",
        "typeConfig": {
          "required": true
        },
        "value": "DONE"
      },
      {
        "id": 9,
        "customFieldId": 1,
        "name": "Estimated Days",
        "type": "NUMBER",
        "typeConfig": {
          "max": 10,
          "min": 1
        },
        "value": 10
      }
    ]
  }
]
```

## Database models

We have two main models `Task` and `CustomFields`, and a JOIN table `CustomFieldsOnTasks`

The Task model can hold most of standard
information about a task for example, the task description. 

CustomFields will be used to create new Columns dynamically (same as ClickUp). We will 
probably need a list of the Column/Field types with their corresponding configuration. The
user can then select one of the default types, give it a name, choose the field configuration
and create a CustomField via `POST /prisma/custom-fields`

When creating a task the user can send the task with the available custom fields with 
their corresponding values. The values of each field in a task is going to be store 
in the JOIN table `CustomFieldsOnTasks`. This table is going to have a Column per value type
of each `CustomField`. E.g, for "People type" fields we can have a `peopleValue` column and for
"Text type" fields we can have a `textValue` column. The backend will be on charge of mapping
the "value" property sent by the frontend to the corresponding "value" column in
`CustomFieldsOnTasks`. This way we can abstract the complexity and the frontend does not
need to know how is the value stored

```prisma
model Task {
  id           Int                   @id @default(autoincrement())
  name         String
  customFields CustomFieldsOnTasks[]
}

model CustomFieldsOnTasks {
  id            Int         @id @default(autoincrement())
  task          Task        @relation(fields: [taskId], references: [id])
  taskId        Int // relation scalar field (used in the `@relation` attribute above)
  customField   CustomField @relation(fields: [customFieldId], references: [id])
  customFieldId Int // relation scalar field (used in the `@relation` attribute above)

  numberValue Int?
  textValue   String?
  usersValue  User[]

  @@unique([taskId, customFieldId])
}

model CustomField {
  id         Int                   @id @default(autoincrement())
  name       String
  type       String // NUMBER, USERS, TEXT
  typeConfig Json
  tasks      CustomFieldsOnTasks[]
}

model User {
  id                   Int                   @id(map: "PK_cace4a159ff9f2512dd42373760") @default(autoincrement())
  firstName            String                @db.VarChar
  lastName             String                @db.VarChar
  email                String                @unique(map: "UQ_e12875dfb3b1d92d7d7c5377e22") @db.VarChar
  // Other user fields
  customFieldsOnTasks  CustomFieldsOnTasks[]
}
```