import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const Dashboard = () => {
  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color,
  }) => {
    const isPositive = trend > 0;

    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center pt-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.abs(trend)}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {description}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "from last month",
      icon: DollarSign,
      trend: 20.1,
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: "2,350",
      description: "from last week",
      icon: Users,
      trend: -8.1,
      color: "bg-purple-500",
    },
    {
      title: "Sales",
      value: "12,234",
      description: "from last quarter",
      icon: ShoppingCart,
      trend: 12.2,
      color: "bg-green-500",
    },
    {
      title: "Conversions",
      value: "3.42%",
      description: "from yesterday",
      icon: BarChart3,
      trend: 4.1,
      color: "bg-orange-500",
    },
  ];
  return (
    <div className="w-full p-2 space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
