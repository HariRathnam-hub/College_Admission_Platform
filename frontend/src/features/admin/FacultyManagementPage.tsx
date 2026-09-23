import { useState } from "react";
import { useForm } from "react-hook-form";
import { Search, ShieldCheck, ShieldOff, UserPlus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminUsersQuery, useUpdateUserMutation, useCreateStaffUserMutation, CreateStaffPayload } from "./admin.api";

export default function FacultyManagementPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsersQuery({ search: search || undefined, role: "FACULTY" });
  const updateUser = useUpdateUserMutation();
  const createStaff = useCreateStaffUserMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<CreateStaffPayload>({
    defaultValues: { role: "FACULTY" },
  });

  const onCreateFaculty = async (values: CreateStaffPayload) => {
    setFormError(null);
    try {
      await createStaff.mutateAsync({ ...values, role: "FACULTY" });
      reset();
      setShowCreate(false);
    } catch (error: any) {
      setFormError(error?.response?.data?.message ?? "Failed to create faculty account.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground">Provision reviewer accounts and manage access.</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          <UserPlus className="mr-2 h-4 w-4" /> New faculty account
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create faculty account</CardTitle>
            <CardDescription>They'll be able to log in immediately with this password.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onCreateFaculty)}>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...register("name", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("email", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Temporary password</Label>
                <Input type="password" {...register("password", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input {...register("employeeId")} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input {...register("department")} />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input placeholder="Assistant Professor" {...register("designation")} />
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button type="submit" isLoading={formState.isSubmitting}>
                Create account
              </Button>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search name or email" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading faculty…</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((u) => (
                  <tr key={u._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          u.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                        )}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateUser.mutate({ id: u._id, payload: { isActive: !u.isActive } })}
                      >
                        {u.isActive ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" /> Deactivate
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" /> Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.users.length === 0 && <p className="p-6 text-sm text-muted-foreground">No faculty accounts yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
