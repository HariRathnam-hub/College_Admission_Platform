import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verifyEmailRequest } from "./auth.api";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(token ? "" : "This verification link is missing its token.");
  // React StrictMode runs effects twice in dev; the token is single-use, so guard against a double call.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    verifyEmailRequest(token)
      .then((msg) => {
        setMessage(msg);
        setStatus("success");
      })
      .catch((error: any) => {
        setMessage(error?.response?.data?.message ?? "Verification failed. Please request a new link.");
        setStatus("error");
      });
  }, [token]);

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your email address">
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Verifying your email…
            </div>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button asChild className="w-full">
                <Link to="/login">Continue to sign in</Link>
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{message}</p>
              <p className="text-xs text-muted-foreground">
                Try signing in — you&apos;ll be offered a new verification email if your account isn&apos;t verified yet.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Go to sign in</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
