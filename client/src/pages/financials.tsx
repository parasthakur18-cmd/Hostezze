import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Property } from "@shared/schema";
import { TrendingUp, TrendingDown, DollarSign, Receipt, IndianRupee } from "lucide-react";

export default function Financials() {
  const currentYear = new Date().getFullYear();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: financials, isLoading } = useQuery<any>({
    queryKey: ["/api/financials", selectedProperty, startDate, endDate],
    queryFn: async () => {
      if (!selectedProperty) return null;
      const url = `/api/financials/${selectedProperty}?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch financials");
      return response.json();
    },
    enabled: !!selectedProperty,
  });

  const getPropertyName = (propertyId: number) => {
    return properties.find(p => p.id === propertyId)?.name || "Unknown";
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">View profit & loss statements by property</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Property</Label>
                <Select
                  onValueChange={(value) => setSelectedProperty(parseInt(value))}
                  value={selectedProperty?.toString()}
                >
                  <SelectTrigger data-testid="select-property">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
                  setEndDate(now.toISOString().split("T")[0]);
                }}
                data-testid="button-this-month"
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setStartDate(`${now.getFullYear()}-01-01`);
                  setEndDate(now.toISOString().split("T")[0]);
                }}
                data-testid="button-this-year"
              >
                This Year
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const lastYear = now.getFullYear() - 1;
                  setStartDate(`${lastYear}-01-01`);
                  setEndDate(`${lastYear}-12-31`);
                }}
                data-testid="button-last-year"
              >
                Last Year
              </Button>
            </div>
          </CardContent>
        </Card>

        {!selectedProperty ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a property</h3>
              <p className="text-muted-foreground text-center">
                Choose a property from the filter above to view its financial report
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading financial data...</div>
          </div>
        ) : financials ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400" data-testid="text-total-revenue">
                    ₹{financials.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From bookings & services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400" data-testid="text-total-expenses">
                    ₹{financials.totalExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Lease + Operating costs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                    {financials.netProfit >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      financials.netProfit >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                    data-testid="text-net-profit"
                  >
                    ₹{financials.netProfit.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Revenue - Expenses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      parseFloat(financials.profitMargin) >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                    data-testid="text-profit-margin"
                  >
                    {financials.profitMargin}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Profit / Revenue</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Income Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Bookings & Services</span>
                    <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                      ₹{financials.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Lease Payments</span>
                    <span className="font-mono font-semibold" data-testid="text-lease-payments">
                      ₹{financials.totalLeasePayments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Operating Expenses</span>
                    <span className="font-mono font-semibold" data-testid="text-operating-expenses">
                      ₹{financials.totalOtherExpenses.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {financials.expensesByCategory && financials.expensesByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Operating Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financials.expensesByCategory.map((cat: any) => (
                      <div
                        key={cat.category}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`category-expense-${cat.category}`}
                      >
                        <span className="font-medium capitalize">{cat.category}</span>
                        <span className="font-mono font-semibold">
                          ₹{cat.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
