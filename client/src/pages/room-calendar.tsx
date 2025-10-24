import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import type { Property, Room, Booking } from "@shared/schema";

export default function RoomCalendar() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
    enabled: !!selectedPropertyId,
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!selectedPropertyId,
  });

  // Filter rooms for selected property
  const propertyRooms = useMemo(() => {
    if (!selectedPropertyId) return [];
    return rooms.filter(room => room.propertyId === selectedPropertyId);
  }, [rooms, selectedPropertyId]);

  // Filter bookings for selected property with confirmed or checked-in status
  const propertyBookings = useMemo(() => {
    if (!selectedPropertyId) return [];
    return bookings.filter(
      booking => 
        booking.propertyId === selectedPropertyId && 
        (booking.status === 'confirmed' || booking.status === 'checked-in')
    );
  }, [bookings, selectedPropertyId]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Check if a room is occupied on a specific date
  const isRoomOccupied = (roomId: number, date: Date) => {
    return propertyBookings.some(booking => {
      if (booking.roomId !== roomId) return false;
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return date >= checkIn && date < checkOut;
    });
  };

  // Get room availability count for a specific date
  const getAvailableRoomsCount = (date: Date) => {
    return propertyRooms.filter(room => !isRoomOccupied(room.id, date)).length;
  };

  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Availability Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Visual overview of room availability across the month
          </p>
        </div>
      </div>

      {/* Property Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Property</label>
              <Select
                value={selectedPropertyId?.toString()}
                onValueChange={(value) => setSelectedPropertyId(parseInt(value))}
              >
                <SelectTrigger data-testid="select-property-calendar">
                  <SelectValue placeholder="Choose a property to view calendar" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.name} - {property.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedPropertyId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Property Selected</h3>
            <p className="text-muted-foreground">
              Please select a property above to view the room availability calendar
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Month Navigation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <CardTitle className="text-2xl">
                    {format(currentDate, "MMMM yyyy")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToToday}
                    className="mt-1"
                    data-testid="button-today"
                  >
                    Today
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Calendar Grid */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Calendar days */}
                {calendarDays.map(day => {
                  const availableCount = getAvailableRoomsCount(day);
                  const totalRooms = propertyRooms.length;
                  const occupancyRate = totalRooms > 0 
                    ? Math.round(((totalRooms - availableCount) / totalRooms) * 100) 
                    : 0;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        border rounded-md p-3 min-h-[100px] flex flex-col
                        ${isToday(day) ? 'border-primary border-2' : ''}
                        ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}
                      `}
                      data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {isToday(day) && (
                          <Badge variant="default" className="text-xs px-1 py-0">
                            Today
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {availableCount}/{totalRooms} available
                        </div>
                        <Badge
                          variant={availableCount === totalRooms ? "outline" : availableCount > 0 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {occupancyRate}% occupied
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Room-wise Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Room-wise Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyRooms.map(room => (
                  <div key={room.id} className="border rounded-lg p-4">
                    <div className="font-semibold mb-3">
                      {room.roomNumber} - {room.roomType}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for alignment */}
                      {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      
                      {calendarDays.map(day => {
                        const isOccupied = isRoomOccupied(room.id, day);
                        return (
                          <div
                            key={day.toISOString()}
                            className={`
                              h-10 rounded flex items-center justify-center text-xs font-medium
                              ${isOccupied 
                                ? 'bg-destructive text-destructive-foreground' 
                                : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                              }
                              ${isToday(day) ? 'ring-2 ring-primary' : ''}
                            `}
                            title={isOccupied ? 'Occupied' : 'Available'}
                            data-testid={`room-${room.id}-day-${format(day, 'yyyy-MM-dd')}`}
                          >
                            {format(day, 'd')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {propertyRooms.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No rooms found for this property
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded border" />
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-destructive rounded border" />
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary rounded" />
                  <span className="text-sm">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
