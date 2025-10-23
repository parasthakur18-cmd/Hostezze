import { useQuery } from "@tanstack/react-query";
import { Receipt, DollarSign, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Bill } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const paymentStatusColors = {
  paid: "bg-chart-5 text-white",
  unpaid: "bg-destructive text-destructive-foreground",
  partial: "bg-amber-500 text-white",
};

export default function Billing() {
  const { data: bills, isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = bills?.reduce((sum, bill) => sum + parseFloat(bill.totalAmount), 0) || 0;
  const paidBills = bills?.filter((bill) => bill.paymentStatus === "paid").length || 0;
  const unpaidBills = bills?.filter((bill) => bill.paymentStatus === "unpaid").length || 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif">Billing & Invoices</h1>
        <p className="text-muted-foreground mt-1">Track payments and generate invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono" data-testid="stat-total-revenue">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Bills</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono" data-testid="stat-paid-bills">{paidBills}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bills</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono" data-testid="stat-unpaid-bills">{unpaidBills}</div>
          </CardContent>
        </Card>
      </div>

      {!bills || bills.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Receipt className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold">No bills yet</h3>
            <p className="text-muted-foreground max-w-md">
              Bills will be generated automatically when guests check out
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <Card key={bill.id} className="hover-elevate" data-testid={`card-bill-${bill.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Invoice #{bill.id}
                      <Badge className={paymentStatusColors[bill.paymentStatus as keyof typeof paymentStatusColors]}>
                        {bill.paymentStatus}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {format(new Date(bill.createdAt!), "PPP")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold font-mono" data-testid={`text-bill-total-${bill.id}`}>₹{bill.totalAmount}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Room Charges</p>
                    <p className="font-semibold font-mono" data-testid={`text-bill-room-charges-${bill.id}`}>₹{bill.roomCharges}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Food Charges</p>
                    <p className="font-semibold font-mono" data-testid={`text-bill-food-charges-${bill.id}`}>₹{bill.foodCharges}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Extra Services</p>
                    <p className="font-semibold font-mono" data-testid={`text-bill-extra-charges-${bill.id}`}>₹{bill.extraCharges}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Subtotal</p>
                    <p className="font-semibold font-mono" data-testid={`text-bill-subtotal-${bill.id}`}>₹{bill.subtotal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">GST ({bill.gstRate}%)</p>
                    <p className="font-semibold font-mono" data-testid={`text-bill-gst-${bill.id}`}>₹{bill.gstAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Service Charge ({bill.serviceChargeRate}%)</p>
                    <p className="font-semibold font-mono" data-testid={`text-bill-service-charge-${bill.id}`}>₹{bill.serviceChargeAmount}</p>
                  </div>
                  {bill.paymentMethod && (
                    <div>
                      <p className="text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-semibold capitalize">{bill.paymentMethod}</p>
                    </div>
                  )}
                  {bill.paidAt && (
                    <div>
                      <p className="text-muted-foreground mb-1">Paid On</p>
                      <p className="font-semibold">{format(new Date(bill.paidAt), "PPP")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
