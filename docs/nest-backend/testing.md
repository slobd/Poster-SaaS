# Running e2e test

In order to run the e2e test you have to first

- Restart the postgres database `yarn restart:postgres` on the root folder (just to be on the safe side)
- Run the cms with `yarn dev` inside `/cms`
- Run `yarn prisma migrate dev` inside `/nest-backend`
- Inside `yarn test:e2e` inside the `/nest-backend`
