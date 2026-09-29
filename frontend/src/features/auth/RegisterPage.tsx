import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { AlertCircle, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { FloatField } from "@/components/ui/float-field";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { resendVerificationRequest } from "./auth.api";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    try {
      await registerUser({ name: values.name, email: values.email, password: values.password });
      setRegisteredEmail(values.email);
    } catch (error: any) {
      setServerError(error?.response?.data?.message ?? "Unable to create account. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    setResendMessage(null);
    try {
      setResendMessage(await resendVerificationRequest(registeredEmail));
    } catch (error: any) {
      setResendMessage(error?.response?.data?.message ?? "Could not resend the email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthLayout title="Check your email" subtitle="One last step to activate your account">
        <Card>
          <CardContent className="space-y-4 pt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to <span className="font-medium text-foreground">{registeredEmail}</span>.
              Click the link in that email (valid for 24 hours), then sign in.
            </p>
            {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
            <Button type="button" variant="outline" className="w-full" onClick={handleResend} isLoading={isResending}>
              Resend verification email
            </Button>
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Already verified?
            <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start your admission journey today">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <FloatField id="name" label="Full name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <FloatField id="email" label="Email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <FloatField id="password" label="Password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <FloatField id="confirmPassword" label="Confirm password" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?
          <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
