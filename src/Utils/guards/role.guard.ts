import { CanActivate, ExecutionContext, UnauthorizedException, InternalServerErrorException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "../decorators/roles.decorator";
import { Public } from "../decorators/public.decorator";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            // Public decorator is used to bypass the guard
            if (this.reflector.get(Public, context.getHandler()))
                return true;
            const { user } = context.switchToHttp().getRequest();
            const allowedRoles = this.reflector.get(Roles, context.getHandler());
            if (!allowedRoles.includes(user.role))
                throw new UnauthorizedException('You are not authorized to access this resource');
            return true;
        } catch (err) {
            console.error(err)
            if (err instanceof UnauthorizedException)
                throw err
            throw new InternalServerErrorException(err.message ?? 'Role Guard Failed with err: ' + err.message);
        }

    }
}