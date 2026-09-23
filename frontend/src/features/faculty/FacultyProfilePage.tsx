import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyFacultyProfileQuery, useUpdateFacultyProfileMutation } from "./faculty.api";

interface FacultyProfileForm {
  department: string;
  designation: string;
  phone: string;
}

export default function FacultyProfilePage() {
  const { data: profile, isLoading } = useMyFacultyProfileQuery();
  const updateMutation = useUpdateFacultyProfileMutation();

  const { register, handleSubmit, reset, formState } = useForm<FacultyProfileForm>();

  useEffect(() => {
    if (profile) {
      reset({
        department: profile.department ?? "",
        designation: profile.designation ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: FacultyProfileForm) => {
    await updateMutation.mutateAsync(values);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Your reviewer details, shown to students and admins.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Reviewer details</CardTitle>
            <CardDescription>Employee ID: {profile?.employeeId ?? "Not assigned"}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...register("department")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="Assistant Professor" {...register("designation")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={formState.isSubmitting || updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
