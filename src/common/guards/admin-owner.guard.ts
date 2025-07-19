import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AdminOwnerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { userId } = request.params;

    // console.log(userId);

    if (!userId) throw new BadRequestException('Please provide userId');

    const hasPermission =
      userId === request['userId'] ||
      (request['user']?.role as Role) === 'ADMIN';

    // console.log(hasPermission);
    if (!hasPermission) {
      throw new ForbiddenException(
        "You don't have permission to do this action",
      );
    }

    return true;
  }
}
