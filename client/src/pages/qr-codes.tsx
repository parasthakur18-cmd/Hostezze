import { useState, useEffect, useRef } from "react";
import { Download, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QRCodeGenerator from "qrcode";

export default function QRCodes() {
  const { toast } = useToast();
  const roomQRRef = useRef<HTMLCanvasElement>(null);
  const cafeQRRef = useRef<HTMLCanvasElement>(null);
  
  // Generate QR codes on mount
  useEffect(() => {
    const baseUrl = window.location.origin;
    
    // Room Service QR Code - Links to public menu with room type
    const roomOrderUrl = `${baseUrl}/menu?type=room`;
    
    // Café/Restaurant QR Code - Links to public menu with restaurant type
    const cafeOrderUrl = `${baseUrl}/menu?type=restaurant`;
    
    // Generate Room QR Code
    if (roomQRRef.current) {
      QRCodeGenerator.toCanvas(
        roomQRRef.current,
        roomOrderUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('Room QR generation error:', error);
        }
      );
    }
    
    // Generate Café QR Code
    if (cafeQRRef.current) {
      QRCodeGenerator.toCanvas(
        cafeQRRef.current,
        cafeOrderUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('Café QR generation error:', error);
        }
      );
    }
  }, []);
  
  const downloadQRCode = (canvasRef: React.RefObject<HTMLCanvasElement>, filename: string) => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "QR Code Downloaded",
        description: `${filename} has been saved to your downloads`,
      });
    });
  };
  
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Codes</h1>
        <p className="text-muted-foreground">
          Download QR codes for guest ordering. Print and place them in rooms or at café tables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Service QR Code */}
        <Card data-testid="card-room-qr">
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <CardTitle>Room Service QR</CardTitle>
            </div>
            <CardDescription>
              Guests can scan this to order food to their room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              <canvas ref={roomQRRef} data-testid="canvas-room-qr" />
            </div>
            <Button
              className="w-full"
              onClick={() => downloadQRCode(roomQRRef, 'room-service-qr-code.png')}
              data-testid="button-download-room-qr"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Room Service QR
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Place in guest rooms</p>
              <p>• Guests select their room number</p>
              <p>• Orders automatically linked to room bill</p>
            </div>
          </CardContent>
        </Card>

        {/* Café/Restaurant QR Code */}
        <Card data-testid="card-cafe-qr">
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <CardTitle>Café/Restaurant QR</CardTitle>
            </div>
            <CardDescription>
              Guests can scan this to order at the café or restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center bg-white p-4 rounded-lg border">
              <canvas ref={cafeQRRef} data-testid="canvas-cafe-qr" />
            </div>
            <Button
              className="w-full"
              onClick={() => downloadQRCode(cafeQRRef, 'cafe-restaurant-qr-code.png')}
              data-testid="button-download-cafe-qr"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Café/Restaurant QR
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Place at café tables or counter</p>
              <p>• Guests enter their name and phone</p>
              <p>• Ideal for walk-in customers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">For Room Service:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Download and print the Room Service QR code</li>
              <li>Place it on a card or tent card in each guest room</li>
              <li>When guests scan, they select their room number from a list</li>
              <li>Orders automatically appear in the Kitchen and link to their room bill</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-1">For Café/Restaurant:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Download and print the Café/Restaurant QR code</li>
              <li>Place it on tables or at the ordering counter</li>
              <li>Guests enter their name and phone number</li>
              <li>Orders appear in the Kitchen for walk-in customers</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
