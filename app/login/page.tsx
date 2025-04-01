// // app/login/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!username || !password) {
//       setError("Username and password are required");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       setError(null);

//       const result = await signIn("credentials", {
//         redirect: false,
//         username,
//         password,
//       });

//       if (result?.error) {
//         setError(result.error);
//       } else {
//         router.push(callbackUrl);
//       }
//     } catch (err) {
//       setError("An unexpected error occurred");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md p-8">
//         <div className="mb-6 text-center">
//           <h1 className="text-2xl font-bold">IMS Portal Login</h1>
//           <p className="text-sm text-gray-500">
//             Enter your credentials to access the system
//           </p>
//         </div>

//         {error && (
//           <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2">
//             <label htmlFor="username" className="block text-sm font-medium">
//               Username
//             </label>
//             <Input
//               id="username"
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               disabled={isLoading}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label htmlFor="password" className="block text-sm font-medium">
//               Password
//             </label>
//             <Input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={isLoading}
//               required
//             />
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Signing in..." : "Sign in"}
//           </Button>
//         </form>
//       </Card>
//     </div>
//   );
// }

// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      // Error is handled in auth context
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            Sign in to IMS Portal
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="your.email@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
