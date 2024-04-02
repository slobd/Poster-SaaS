import { ConfigService } from '@nestjs/config'
import 'isomorphic-fetch'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider'
import { ClientSecretCredential } from '@azure/identity'
import { TokenCredentialAuthenticationProviderOptions } from '@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/ITokenCredentialAuthenticationProviderOptions'

/**
 * Documentation for the Microsoft Graph SDK:
 * - https://www.npmjs.com/package/@microsoft/microsoft-graph-client
 * - Query parameters: https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/HEAD/docs/QueryParameters.md
 */
export class BaseAzureService {
    protected readonly client: Client

    constructor(configService: ConfigService) {
        // Create an instance of the TokenCredential class that is imported
        const tokenCredential = new ClientSecretCredential(
            configService.get('AZURE_TENANT_ID'),
            configService.get('AZURE_CLIENT_ID'),
            configService.get('AZURE_CLIENT_SECRET'),
        )

        const options: TokenCredentialAuthenticationProviderOptions = {
            scopes: ['https://graph.microsoft.com/.default'],
        }

        // Create an instance of the TokenCredentialAuthenticationProvider by passing the tokenCredential instance and options to the constructor
        const authProvider = new TokenCredentialAuthenticationProvider(
            tokenCredential,
            options,
        )

        this.client = Client.initWithMiddleware({
            debugLogging: configService.get('NODE_ENV') === 'development',
            authProvider,
        })
    }
}
