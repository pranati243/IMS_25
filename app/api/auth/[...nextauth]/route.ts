// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth-options";

// Create the handler using the auth options
const handler = NextAuth(authOptions);

// Export the handler functions for the App Router
export { handler as GET, handler as POST };
