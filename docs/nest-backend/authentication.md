#How Authentication Module Is Implemented

User authentication is handled in two sequential separate parts:
1. Sign in or Sign up in Azure SSO page
2. Sign in or Sign up in the nest backend 

## Sign in or Sign up in Azure policy page
Custom policies are configured in `.xml` files inside the `Identity Experience Framework` section 
in the Azure portal. Custom configurations are mainly done inside the `TrustFrameworkExtensions.xml` file 
and the `access URL` for the SSO user interface is based on the `SignUpOrSignin.xml` file.

The sample `access URL` with changeable data is given below:
````
https://posterlabappdev.b2clogin.com/posterlabappdev.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN&client_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A2828%2Fauth%2Fredirect-uri&scope=openid&response_type=code&prompt=login

1. 'posterlabappdev' depends on the azure tenant the policies are configured
2. 'client_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' the client id of the App registered in azure portal for SSO
3. 'redirect_uri=http%3A%2F%2Flocalhost%3A2828%2Fauth%2Fredirect-uri' encoded URL where the respone from Azure should redirect to after Sign in or Sign up
````
Once the user has successfully signed in or signed up in the Azure SSO page,
the response from azure will be redirected to the redirect url mentioned in the 
`access URL`.

## Steps in Sign in or Sign up at the Nest Backend 
After successful sign in or sign up from the Azure SSO, the response is redirected
to the `/redirect-uri` endpoint. The response from Azure will comprise an authentication code.

### Access Token from Azure
To get the `access token`, a post request is sent to the `graph api's` `/token` endpoint. 

The sample `/token` endpoint URL is given below:
```
`https://posterlabappdev.b2clogin.com/posterlabappdev.onmicrosoft.com/B2C_1A_SIGNUP_SIGNIN/oauth2/v2.0/token`
```

Once the access token is received, the `Object ID(unique id in Azure Portal)` of the user
is taken after parsing the access token. With the `Object ID`, a get request is called to the graph API's
`/users` end point to get user profile information including `email` and `authentication type`.

#### Authentication Types
There are two types of authentication methods available in Azure SSO
1. Local Account authentication: users can sign up or sign in using a valid email address
2. External Identity Providers: these are basically the identity providers configured for the SSO.

### Fetch User Entity
Once the user profile information is fetched from `Azure graph API`, the email is checked against the database 
to verify if the user has a user account with the `object ID` from the access token. If the user account already exist, 
the user entity is fetched from the database and returned. When the user account doesn't exist, first a user entity is
fetched from the database that matches the user email. If user entity doesn't exist the user is created.

### Fetch Identity Provider
After getting the user entity, the user's authentication type or email domain is used to find any corresponding 
identity providers already registered in the system. If the authentication type is a Microsoft External AD and does
not exist in the database, then a new identity provider is created and linked with a user directory that matches the
user's email domain. 

### Create User Account
The user account is then created and linked with the user directory corresponding to the selected identity provider.

### Check User Invites
Once the user account is handled, any outstanding invitation records for the user's email that has been accepted is 
checked. If it exists then the user is given the roles with respect to the `role ID` in the `Invite` table to the 
respective workspace.

### Generate JWT Token
Once all the checks are done the user is signed in using the `Jwt service` and an access token is generated. 

### Generate Workspace Url
The workspace `Url` is generated by fetching all the workspaces the user is part of and then taking the host address of the
first workspace in the list (default workspace or recent workspace will be found in the future). The workspace Url
will also have the access token generated from `Jwt service`. 

Sample un-encoded workspace `Url`  is given below:
```
http://localhost:3001/redirect-uri?uri=/workspace/1/home&access_token=axxxxxxxxxxxxxxxxxxxxxxxxxxxxxabxx
```