import { Tenant } from '@/tenant/entities/tenant.entity'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto';
import 'jest-extended'

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        export interface User extends SanitizedUserDto {}

        export interface Request {
            tenant?: Tenant
        }
    }
}
