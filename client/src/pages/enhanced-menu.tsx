import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, UtensilsCrossed, Eye, Upload, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type MenuCategory, type MenuItem } from "@shared/schema";

export default function EnhancedMenu() {
  const [selectedProperty, setSelectedProperty] = useState<number>(0);
  const { toast } = useToast();

  const { data: properties } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/menu-categories"],
  });

  const { data: menuItems, isLoading: itemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  // Filter categories and items by property
  const filteredCategories = categories?.filter(
    (cat) => selectedProperty === 0 || cat.propertyId === selectedProperty
  );

  const filteredItems = menuItems?.filter(
    (item) => selectedProperty === 0 || item.propertyId === selectedProperty
  );

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="p-4 md:p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary/90 backdrop-blur-sm text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold font-serif" data-testid="heading-menu">
            my RASOI
          </h1>
          <UtensilsCrossed className="h-6 w-6" />
        </div>
      </div>

      {/* Property Filter */}
      {properties && properties.length > 1 && (
        <div className="p-4 bg-muted/30">
          <select
            className="w-full px-4 py-2 rounded-md border bg-background"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(parseInt(e.target.value))}
            data-testid="select-property-filter"
          >
            <option value={0}>All Properties</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 space-y-3 max-w-7xl mx-auto">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => toast({ title: "Category management coming soon" })}
          data-testid="button-add-menu"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu +
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => toast({ title: "Arrange menu coming soon" })}
            data-testid="button-arrange-menu"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Arrange Menu
          </Button>
          <Button
            variant="outline"
            onClick={() => toast({ title: "Excel upload coming soon" })}
            data-testid="button-upload-excel"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Button>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories?.map((category) => {
            const categoryItems = filteredItems?.filter(
              (item) => item.categoryId === category.id
            );
            const itemCount = categoryItems?.length || 0;

            return (
              <Card
                key={category.id}
                className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`card-category-${category.id}`}
              >
                <div className="relative aspect-[4/3]">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.startTime && category.endTime && (
                      <p className="text-xs opacity-90">
                        {category.startTime} - {category.endTime}
                      </p>
                    )}
                    <p className="text-xs opacity-75 mt-1">{itemCount} items</p>
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast({ title: "Edit category coming soon" });
                    }}
                    data-testid={`button-edit-category-${category.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}

          {/* Add New Category Card */}
          <Card
            className="overflow-hidden border-dashed border-2 hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => toast({ title: "Add category coming soon" })}
            data-testid="card-add-category"
          >
            <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Plus className="h-12 w-12" />
              <span className="text-sm font-medium">Add Category</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Empty State */}
      {(!filteredCategories || filteredCategories.length === 0) && (
        <div className="p-12 text-center">
          <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first category to start building your menu
          </p>
          <Button
            onClick={() => toast({ title: "Add category coming soon" })}
            data-testid="button-empty-add-category"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Category
          </Button>
        </div>
      )}

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full max-w-7xl mx-auto bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => toast({ title: "Customer preview coming soon" })}
          data-testid="button-view-as-customer"
        >
          <Eye className="h-4 w-4 mr-2" />
          View your menu as a customer
        </Button>
      </div>
    </div>
  );
}
