import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  DollarSign, 
  Globe,
  Save,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string | null;
  support_email: string | null;
  support_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  currency: string | null;
  currency_symbol: string | null;
  delivery_charge: number | null;
  free_shipping_threshold: number | null;
  meta_title: string | null;
  meta_description: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  } | null;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data as StoreSettings | null;
    },
  });

  // Initialize form when settings load
  useState(() => {
    if (settings) {
      setFormData(settings);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      if (settings?.id) {
        // Update existing settings
        const { error } = await supabase
          .from("store_settings")
          .update(data)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("store_settings")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast({
        title: "Settings saved",
        description: "Store settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const updateField = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        [platform]: value,
      },
    }));
  };

  // Populate form when settings load
  if (settings && Object.keys(formData).length === 0) {
    setFormData(settings);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your store configuration and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              General Information
            </CardTitle>
            <CardDescription>
              Basic information about your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name *</Label>
                <Input
                  id="store_name"
                  value={formData.store_name || ""}
                  onChange={(e) => updateField("store_name", e.target.value)}
                  placeholder="Your Store Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline || ""}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="Your store tagline"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency Code</Label>
                <Input
                  id="currency"
                  value={formData.currency || ""}
                  onChange={(e) => updateField("currency", e.target.value)}
                  placeholder="INR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Input
                  id="currency_symbol"
                  value={formData.currency_symbol || ""}
                  onChange={(e) => updateField("currency_symbol", e.target.value)}
                  placeholder="₹"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How customers can reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="support_email"
                    type="email"
                    value={formData.support_email || ""}
                    onChange={(e) => updateField("support_email", e.target.value)}
                    placeholder="support@yourstore.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_phone">Support Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="support_phone"
                    value={formData.support_phone || ""}
                    onChange={(e) => updateField("support_phone", e.target.value)}
                    placeholder="+91 1234 567 890"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number || ""}
                  onChange={(e) => updateField("whatsapp_number", e.target.value)}
                  placeholder="+91 9876543210"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This number powers the floating WhatsApp chat button on your store. Include country code.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Store Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Your store address"
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Settings
            </CardTitle>
            <CardDescription>
              Configure delivery charges and free shipping threshold
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery_charge">Delivery Charge ({formData.currency_symbol || "₹"})</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="delivery_charge"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.delivery_charge || ""}
                    onChange={(e) => updateField("delivery_charge", parseFloat(e.target.value) || 0)}
                    placeholder="49"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="free_shipping_threshold">Free Shipping Above ({formData.currency_symbol || "₹"})</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.free_shipping_threshold || ""}
                    onChange={(e) => updateField("free_shipping_threshold", parseFloat(e.target.value) || 0)}
                    placeholder="499"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Orders above this amount qualify for free shipping
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO Settings
            </CardTitle>
            <CardDescription>
              Optimize your store for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title || ""}
                onChange={(e) => updateField("meta_title", e.target.value)}
                placeholder="Your Store - Premium Products"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.meta_title?.length || 0)}/60 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description || ""}
                onChange={(e) => updateField("meta_description", e.target.value)}
                placeholder="Describe your store for search engines..."
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.meta_description?.length || 0)}/160 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Media Links
            </CardTitle>
            <CardDescription>
              Connect your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    value={(formData.social_links as any)?.facebook || ""}
                    onChange={(e) => updateSocialLink("facebook", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={(formData.social_links as any)?.instagram || ""}
                    onChange={(e) => updateSocialLink("instagram", e.target.value)}
                    placeholder="https://instagram.com/yourpage"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={(formData.social_links as any)?.twitter || ""}
                    onChange={(e) => updateSocialLink("twitter", e.target.value)}
                    placeholder="https://twitter.com/yourpage"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtube"
                    value={(formData.social_links as any)?.youtube || ""}
                    onChange={(e) => updateSocialLink("youtube", e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
