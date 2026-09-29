import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { FloatField } from "@/components/ui/float-field";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { resendVerificationRequest } from "./auth.api";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    setUnverifiedEmail(null);
    setResendMessage(null);
    try {
      await login(values, "STUDENT");
      const redirectTo = (location.state as { from?: string })?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      if (error?.response?.data?.details?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(values.email);
      }
      setServerError(error?.response?.data?.message ?? error?.message ?? "Unable to sign in. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    try {
      setResendMessage(await resendVerificationRequest(unverifiedEmail));
    } catch (error: any) {
      setResendMessage(error?.response?.data?.message ?? "Could not resend the email. Please try again.");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}
            {unverifiedEmail && (
              <div className="text-xs text-muted-foreground">
                {resendMessage ?? (
                  <>
                    Didn&apos;t get the email?{" "}
                    <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
                      Resend verification email
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <FloatField id="email" label="Email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <FloatField id="password" label="Password" type="password" {...register("password")} />
            <div className="text-right"><Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link></div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?
            <Link to="/register" className="ml-1 font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Faculty or Administrator?{" "}
            <Link to="/faculty/login" className="font-medium text-primary hover:underline">
              Faculty login
            </Link>
            {" · "}
            <Link to="/admin/login" className="font-medium text-primary hover:underline">
              Admin login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
