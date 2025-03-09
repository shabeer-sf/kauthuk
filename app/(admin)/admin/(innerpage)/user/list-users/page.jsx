"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Badge
} from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons
import {
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Filter,
  ListFilter,
  LayoutGrid,
  Users,
  Calendar,
  Eye,
  ChevronRight,
  Mail,
  Phone,
  ShoppingCart,
  User,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";

// Hooks and Utilities
import { cn } from "@/lib/utils";

// Actions (You'll need to create these)
import { deleteUserById, getUsers } from "@/actions/user";
import { toast } from "sonner";

const ListUsersPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [userDetail, setUserDetail] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const itemsPerPage = 15;
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        status: statusFilter,
      });
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, currentPage, sortBy, statusFilter]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("latest");
    setStatusFilter("all");
    setCurrentPage(1);
    setShowFilters(false);
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const result = await deleteUserById(deleteConfirmId);
      if (result.success) {
        toast.success("User deleted successfully");
        fetchUsers();
        setDeleteConfirmId(null);
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="flex justify-center space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </td>
      </tr>
    ));
  };

  const renderGridSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <Card key={`grid-skeleton-${index}`} className="animate-pulse overflow-hidden">
        <CardHeader className="p-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </CardFooter>
      </Card>
    ));
  };

  // Sample data for demonstration (replace with actual API integration)
  const sampleUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      mobile: "+1 555-123-4567",
      status: "active",
      mobileVerified: "yes",
      createdAt: new Date(2023, 1, 15),
      ordersCount: 5,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      mobile: "+1 555-987-6543",
      status: "active",
      mobileVerified: "yes",
      createdAt: new Date(2023, 2, 20),
      ordersCount: 3,
    },
    {
      id: 3,
      name: "Michael Johnson",
      email: "michael.johnson@example.com",
      mobile: "+1 555-567-8901",
      status: "inactive",
      mobileVerified: "no",
      createdAt: new Date(2023, 3, 10),
      ordersCount: 0,
    },
    {
      id: 4,
      name: "Emily Williams",
      email: "emily.williams@example.com",
      mobile: "+1 555-345-6789",
      status: "active",
      mobileVerified: "yes",
      createdAt: new Date(2023, 4, 5),
      ordersCount: 8,
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@example.com",
      mobile: "+1 555-234-5678",
      status: "inactive",
      mobileVerified: "no",
      createdAt: new Date(2023, 5, 25),
      ordersCount: 2,
    },
  ];

  // Use sample data until API integration
  useEffect(() => {
    // For demonstration, we're using the sample data
    // In production, replace this with actual API call
    setLoading(true);
    setTimeout(() => {
      setUsers(sampleUsers);
      setTotalPages(Math.ceil(sampleUsers.length / itemsPerPage));
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="w-full p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <Breadcrumb className="text-sm text-gray-500 mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/users">
                  Users
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            {viewMode === "table" ? 
              <><LayoutGrid size={16} /> Grid View</> : 
              <><ListFilter size={16} /> Table View</>
            }
          </Button>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            Filters
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
          
         
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-1 block">Search users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="text-sm font-medium mb-1 block">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest Registered</SelectItem>
                    <SelectItem value="oldest">Oldest Registered</SelectItem>
                    <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                    <SelectItem value="most_orders">Most Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {viewMode === "table" ? (
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 font-medium text-gray-600">Name</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-center p-4 font-medium text-gray-600">Mobile</th>
                  <th className="text-center p-4 font-medium text-gray-600">Status</th>
                  <th className="text-center p-4 font-medium text-gray-600">Registered On</th>
                  <th className="text-center p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeletons()
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">
                        <div className="font-medium">{user.name}</div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          {user.mobile || "Not provided"}
                          {user.mobile && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {user.mobileVerified === "yes" ? (
                                    <CheckCircle2 size={14} className="text-green-500" />
                                  ) : (
                                    <XCircle size={14} className="text-red-500" />
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {user.mobileVerified === "yes" ? "Verified" : "Not Verified"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100 text-center">
                        <Badge
                          variant={user.status === "active" ? "success" : "destructive"}
                          className={cn(
                            "capitalize",
                            user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                          )}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar size={14} className="text-gray-500" />
                          {format(user.createdAt, "MMM dd, yyyy")}
                        </div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div className="flex justify-center items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => setUserDetail(user)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                >
                                  <Eye size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => setDeleteConfirmId(user.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users size={48} className="text-gray-300 mb-2" />
                        <p>No users found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try changing your search filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            renderGridSkeletons()
          ) : users.length > 0 ? (
            users.map((user) => (
              <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2 text-center">
                  <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                    <User size={32} className="text-gray-500" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{user.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-1 text-sm">
                    <Badge
                      variant={user.status === "active" ? "success" : "destructive"}
                      className={cn(
                        "capitalize",
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                      )}
                    >
                      {user.status}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">{user.mobile || "Not provided"}</span>
                    {user.mobile && (
                      user.mobileVerified === "yes" ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      Joined {format(user.createdAt, "MMM dd, yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5">
                    <ShoppingCart size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      {user.ordersCount} {user.ordersCount === 1 ? "order" : "orders"}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-center gap-2">
                  <Button
                    onClick={() => setUserDetail(user)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye size={16} className="mr-1" />
                    Details
                  </Button>
                  
                  
                  
                  <Button
                    onClick={() => setDeleteConfirmId(user.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-12 flex flex-col items-center justify-center bg-white rounded-lg">
              <Users size={48} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No users found</h3>
              <p className="text-gray-500 mb-4">Try changing your search filters</p>
              
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={!!userDetail} onOpenChange={(open) => !open && setUserDetail(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Profile</DialogTitle>
            <DialogDescription>
              User ID: {userDetail?.id}
            </DialogDescription>
          </DialogHeader>
          
          {userDetail && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1">{userDetail.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="mt-1">{userDetail.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                      <p className="mt-1 flex items-center gap-1">
                        {userDetail.mobile || "Not provided"}
                        {userDetail.mobile && (
                          userDetail.mobileVerified === "yes" ? (
                            <CheckCircle2 size={14} className="text-green-500" />
                          ) : (
                            <XCircle size={14} className="text-red-500" />
                          )
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                      <p className="mt-1">
                        <Badge
                          variant={userDetail.status === "active" ? "success" : "destructive"}
                          className={cn(
                            "capitalize",
                            userDetail.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                          )}
                        >
                          {userDetail.status}
                        </Badge>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                      <p className="mt-1">{format(userDetail.createdAt, "MMMM dd, yyyy")}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                      <p className="mt-1">{userDetail.ordersCount} orders placed</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => router.push(`/admin/users/edit-user/${userDetail.id}`)}
                    variant="outline"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Pencil size={16} className="mr-1" />
                    Edit User
                  </Button>
                  {userDetail.status === "active" ? (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle size={16} className="mr-1" />
                      Deactivate Account
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle2 size={16} className="mr-1" />
                      Activate Account
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="addresses" className="mt-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Delivery Addresses</h3>
                  
                  {/* For demo purposes - replace with actual user addresses */}
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{userDetail.name}</p>
                            <p className="text-sm text-gray-600">123 Main Street</p>
                            <p className="text-sm text-gray-600">Apt 4B</p>
                            <p className="text-sm text-gray-600">New York, NY 10001</p>
                            <p className="text-sm text-gray-600">{userDetail.mobile}</p>
                          </div>
                          <Badge className="h-fit">Default</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <h3 className="font-medium mb-3 mt-6">Billing Addresses</h3>
                  
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{userDetail.name}</p>
                            <p className="text-sm text-gray-600">123 Main Street</p>
                            <p className="text-sm text-gray-600">Apt 4B</p>
                            <p className="text-sm text-gray-600">New York, NY 10001</p>
                            <p className="text-sm text-gray-600">{userDetail.mobile}</p>
                          </div>
                          <Badge className="h-fit">Default</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Recent Orders</h3>
                  
                  {/* For demo purposes - replace with actual order data */}
                  {userDetail.ordersCount > 0 ? (
                    <div className="space-y-3">
                      {Array(Math.min(3, userDetail.ordersCount)).fill(0).map((_, index) => (
                        <Card key={`order-${index}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <ClipboardList size={16} className="text-gray-500" />
                                <span className="font-medium">Order #{1000 + index}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  index === 0 ? "bg-green-100 text-green-800 border-green-200" : 
                                  index === 1 ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                  "bg-gray-100 text-gray-800 border-gray-200"
                                )}
                              >
                                {index === 0 ? "Delivered" : index === 1 ? "Shipped" : "Processing"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">Date</p>
                                <p>{format(new Date(2023, 5 - index, 15), "MMM dd, yyyy")}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total</p>
                                <p>${(99.99 - (index * 10)).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Payment</p>
                                <p>{index === 0 ? "Credit Card" : index === 1 ? "PayPal" : "COD"}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Items</p>
                                <p>{3 - index} items</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2" />
                      <p>No orders yet</p>
                    </div>
                  )}
                  
                  {userDetail.ordersCount > 3 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="link"
                        className="text-indigo-600"
                        onClick={() => router.push(`/admin/orders?user=${userDetail.id}`)}
                      >
                        View all {userDetail.ordersCount} orders
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setUserDetail(null)}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListUsersPage; 