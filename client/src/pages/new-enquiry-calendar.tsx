import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, User, Phone, Mail, IndianRupee, MessageSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, Property } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const enquiryFormSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  guestEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  numberOfGuests: z.coerce.number().int().min(1, "At least 1 guest required"),
  priceQuoted: z.coerce.number().min(0).optional(),
  advanceAmount: z.coerce.number().min(0).optional(),
  specialRequests: z.string().optional(),
});

type EnquiryFormData = z.infer<typeof enquiryFormSchema>;

export default function NewEnquiryCalendar() {
  const { toast } = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number>();
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      numberOfGuests: 1,
      priceQuoted: undefined,
      advanceAmount: undefined,
      specialRequests: "",
    },
  });

  const createEnquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/enquiries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enquiries"] });
      toast({
        title: "Enquiry Created!",
        description: "The enquiry has been saved successfully.",
      });
      // Reset everything
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setAvailableRooms([]);
      setSelectedRoomId(undefined);
      setShowGuestForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create enquiry",
        variant: "destructive",
      });
    },
  });

  // Generate calendar days
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handleDateClick = async (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return; // Can't select past dates

    if (!checkInDate) {
      // First click - set check-in date
      setCheckInDate(date);
      setCheckOutDate(undefined);
      setAvailableRooms([]);
      setSelectedRoomId(undefined);
      setShowGuestForm(false);
    } else if (!checkOutDate) {
      // Second click - set check-out date
      if (date <= checkInDate) {
        toast({
          title: "Invalid Date",
          description: "Check-out must be after check-in date",
          variant: "destructive",
        });
        return;
      }
      setCheckOutDate(date);
      // Check availability
      await checkAvailability(selectedPropertyId!, checkInDate, date);
    } else {
      // Third click - reset and start over
      setCheckInDate(date);
      setCheckOutDate(undefined);
      setAvailableRooms([]);
      setSelectedRoomId(undefined);
      setShowGuestForm(false);
    }
  };

  const checkAvailability = async (propertyId: number, checkIn: Date, checkOut: Date) => {
    setLoadingRooms(true);
    try {
      const response = await fetch(
        `/api/rooms/availability?propertyId=${propertyId}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to check availability");
      const rooms = await response.json();
      setAvailableRooms(rooms);

      if (rooms.length === 0) {
        toast({
          title: "No Rooms Available",
          description: "No rooms are available for the selected dates.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rooms Found!",
          description: `${rooms.length} room(s) available for your selected dates.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check room availability",
        variant: "destructive",
      });
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
    setShowGuestForm(true);
  };

  const onSubmit = (data: EnquiryFormData) => {
    if (!selectedPropertyId || !checkInDate || !checkOutDate || !selectedRoomId) {
      toast({
        title: "Missing Information",
        description: "Please select property, dates, and room first",
        variant: "destructive",
      });
      return;
    }

    const enquiryData = {
      propertyId: selectedPropertyId,
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail || null,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      roomId: selectedRoomId,
      numberOfGuests: data.numberOfGuests,
      priceQuoted: data.priceQuoted?.toString() || null,
      advanceAmount: data.advanceAmount?.toString() || null,
      specialRequests: data.specialRequests || null,
      status: "new" as const,
    };

    createEnquiryMutation.mutate(enquiryData);
  };

  const isDateInRange = (date: Date) => {
    if (!checkInDate) return false;
    if (!checkOutDate) return false;
    return date >= checkInDate && date <= checkOutDate;
  };

  const isDateSelected = (date: Date) => {
    return (checkInDate && date.toDateString() === checkInDate.toDateString()) ||
           (checkOutDate && date.toDateString() === checkOutDate.toDateString());
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Enquiry</h1>
        <p className="text-muted-foreground mt-1">
          Select property and dates on calendar to check availability
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Calendar */}
        <div className="space-y-4">
          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Property</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedPropertyId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedPropertyId(parseInt(value));
                  setCheckInDate(undefined);
                  setCheckOutDate(undefined);
                  setAvailableRooms([]);
                  setSelectedRoomId(undefined);
                  setShowGuestForm(false);
                }}
              >
                <SelectTrigger data-testid="select-property">
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Calendar */}
          {selectedPropertyId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>2. Select Dates</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(prev => subMonths(prev, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium min-w-[120px] text-center">
                      {format(currentDate, "MMMM yyyy")}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(prev => addMonths(prev, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {!checkInDate && "Click a date to select check-in"}
                  {checkInDate && !checkOutDate && "Click a date to select check-out"}
                  {checkInDate && checkOutDate && "Click any date to start over"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {calendarDays.map(day => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const selected = isDateSelected(day);
                    const inRange = isDateInRange(day);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast}
                        className={cn(
                          "aspect-square rounded-md text-sm transition-colors",
                          isPast && "opacity-30 cursor-not-allowed",
                          !isPast && !selected && !inRange && "hover:bg-accent",
                          selected && "bg-primary text-primary-foreground font-bold",
                          inRange && !selected && "bg-primary/20",
                          isToday(day) && !selected && "border-2 border-primary",
                          !isSameMonth(day, currentDate) && "opacity-50"
                        )}
                        data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>

                {checkInDate && (
                  <div className="mt-4 p-3 bg-muted rounded-md space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">{format(checkInDate, 'PPP')}</span>
                    </div>
                    {checkOutDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="font-medium">{format(checkOutDate, 'PPP')}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Rooms & Guest Form */}
        <div className="space-y-4">
          {/* Available Rooms */}
          {checkOutDate && availableRooms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>3. Select Room</CardTitle>
                <CardDescription>{availableRooms.length} room(s) available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableRooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-colors",
                        selectedRoomId === room.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      data-testid={`button-select-room-${room.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">Room {room.roomNumber}</div>
                          <div className="text-sm text-muted-foreground">{room.roomType}</div>
                          <div className="text-sm font-medium mt-1">₹{room.pricePerNight}/night</div>
                        </div>
                        {selectedRoomId === room.id && (
                          <Badge variant="default">
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guest Details Form */}
          {showGuestForm && (
            <Card>
              <CardHeader>
                <CardTitle>4. Guest Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Name *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter guest name" className="pl-9" {...field} data-testid="input-guest-name" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter phone number" className="pl-9" {...field} data-testid="input-phone" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guestEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="email" placeholder="guest@example.com" className="pl-9" {...field} data-testid="input-email" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="numberOfGuests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guests *</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} data-testid="input-guests" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priceQuoted"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Quoted</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" placeholder="0" className="pl-9" {...field} data-testid="input-price" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="advanceAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="number" placeholder="0" className="pl-9" {...field} data-testid="input-advance" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any special requirements..." rows={3} {...field} data-testid="textarea-requests" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={createEnquiryMutation.isPending} data-testid="button-submit-enquiry">
                      {createEnquiryMutation.isPending ? "Creating..." : "Create Enquiry"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
