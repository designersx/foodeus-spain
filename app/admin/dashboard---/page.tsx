"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Bar,
  Area
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, TrendingUp, Users, Utensils } from "lucide-react"

// Sample data for charts
const revenueData = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 6100 },
  { month: "Apr", revenue: 5800 },
  { month: "May", revenue: 7200 },
  { month: "Jun", revenue: 8100 },
  { month: "Jul", revenue: 7900 },
  { month: "Aug", revenue: 8700 },
  { month: "Sep", revenue: 9200 },
  { month: "Oct", revenue: 8800 },
  { month: "Nov", revenue: 9600 },
  { month: "Dec", revenue: 10500 },
]

const visitsData = [
  { month: "Jan", visits: 1200 },
  { month: "Feb", visits: 1400 },
  { month: "Mar", visits: 1800 },
  { month: "Apr", visits: 1600 },
  { month: "May", visits: 2100 },
  { month: "Jun", visits: 2400 },
  { month: "Jul", visits: 2200 },
  { month: "Aug", visits: 2600 },
  { month: "Sep", visits: 2800 },
  { month: "Oct", visits: 2500 },
  { month: "Nov", visits: 2900 },
  { month: "Dec", visits: 3200 },
]

const popularCuisines = [
  { cuisine: "Italian", count: 320 },
  { cuisine: "Mexican", count: 280 },
  { cuisine: "Japanese", count: 250 },
  { cuisine: "Indian", count: 220 },
  { cuisine: "Thai", count: 180 },
  { cuisine: "Chinese", count: 160 },
  { cuisine: "American", count: 150 },
]

export default function DashboardPage() {
  return (
    <div className="full-width-container space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your restaurant platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,549</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">+4.3% from last hour</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-initial">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-initial">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 sm:flex-initial">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4 w-full">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full">
            <Card className="col-span-4 w-full">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3 w-full">
              <CardHeader>
                <CardTitle>Popular Cuisines</CardTitle>
                <CardDescription>Most viewed cuisine types</CardDescription>
              </CardHeader>
              <CardContent className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Website Visits</CardTitle>
              <CardDescription>Monthly visits for the current year</CardDescription>
            </CardHeader>
            <CardContent className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularCuisines}>
              <XAxis dataKey="cuisine" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4 w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Report functionality will be implemented in the next phase.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

