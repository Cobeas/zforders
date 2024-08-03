import { JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";

declare module 'next/server' {
    interface NextRequest {
        user?: string | JwtPayload;
    }
}