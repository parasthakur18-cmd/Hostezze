import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import type { StaffSalary, SalaryAdvance } from "@shared/schema";

export default function SalariesPage() {
  const [activeTab, setActiveTab] = useState("salaries");

  const { data: salaries = [], isLoading: salariesLoading } = useQuery<StaffSalary[]>({
    queryKey: ["/api/salaries"],
  });

  const { data: advances = [], isLoading: advancesLoading } = useQuery<SalaryAdvance[]>({
    queryKey: ["/api/advances"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const totalSalaryAmount = salaries.reduce(
    (sum, s) => sum + parseFloat(s.netSalary || "0"),
    0
  );

  const pendingSalaries = salaries.filter((s) => s.status === "pending");
  const pendingAdvances = advances.filter((a) => a.repaymentStatus === "pending");
  const totalAdvancesAmount = advances.reduce(
    (sum, a) => sum + parseFloat(a.amount || "0"),
    0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            HR Salary Management
          </h1>
          <p className="text-muted-foreground">
            Manage staff salaries, advances, and payments
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-salaries">
              ₹{totalSalaryAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {salaries.length} salary records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Salaries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-salaries">
              {pendingSalaries.length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advances</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-advances">
              ₹{totalAdvancesAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {advances.length} advance records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Advances</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-advances">
              {pendingAdvances.length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting repayment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="salaries" data-testid="tab-salaries">
              Salaries
            </TabsTrigger>
            <TabsTrigger value="advances" data-testid="tab-advances">
              Advances
            </TabsTrigger>
          </TabsList>
          <Button data-testid="button-add-salary">
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "salaries" ? "Add Salary" : "Add Advance"}
          </Button>
        </div>

        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Records</CardTitle>
            </CardHeader>
            <CardContent>
              {salariesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading salaries...
                </div>
              ) : salaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No salary records found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Staff Member</th>
                        <th className="text-left p-2">Period</th>
                        <th className="text-right p-2">Gross Salary</th>
                        <th className="text-right p-2">Deductions</th>
                        <th className="text-right p-2">Net Salary</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaries.map((salary) => {
                        const user = users.find((u: any) => u.id === salary.userId);
                        return (
                          <tr
                            key={salary.id}
                            className="border-b hover-elevate"
                            data-testid={`row-salary-${salary.id}`}
                          >
                            <td className="p-2">
                              {user?.fullName || salary.userId}
                            </td>
                            <td className="p-2">
                              {format(new Date(salary.periodStart), "MMM yyyy")}
                            </td>
                            <td className="text-right p-2">
                              ₹{parseFloat(salary.grossSalary).toLocaleString()}
                            </td>
                            <td className="text-right p-2">
                              ₹{parseFloat(salary.deductions).toLocaleString()}
                            </td>
                            <td className="text-right p-2 font-semibold">
                              ₹{parseFloat(salary.netSalary).toLocaleString()}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  salary.status === "paid"
                                    ? "default"
                                    : salary.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                                data-testid={`badge-status-${salary.id}`}
                              >
                                {salary.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-view-salary-${salary.id}`}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Advances</CardTitle>
            </CardHeader>
            <CardContent>
              {advancesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading advances...
                </div>
              ) : advances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No advance records found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Staff Member</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-left p-2">Reason</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advances.map((advance) => {
                        const user = users.find((u: any) => u.id === advance.userId);
                        return (
                          <tr
                            key={advance.id}
                            className="border-b hover-elevate"
                            data-testid={`row-advance-${advance.id}`}
                          >
                            <td className="p-2">
                              {user?.fullName || advance.userId}
                            </td>
                            <td className="p-2">
                              {format(new Date(advance.advanceDate), "dd MMM yyyy")}
                            </td>
                            <td className="text-right p-2 font-semibold">
                              ₹{parseFloat(advance.amount).toLocaleString()}
                            </td>
                            <td className="p-2">{advance.reason || "-"}</td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  advance.repaymentStatus === "deducted"
                                    ? "default"
                                    : advance.repaymentStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                                data-testid={`badge-status-${advance.id}`}
                              >
                                {advance.repaymentStatus}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-view-advance-${advance.id}`}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
