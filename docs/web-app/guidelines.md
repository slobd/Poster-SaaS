This file documents JITSI referencing the `/web-app-material` folder

# Guidelines for implementing a new feature on the frontend

This documentation is aimed to guide developers on the implementation of new features on the web-app (NuxtJS).

## Pages

Starting a new feature will will probably require to add a new page to the frontend. Adding a new page is as simple as
adding a new folder/file in the pages folder. For more information check
a [NuxtJS](https://nuxtjs.org/docs/directory-structure/pages/) tutorial.

## Routes

Good new: [NuxtJS-rounting](https://nuxtjs.org/docs/get-started/routing) handles routes for us. With some prio NuxtJS
knowledged this is not a news rather an information. Each folder/file inside the `/pages` folder represent a page/route
on the application.
`pages/groups` can be visited with the following url `[site_url]/groups`.

## Components

Pages can be a collection of [components](https://nuxtjs.org/docs/directory-structure/components). Components are there
to help us avoid code duplication and reduce page's code size. If the code of a page get's to long, this is a hint that
one should use components to modularize the code.

### Component template

```js
<template>
  <div>
    Your code here
  </div>
</template>
<script lang="ts">
  import {defineComponent} from '@nuxtjs/composition-api'
  export default defineComponent({
  middleware(): void {...},
  setup(){...}
})
</script>
```

Above is a template on how to create a component. Note the `lang="ts"` inside the `<script>`-tag. This is a hint that
the component is using typescript. We use typescript for almost all of our component. Also note the `export` definition.
Here, we are exporting as `Vue.extend` and `defineComponent`. The difference is one is using the `Composition API` and
the other normal vue.

### Using Icons

Vuetify comes with it own sets of rules. One of them is icon usage. To use icon inside a component, the following
convention applies.

_Snippet_

```vue

<template>
  <div>
    <FontAwesomeIcon :icon="icons.faPaperPlane" size="lg" fixed-width />
  </div>
</template>
<script lang="ts">
import { faPaperPlane } from '@fortawesome/pro-solid-svg-icons'
import {
  defineComponent,
} from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
  setup() {
    const { icons } = useIcons({
      faPaperPlane,
    })

    return {
      icons,
    }
  },
})

</script>
```

### Composition API

We highly recommend this
reading [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html#why-composition-api) to get
started.

Example of the composition API Vue
file [holds UI](https://gitlab.com/posterlab/posterlab-mvp/-/blob/a70d57315bfd2b8e4751011afcf6962eeb913f8c/web-app-material/pages/experts/index.vue)

Composable
file [holds Business Logic](https://gitlab.com/posterlab/posterlab-mvp/-/blob/a70d57315bfd2b8e4751011afcf6962eeb913f8c/web-app-material/composables/experts/useExperts.ts)

Using the `Composition API` comes with several advantages compared to the `Options API`. The most evident advantage is
the ability to use a more functional approach when building components, it's easier to encapsulate and reuse the logic,
it allows us to access `nuxt/vue` internal outside a Vue component as seen in the `useExpert.ts` file
with `const { $auth, $accessor, $axios } = useContext()`

#### Organization of a composable function

One of the problems we may encounter is when organizing the logic inside the setup function or the composable. To
increase readability the logic should be organized as follows:

1. Register composable
2. Reactive data properties
3. Constants
4. Computed properties
5. Public methods (methods that are returned by the composable)

To follow the Clean Code practices when splitting the login into smaller functions if the function is private (not
returned by the composable) it should be prefixed with an underscore _ as an example:

```js
async function fetchUsers() {
  try {
    if (currentSorting.value === ExpertSortOptions.BEST_MATCHING && $auth.user.id) {
      users.value = await $axios.$get(
        APIRoutes.IAM_EXPERTS_RECOMMEND + '/' + $auth.user.id
      )
    } else {
      users.value = await $axios.$get(APIRoutes.IAM_USERS_EXPERTS)
    }
    _removeLoggedinUser()
  } catch
    (e) {
    users.value = []
  }
}

function _removeLoggedinUser() {
    if ($auth.loggedIn) {
        const indexOfCurrentUser = users.value.findIndex((user) => user.id === $auth.user.id)
      if (indexOfCurrentUser !== -1) {
        users.value.splice(indexOfCurrentUser, 1)
      }
    }
}
``` 

#### Composable folder

A new folder has been introduced named `composables` there we should have the new composable functions. Inside we will
organize our functions in folders per feature and common folder for functionality shared across multiple domains.

All the files should hold only one composable function and the functions should start with the prefix use,
example `useExperts()`

#### Separation of business logic

In order to maintain a better separation between the UI and logic, we should encapsulate the logic of the component
inside a composable function that only exposes the methods and properties needed by the component (therefore we can hide
implementation details). This is inspired
by [smart and dumb component](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0).

Although the author says he doesn't follow that pattern anymore he proposes the use of hooks that is pretty much
the `ReactJS` version of the `Composition API`.

There are cases where the business logic and the UI belong together, for example when building an Input Component
everything that relates to the input per see can be left inside the Input unless you want to split it just for the sake
of readability or to avoid duplication of code (Vuetify follows this pattern if you look into the source code, except
that they use mixins when they share common functionality across their components)

### Tailwind and Vuetify

We use [Vuetify](https://vuetifyjs.com/en/) as our components library

For component customization, we make use of [tailwind](https://tailwindcss.com/docs). Tailwind is a css library that
offers a set of css classes that can use in a component without having to define the related css as this is provided by
the library. With this, no need to define any css in a component.

```html

<h3 class="w-10/12 text-2xl text-gray-900">
  Tailwind css
  <h3></h3>
</h3>
```

Since both libraries have their own css classes we added a prefix `tw-` to all the tailwind classes.

As a rule of thumb we always Tailwind classes except for color and typography size.

You can use raw css for certain exceptions not covered by our current version of tailwind css

## Store

The store is our data manager. We use the store to communicate with the backend from your component and composable. Due
to the poor typing system in `Vue` with `Vuex` we adopt the `typed-vuex` library to manage our store instead of using
the core one. `typed-vuex` give use all typing we need for our store.

When adding a new store file, remember to import that file as module in the main store file (`index.ts`)

```js
import * as myModule from '~/store/my'

...
export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {
    ...,
    my: myModule,
  },
})
```

Note here the `import`, we are importing from `~/store/my` where `my` is the file we are importing. As a thumb of rule
we define a store file for each `page/module`.

## Testing

Testing is part of the developer work when implementing a new feature. A feature is approved only when the tests are
implemented and passing according to the feature requirement.
**Hint** use the _group_ page as reference for you implementation of `e2e`test.

***TODO***