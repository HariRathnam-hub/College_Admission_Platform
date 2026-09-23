import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyProfileQuery, useUpdateProfileMutation } from "./profile.api";
import { EducationRecord } from "./profile.types";

interface ProfileForm {
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  guardianName?: string;
  guardianPhone?: string;
  education: EducationRecord[];
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useMyProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const { register, control, handleSubmit, reset, formState } = useForm<ProfileForm>({
    defaultValues: { education: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  useEffect(() => {
    if (profile) {
      reset({
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
        gender: profile.gender,
        phone: profile.phone,
        line1: profile.address?.line1,
        city: profile.address?.city,
        state: profile.address?.state,
        country: profile.address?.country,
        postalCode: profile.address?.postalCode,
        guardianName: profile.guardianName,
        guardianPhone: profile.guardianPhone,
        education: profile.education ?? [],
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileForm) => {
    await updateMutation.mutateAsync({
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      gender: values.gender,
      phone: values.phone,
      address: {
        line1: values.line1,
        city: values.city,
        state: values.state,
        country: values.country,
        postalCode: values.postalCode,
      },
      guardianName: values.guardianName,
      guardianPhone: values.guardianPhone,
      education: values.education,
    });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Keep your details up to date for a smoother application.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{profile?.profileCompletionPercent ?? 0}%</p>
          <p className="text-xs text-muted-foreground">Profile complete</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Basic information used across your applications.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("gender")}
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="+1 555 000 1234" {...register("phone")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="line1">Street address</Label>
              <Input id="line1" {...register("line1")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" {...register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardian details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian name</Label>
              <Input id="guardianName" {...register("guardianName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian phone</Label>
              <Input id="guardianPhone" {...register("guardianPhone")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Education history</CardTitle>
              <CardDescription>Add your academic records.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ level: "10th", institution: "" })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add record
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No education records added yet.</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border p-4 sm:grid-cols-5">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    {...register(`education.${index}.level` as const)}
                  >
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Institution</Label>
                  <Input {...register(`education.${index}.institution` as const)} />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" {...register(`education.${index}.yearOfCompletion` as const, { valueAsNumber: true })} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>% / GPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`education.${index}.percentageOrGpa` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex items-center gap-3">
            <Button type="submit" isLoading={formState.isSubmitting || updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save profile
            </Button>
            {updateMutation.isSuccess && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Saved
              </span>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
