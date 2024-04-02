# Front-end Authorization

## How to fetch user permissions from the  backend
#### 1. /access-control/users/me/rules
The logged in use can request for the list of all the permissions/rules assigned to him by calling this endpoint. 
The response will be a list of rules assigned to the requesting user. A sample response data is given below:
```json
[
 {
  "subject": "User",
  "action": "create",
  "fields": null,
  "conditions": {
   "tenant.id": "1"
  },
  "feature": "IdentityManagement"
 }
]
```
The above rule lets a user with tenantId = 1 
 the permission to invite a new user into the tenant.

The following rule lets you the permission to list all the users in tenantId = 1.
```json
{
  "subject": "User",
  "action": "list",
  "fields": [
   "id",
   "firstName",
   "lastName",
   "email",
   "isDummyUser",
   "organizationName",
   "avatar"
  ],
  "conditions": {
   "tenant.id": "1"
  },
  "feature": "IdentityManagement"
}
```
The ```fields``` key gives a list of arrays that the user will have 
access to with this rule. Therefore, field level access can be granted or checked using this key. 

While the ```conditions```
key checks for the conditions for which the rule is valid for. In the above example, as shown below, 
id of the tenant should be equal to 1 to validate the rule.
```
 "conditions": {
   "tenant.id": "1"
  }
```


#### 2. /access-control/users/:id/rules
This end point is used to fetch the permissions/rules of a user by id. The response will be 
an array of rules for the user with the id in the request. All properties explained above 
applies to this end point also.

## Accessing Permissions

When a user log in, the ```mounted()``` method inside the ```AppNavigationDrawer.vue``` file will fetch
the rules of the loggedIn user. The fetched rules are updated inside the casl ability plugin instance as below:

```ts
const rules = $accessor.iam.getRules() 
$ability.update(rules)
```
Once the rules are updated for the user the permissions of the user can be validated
anywhere in the web-app using $ability.can() method. The syntax of the method is given below:

```ts
$ability.can(action, subject, field) //field is optional
```
An example is given below:
```ts
// Find People tool is protected with listUsers rule from above
import {subject} from "@casl/ability";

const sUser = computed(() => {
 return subject('User', this.$auth.user)
})

const allow = this.$ability.can('list', sUser.value )
```
The above code snippet checks if the user has the permission to list
all users in the tenant. 

The computed function in the above example is to implement a subject helper. The subject helper
assigns the corresponding subject type(eg: User, Role etc) to the entity value.


### Field Level Access
Some rules restrict access to specific fields. The allowed fields will be listed
inside the ````fields```` key of the rules object. 
```json
    {
        "id": 40,
        "subject": "User",
        "action": "list",
        "fields": [
            "id",
            "firstName",
            "lastName",
            "email",
            "isDummyUser",
            "organizationName",
            "avatar"
        ],
        "options": {
            "tenantId": "1"
        },
        "name": "listUsers",
        "feature": "IdentityManagement",
        "roleId": 1,
        "userId": null,
        "role": {
            "id": 1,
            "system": true,
            "name": "Admin",
            "domain": "Tenant/1",
            "tenantId": 1,
            "description": "Default admin role",
            "users": [
                {
                    "roleId": 1,
                    "userId": 1
                }
            ]
        }
    }
```
The above rule is restricting field access to the user. The user only has 
access to ```"id", "firstName", "lastName", "email", "isDummyUser", "organizationName", "avatar"``` fields.
The access to the "password" field is restricted. 

Validating a user's field level access, with the above rule, can be done in the following way:
```ts
import {subject} from "@casl/ability";

$ability.can('list', subject('User', $auth.user, 'firstName')) // true
$ability.can('list', subject('User', $auth.user, 'password')) // false
```
Notice that in the above code instead of using a computed function the ```subject 
helper``` is directly implemented inside $ability.can(). This is an alternate approach.

The field level access validation can be used for vue components and other vue tags.
```vue
<template>
 <VCard class="tw-h-full tw-p-4 blue-grey lighten-5">
  <div>
   <h3 class="tw-text-base tw-mb-1">DESCRIPTION</h3>
   <p
           v-if="document.description && document.description.length > 100"
           class="tw-text-base"
   >
    {{ document.description.slice(0, 100) }}...
    <VBtn
            text
            x-small
            class="blue--text darken-1"
            :to="`/gallery/${document.id}/abstract`"
    >
     Full abstract
    </VBtn>
   </p>
   <p v-else class="tw-text-base">
    {{ document.description }}
   </p>
  </div>

  <div v-if="$ability.can('read', subject('Project', project), 'topics') &&  document && document.topics" class="tw-mb-3">
   <h2 class="tw-text-base">TOPICS</h2>
   <VChip
           v-for="topic in document.topics"
           :key="`${document.id}-topic-${topic.name}`"
           :ripple="false"
           label
           color="cyan lighten-4"
           class="tw-mr-1 tw-mb-1"
           small
   >
    {{ topic.name }}
   </VChip>
  </div>
  <div v-if="$ability.can('read', subject('Project', project), 'keywords') && document && document.keywords" class="tw-mb-3">
   <h2 class="tw-text-sm">KEYWORDS</h2>
   <VChip
           v-for="keyword in document.keywords"
           :key="`${document.id}-keyword-${keyword.name}`"
           :ripple="false"
           label
           color="cyan lighten-5"
           class="tw-mr-1 tw-mb-1"
           small
   >
    {{ keyword.name }}
   </VChip>
  </div>
 </VCard>
</template>
```
The above code checks if the user has permission for the fields 'keywords' and 'topics'.
We can fix the possible by debugging.
