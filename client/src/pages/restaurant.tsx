import { useQuery, useMutation } from "@tanstack/react-query";
import { ChefHat, Clock, CheckCircle, User, Phone, Bell, BellOff, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Order } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";

const statusColors = {
  pending: "bg-amber-500 text-white",
  preparing: "bg-chart-2 text-white",
  ready: "bg-chart-5 text-white",
  delivered: "bg-muted text-muted-foreground",
};

export default function Kitchen() {
  const { toast } = useToast();
  const { 
    playNotification, 
    isEnabled, 
    setIsEnabled,
    alarmTone,
    setAlarmTone,
    repeatCount,
    setRepeatCount,
    volume,
    setVolume
  } = useNotificationSound();
  const previousOrderCountRef = useRef<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Auto-refresh every 5 seconds to detect new orders
    staleTime: 0, // Always consider data stale so it refetches
    refetchOnWindowFocus: true, // Refetch when switching to this tab
  });

  // Play notification sound when new orders arrive
  useEffect(() => {
    if (orders) {
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      
      // Play sound if we have new pending orders
      // Skip only on initial load (when previousOrderCountRef is null)
      if (previousOrderCountRef.current !== null && pendingCount > previousOrderCountRef.current) {
        playNotification();
        toast({
          title: "New Order Received!",
          description: `You have ${pendingCount} pending order${pendingCount > 1 ? 's' : ''}`,
        });
      }
      
      // Always update the ref, even if count is 0
      previousOrderCountRef.current = pendingCount;
    }
  }, [orders, playNotification, toast]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/active"] });
      toast({
        title: "Success",
        description: "Order status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeOrders = orders?.filter((order) => order.status !== "delivered");
  const pendingOrders = activeOrders?.filter((order) => order.status === "pending");
  const preparingOrders = activeOrders?.filter((order) => order.status === "preparing");
  const readyOrders = activeOrders?.filter((order) => order.status === "ready");

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  const renderOrderCard = (order: any) => {
    const items = order.items as any[];
    const orderSource = order.orderSource || "staff";
    const orderType = order.orderType;
    const customerName = order.customerName;
    const customerPhone = order.customerPhone;
    const hasCheckedInBooking = order.hasCheckedInBooking;
    const roomNumber = order.roomNumber;
    
    // Only show room number if the room has an active checked-in booking
    const showRoomNumber = orderType !== "restaurant" && hasCheckedInBooking && roomNumber;
    
    return (
      <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg" data-testid={`text-order-room-${order.id}`}>
                  {orderType === "restaurant" ? (
                    customerName || "Restaurant"
                  ) : showRoomNumber ? (
                    `Room ${roomNumber}${customerName ? ` - ${customerName}` : ""}`
                  ) : customerName ? (
                    customerName
                  ) : (
                    "Guest Order"
                  )}
                </CardTitle>
                <Badge variant="outline" className="text-xs" data-testid={`badge-order-source-${order.id}`}>
                  {orderSource === "guest" ? (
                    <><User className="h-3 w-3 mr-1" />Guest</>
                  ) : (
                    <><Phone className="h-3 w-3 mr-1" />Staff</>
                  )}
                </Badge>
                {orderType === "restaurant" && (
                  <Badge variant="secondary" className="text-xs">Restaurant</Badge>
                )}
              </div>
              {customerPhone && (
                <p className="text-xs text-muted-foreground mt-1">
                  📞 {customerPhone}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(order.createdAt!), "PPp")}
              </p>
            </div>
            <Badge className={statusColors[order.status as keyof typeof statusColors]} data-testid={`badge-order-status-${order.id}`}>
              {order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              {items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm" data-testid={`text-order-item-${order.id}-${idx}`}>
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-mono">₹{item.price}</span>
                </div>
              ))}
            </div>
            
            {order.specialInstructions && (
              <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Special Instructions:</p>
                <p className="text-xs mt-1">{order.specialInstructions}</p>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono" data-testid={`text-order-total-${order.id}`}>₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {order.status === "pending" && (
                <Button
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "preparing" })}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-start-order-${order.id}`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Preparing
                </Button>
              )}
              {order.status === "preparing" && (
                <Button
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "ready" })}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-ready-order-${order.id}`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Ready
                </Button>
              )}
              {order.status === "ready" && (
                <Button
                  className="flex-1"
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "delivered" })}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-deliver-order-${order.id}`}
                >
                  Delivered
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            Kitchen Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage incoming orders and preparation</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-alarm-settings"
            title="Alarm settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="icon"
            onClick={() => setIsEnabled(!isEnabled)}
            data-testid="button-toggle-notifications"
            title={isEnabled ? "Disable notifications" : "Enable notifications"}
          >
            {isEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Alarm Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Alarm Tone</label>
                <Select value={alarmTone} onValueChange={(value: any) => setAlarmTone(value)}>
                  <SelectTrigger data-testid="select-alarm-tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🚨 Urgent (Loud Alert)</SelectItem>
                    <SelectItem value="bell">🔔 Bell (Pleasant)</SelectItem>
                    <SelectItem value="chime">🎵 Chime (Soft)</SelectItem>
                    <SelectItem value="classic">⏰ Classic (Beep-Beep)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Repeat Times</label>
                <Select value={String(repeatCount)} onValueChange={(value) => setRepeatCount(Number(value))}>
                  <SelectTrigger data-testid="select-repeat-count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 time</SelectItem>
                    <SelectItem value="2">2 times</SelectItem>
                    <SelectItem value="3">3 times</SelectItem>
                    <SelectItem value="4">4 times</SelectItem>
                    <SelectItem value="5">5 times</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Volume: {Math.round(volume * 100)}%</label>
                <Slider
                  value={[volume * 100]}
                  onValueChange={(values) => setVolume(values[0] / 100)}
                  min={0}
                  max={100}
                  step={10}
                  data-testid="slider-volume"
                  className="mt-2"
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => playNotification()}
              data-testid="button-test-alarm"
            >
              🔊 Test Alarm
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
              {pendingOrders?.length || 0}
            </span>
            Pending
          </h2>
          <div className="space-y-4">
            {!pendingOrders || pendingOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No pending orders</p>
              </Card>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/10 text-chart-2 text-xs font-bold">
              {preparingOrders?.length || 0}
            </span>
            Preparing
          </h2>
          <div className="space-y-4">
            {!preparingOrders || preparingOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No orders in preparation</p>
              </Card>
            ) : (
              preparingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chart-5/10 text-chart-5 text-xs font-bold">
              {readyOrders?.length || 0}
            </span>
            Ready
          </h2>
          <div className="space-y-4">
            {!readyOrders || readyOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No orders ready</p>
              </Card>
            ) : (
              readyOrders.map(renderOrderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
