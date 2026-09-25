import { useState } from "react";
import { EmptyState } from "@/components/shared/dashboard-ui";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Ban, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useAdminProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeactivateProgramMutation,
} from "./admin.api";
import { Program } from "@/lib/types";

interface ProgramForm {
  name: string;
  code: string;
  department: string;
  degreeLevel: "UNDERGRADUATE" | "POSTGRADUATE" | "DIPLOMA" | "DOCTORATE";
  durationYears: number;
  totalSeats: number;
  description?: string;
  eligibilityCriteria?: string;
  tuitionFee?: number;
}

export default function ProgramsManagementPage() {
  const { data: programs, isLoading } = useAdminProgramsQuery();
  const createProgram = useCreateProgramMutation();
  const updateProgram = useUpdateProgramMutation();
  const deactivateProgram = useDeactivateProgramMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<ProgramForm>({
    defaultValues: { degreeLevel: "UNDERGRADUATE", durationYears: 4, totalSeats: 60 },
  });

  const startCreate = () => {
    setEditingId(null);
    reset({ degreeLevel: "UNDERGRADUATE", durationYears: 4, totalSeats: 60, name: "", code: "", department: "" });
    setShowForm(true);
  };

  const startEdit = (program: Program) => {
    setEditingId(program._id);
    reset({
      name: program.name,
      code: program.code,
      department: program.department,
      degreeLevel: program.degreeLevel,
      durationYears: program.durationYears,
      totalSeats: program.totalSeats,
      description: program.description,
      eligibilityCriteria: program.eligibilityCriteria,
      tuitionFee: program.tuitionFee,
    });
    setShowForm(true);
  };

  const onSubmit = async (values: ProgramForm) => {
    setFormError(null);
    try {
      if (editingId) {
        await updateProgram.mutateAsync({ id: editingId, payload: values });
      } else {
        await createProgram.mutateAsync(values);
      }
      setShowForm(false);
    } catch (error: any) {
      setFormError(error?.response?.data?.message ?? "Failed to save program.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Program Management</h1>
          <p className="text-muted-foreground">Create and maintain the academic program catalog.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" /> New program
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit program" : "Create program"}</CardTitle>
            <CardDescription>Programs appear to students once active.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Program name</Label>
                <Input {...register("name", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input {...register("code", { required: true })} disabled={!!editingId} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input {...register("department", { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Degree level</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...register("degreeLevel")}
                >
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="POSTGRADUATE">Postgraduate</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="DOCTORATE">Doctorate</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duration (years)</Label>
                <Input type="number" step="0.5" {...register("durationYears", { valueAsNumber: true, required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Total seats</Label>
                <Input type="number" {...register("totalSeats", { valueAsNumber: true, required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Tuition fee</Label>
                <Input type="number" step="0.01" {...register("tuitionFee", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <textarea
                  className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("description")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Eligibility criteria</Label>
                <textarea
                  className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("eligibilityCriteria")}
                />
              </div>
            </CardContent>
            <CardFooter className="gap-3">
              <Button type="submit" isLoading={formState.isSubmitting}>
                {editingId ? "Save changes" : "Create program"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading && <EmptyState title="Loading programs…" />}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs?.map((program) => (
                  <tr key={program._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{program.name}</p>
                      <p className="text-xs text-muted-foreground">{program.code}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{program.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {program.availableSeats}/{program.totalSeats}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          program.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {program.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(program)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {program.isActive && (
                        <Button variant="ghost" size="sm" onClick={() => deactivateProgram.mutate(program._id)}>
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {programs?.length === 0 && (
              <EmptyState title="No programs yet. Create your first one" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
