import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MessageSquarePlus,
  Phone,
  Mail,
  Calendar,
  Hotel,
  Users,
  DollarSign,
  Send,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Enquiry } from "@shared/schema";

export default function Enquiries() {
  const { data: enquiries, isLoading } = useQuery<Enquiry[]>({
    queryKey: ["/api/enquiries"],
  });

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      new: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      messaged: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      payment_pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      paid: "bg-green-500/10 text-green-700 dark:text-green-400",
      confirmed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
    };

    return (
      <Badge
        className={statusColors[status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"}
        data-testid={`badge-status-${status}`}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track customer booking enquiries
          </p>
        </div>
        <Link href="/new-enquiry">
          <Button data-testid="button-new-enquiry">
            <MessageSquarePlus className="h-5 w-5 mr-2" />
            New Enquiry
          </Button>
        </Link>
      </div>

      {!enquiries || enquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquarePlus className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Enquiries Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start creating enquiries to track customer booking requests
            </p>
            <Link href="/new-enquiry">
              <Button>
                <MessageSquarePlus className="h-5 w-5 mr-2" />
                Create First Enquiry
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
                <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enquiries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New</CardTitle>
                <MessageSquarePlus className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enquiries.filter((e) => e.status === "new").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                <CreditCard className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enquiries.filter((e) => e.status === "payment_pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <Hotel className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enquiries.filter((e) => e.status === "confirmed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enquiries Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Enquiries</CardTitle>
              <CardDescription>
                View and manage all customer enquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enquiries.map((enquiry) => (
                      <TableRow key={enquiry.id} data-testid={`row-enquiry-${enquiry.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{enquiry.guestName}</p>
                              <p className="text-sm text-muted-foreground">
                                {enquiry.numberOfGuests} guest{enquiry.numberOfGuests > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {enquiry.guestPhone}
                            </div>
                            {enquiry.guestEmail && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {enquiry.guestEmail}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <p>{format(new Date(enquiry.checkInDate), "MMM d")}</p>
                              <p className="text-muted-foreground">
                                to {format(new Date(enquiry.checkOutDate), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Hotel className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Room #{enquiry.roomId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <p className="font-medium">₹{enquiry.priceQuoted}</p>
                              {enquiry.advanceAmount && (
                                <p className="text-muted-foreground">
                                  Adv: ₹{enquiry.advanceAmount}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {enquiry.status === "new" && (
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-send-message-${enquiry.id}`}
                                disabled
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send Details
                              </Button>
                            )}
                            {enquiry.status === "messaged" && (
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-send-payment-${enquiry.id}`}
                                disabled
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Payment Link
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Integration Notice */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Send className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Integration Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    To send booking details and payment links automatically, Twilio and Stripe
                    integrations need to be configured. Contact support to set this up.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
