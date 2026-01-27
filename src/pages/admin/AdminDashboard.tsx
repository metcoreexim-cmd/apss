import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type DateRange = "7d" | "30d" | "90d";

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const getDaysFromRange = (range: DateRange) => {
    switch (range) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
    }
  };

  // Fetch comprehensive stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats", dateRange],
    queryFn: async () => {
      const days = getDaysFromRange(dateRange);
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const previousStartDate = startOfDay(subDays(new Date(), days * 2)).toISOString();
      const previousEndDate = startOfDay(subDays(new Date(), days)).toISOString();

      // Current period orders
      const { data: currentOrders } = await supabase
        .from("orders")
        .select("id, grand_total, created_at")
        .gte("created_at", startDate);

      // Previous period orders for comparison
      const { data: previousOrders } = await supabase
        .from("orders")
        .select("id, grand_total")
        .gte("created_at", previousStartDate)
        .lt("created_at", previousEndDate);

      // All products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("id", { count: "exact" });

      // Unique customers (from orders)
      const { data: customerData } = await supabase
        .from("orders")
        .select("user_id")
        .gte("created_at", startDate);

      const uniqueCustomers = new Set(customerData?.map(o => o.user_id).filter(Boolean)).size;

      const currentRevenue = currentOrders?.reduce((sum, o) => sum + Number(o.grand_total), 0) || 0;
      const previousRevenue = previousOrders?.reduce((sum, o) => sum + Number(o.grand_total), 0) || 0;
      const currentOrderCount = currentOrders?.length || 0;
      const previousOrderCount = previousOrders?.length || 0;

      const revenueChange = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
        : "0";
      const orderChange = previousOrderCount > 0
        ? ((currentOrderCount - previousOrderCount) / previousOrderCount * 100).toFixed(1)
        : "0";

      const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

      return {
        products: productsCount || 0,
        orders: currentOrderCount,
        revenue: currentRevenue,
        customers: uniqueCustomers,
        avgOrderValue,
        revenueChange: parseFloat(revenueChange),
        orderChange: parseFloat(orderChange),
      };
    },
  });

  // Fetch revenue trend data
  const { data: revenueTrend = [] } = useQuery({
    queryKey: ["admin-revenue-trend", dateRange],
    queryFn: async () => {
      const days = getDaysFromRange(dateRange);
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();

      const { data: orders } = await supabase
        .from("orders")
        .select("grand_total, created_at")
        .gte("created_at", startDate)
        .order("created_at", { ascending: true });

      // Group by date
      const grouped: Record<string, number> = {};
      orders?.forEach((order) => {
        const date = format(new Date(order.created_at), "MMM dd");
        grouped[date] = (grouped[date] || 0) + Number(order.grand_total);
      });

      // Fill in missing dates
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "MMM dd");
        result.push({
          date,
          revenue: grouped[date] || 0,
        });
      }

      return result;
    },
  });

  // Fetch order status distribution
  const { data: orderStatusData = [] } = useQuery({
    queryKey: ["admin-order-status", dateRange],
    queryFn: async () => {
      const days = getDaysFromRange(dateRange);
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();

      const { data: orders } = await supabase
        .from("orders")
        .select("order_status")
        .gte("created_at", startDate);

      const statusCount: Record<string, number> = {};
      orders?.forEach((order) => {
        statusCount[order.order_status] = (statusCount[order.order_status] || 0) + 1;
      });

      return Object.entries(statusCount).map(([status, count]) => ({
        name: status.replace("_", " "),
        value: count,
      }));
    },
  });

  // Fetch top selling products
  const { data: topProducts = [] } = useQuery({
    queryKey: ["admin-top-products", dateRange],
    queryFn: async () => {
      const days = getDaysFromRange(dateRange);
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();

      const { data: orders } = await supabase
        .from("orders")
        .select("items")
        .gte("created_at", startDate);

      // Aggregate product sales
      const productSales: Record<string, { title: string; quantity: number; revenue: number }> = {};

      orders?.forEach((order) => {
        const items = order.items as any[];
        items?.forEach((item) => {
          if (!productSales[item.id]) {
            productSales[item.id] = { title: item.title, quantity: 0, revenue: 0 };
          }
          productSales[item.id].quantity += item.quantity || 1;
          productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1);
        });
      });

      return Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });

  // Fetch recent orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: stats?.revenueChange || 0,
      changeLabel: "vs previous period",
    },
    {
      title: "Total Orders",
      value: stats?.orders || 0,
      icon: ShoppingCart,
      change: stats?.orderChange || 0,
      changeLabel: "vs previous period",
    },
    {
      title: "Avg. Order Value",
      value: `₹${Math.round(stats?.avgOrderValue || 0).toLocaleString()}`,
      icon: TrendingUp,
      change: 0,
      changeLabel: "per order",
    },
    {
      title: "Customers",
      value: stats?.customers || 0,
      icon: Users,
      change: 0,
      changeLabel: "unique buyers",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      out_for_delivery: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      returned: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground">Track your store performance</p>
        </div>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.change !== 0 && (
                  <>
                    {stat.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={stat.change > 0 ? "text-green-600" : "text-red-600"}>
                      {stat.change > 0 ? "+" : ""}{stat.change}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No order data
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {orderStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="capitalize">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis 
                      type="number" 
                      fontSize={12}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="title" 
                      fontSize={12}
                      width={120}
                      tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + "..." : value}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.order_status)}>
                        {order.order_status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{Number(order.grand_total).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
