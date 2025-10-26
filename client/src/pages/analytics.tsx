import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Hotel, IndianRupee, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Revenue",
      value: `₹${analytics?.totalRevenue?.toLocaleString() || "0"}`,
      icon: IndianRupee,
      description: "All-time revenue",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      title: "Occupancy Rate",
      value: `${analytics?.occupancyRate || "0"}%`,
      icon: Hotel,
      description: "Current occupancy",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Total Bookings",
      value: analytics?.totalBookings || "0",
      icon: BarChart3,
      description: "All-time bookings",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Total Guests",
      value: analytics?.totalGuests || "0",
      icon: Users,
      description: "Registered guests",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "This Month Revenue",
      value: `₹${analytics?.monthlyRevenue?.toLocaleString() || "0"}`,
      icon: TrendingUp,
      description: "Current month",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      title: "Average Room Rate",
      value: `₹${analytics?.avgRoomRate?.toLocaleString() || "0"}`,
      icon: Hotel,
      description: "Per night",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Active Properties",
      value: analytics?.activeProperties || "0",
      icon: Building2,
      description: "Currently active",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Repeat Guests",
      value: `${analytics?.repeatGuestRate || "0"}%`,
      icon: Users,
      description: "Guest retention",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics & Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Performance insights and business metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono mb-1" data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue sources across services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Room Revenue</span>
                  <span className="text-sm font-mono" data-testid="text-analytics-room-revenue">₹{analytics?.roomRevenue?.toLocaleString() || "0"}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-chart-1"
                    style={{
                      width: `${((analytics?.roomRevenue || 0) / (analytics?.totalRevenue || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Restaurant Revenue</span>
                  <span className="text-sm font-mono" data-testid="text-analytics-restaurant-revenue">₹{analytics?.restaurantRevenue?.toLocaleString() || "0"}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-chart-4"
                    style={{
                      width: `${((analytics?.restaurantRevenue || 0) / (analytics?.totalRevenue || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Extra Services</span>
                  <span className="text-sm font-mono" data-testid="text-analytics-extra-revenue">₹{analytics?.extraServicesRevenue?.toLocaleString() || "0"}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-chart-2"
                    style={{
                      width: `${((analytics?.extraServicesRevenue || 0) / (analytics?.totalRevenue || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Room Types</CardTitle>
            <CardDescription>Most booked room categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.popularRoomTypes?.map((room: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{room.type || "Standard"}</span>
                    <span className="text-sm font-mono">{room.bookings} bookings</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(room.bookings / (analytics?.totalBookings || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
