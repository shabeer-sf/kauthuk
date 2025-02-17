"use client"
import React, { useState } from 'react';
import { 
  User, Package, LayoutDashboard, ChevronRight, 
  MapPin, Edit, LogOut, Camera, Mail, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample user data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.pexels.com/photos/1498332/pexels-photo-1498332.jpeg",
    address: "123 Main St, New York, NY 10001",
    memberSince: "January 2024"
  };

  // Sample orders data
  const orders = [
    {
      id: "ORD-2024-001",
      date: "Feb 15, 2024",
      status: "Delivered",
      total: 299.99,
      items: 3
    },
    {
      id: "ORD-2024-002",
      date: "Feb 10, 2024",
      status: "In Transit",
      total: 199.99,
      items: 2
    },
    {
      id: "ORD-2024-003",
      date: "Feb 5, 2024",
      status: "Processing",
      total: 499.99,
      items: 4
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'bg-green-100 text-green-800',
      'In Transit': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-20 h-20 rounded-full border-2 border-white"
                />
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <p className="text-gray-300">Member since {userData.memberSince}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500">Active Orders</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status !== 'Delivered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 2).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const OrdersView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Ordered on {order.date} • {order.items} items
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <p className="font-semibold">${order.total}</p>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ProfileView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full border-4 border-gray-100"
                  />
                  <Button 
                    size="sm" 
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
                      defaultValue={userData.name}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
                      defaultValue={userData.email}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
                      defaultValue={userData.phone}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2"
                      defaultValue={userData.address}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          Your information is securely stored and will never be shared with third parties.
        </AlertDescription>
      </Alert>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Edit Profile', icon: Edit }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                {tabs.map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 mb-2 ${
                      activeTab === tab.id ? 'bg-gray-900 text-white' : ''
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
                <Separator className="my-4" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'orders' && <OrdersView />}
            {activeTab === 'profile' && <ProfileView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;