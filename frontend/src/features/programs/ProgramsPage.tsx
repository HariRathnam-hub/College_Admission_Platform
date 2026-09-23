import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, GraduationCap, Clock, Wallet, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgramsQuery } from "./programs.api";

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useProgramsQuery({ search: search || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explore Programs</h1>
        <p className="text-muted-foreground">Browse available programs and start your application.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, department, or code"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading programs…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load programs. Please try again.</p>}
      {!isLoading && data?.programs.length === 0 && (
        <p className="text-sm text-muted-foreground">No programs match your search.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.programs.map((program, idx) => (
          <motion.div
            key={program._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
          >
            <Card className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <GraduationCap className="h-4 w-4" />
                  {program.degreeLevel.replace("_", " ")}
                </div>
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <CardDescription>{program.department}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {program.durationYears} years
                </div>
                {program.tuitionFee !== undefined && (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> ${program.tuitionFee.toLocaleString()}
                  </div>
                )}
                <p>{program.availableSeats} of {program.totalSeats} seats available</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/dashboard/programs/${program._id}`}>
                    View details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
