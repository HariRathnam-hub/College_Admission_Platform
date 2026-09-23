import { useState } from "react";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminUsersQuery, useUpdateUserMutation } from "./admin.api";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("STUDENT");
  const { data, isLoading } = useAdminUsersQuery({ search: search || undefined, role: role || undefined });
  const updateUser = useUpdateUserMutation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View accounts, manage access, and reassign roles.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name or email" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="FACULTY">Faculty</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading users…</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
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
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={u.role}
                        onChange={(e) => updateUser.mutate({ id: u._id, payload: { role: e.target.value as any } })}
                      >
                        {Object.entries(ROLE_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
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
            {data?.users.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">No users match your filters.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
