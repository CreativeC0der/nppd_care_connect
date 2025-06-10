import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, Request, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { verify } from "crypto";
import { Public } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private jwtService: JwtService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            if (this.reflector.get(Public, context.getHandler())) // Public decorator is used to bypass the guard
                return true;
            else if (await this.verifyToken(request)) // Verify token and set user in request
                return true;
            else
                return false;
        } catch (err) {
            console.error(err);
            if (err instanceof UnauthorizedException)
                throw err
            throw new InternalServerErrorException(err.message ?? 'Invalid JWT');
        }

    }
    async verifyToken(request: Request) {
        // Implement your token verification logic here
        let [type, token] = request.headers['authorization']?.split(' ') ?? [];
        token = type === 'Bearer' ? token : undefined;
        if (!token) throw new UnauthorizedException('Authorization Header missing');

        const payload = await this.jwtService.verifyAsync(token);
        request['user'] = payload;
        return true;
    }
}