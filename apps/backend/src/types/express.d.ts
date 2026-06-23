import { AccessTokenPayload } from '../shared/utils/token.util';
import { OrgRole } from '../shared/enums/role.enum';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      organizationId?: string;
      memberRole?: OrgRole;
    }
  }
}

export {};