"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  Plus,
  Search,
  RotateCcw,
  MoreVertical,
  Pencil,
  Trash2,
  Filter,
  SlidersHorizontal,
  ImageIcon,
} from "lucide-react";

// Actions
import { deleteSliderById, getSliders } from "@/actions/slider";
import { toast } from "sonner";
import { truncateText } from "@/helpers/multifunction";

const ListSlidersPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sliders, setSliders] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table or grid

  const itemsPerPage = 15;
  const router = useRouter();

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await getSliders({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
      });
      setSliders(response.sliders);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch sliders:", error);
      toast.error("Failed to load sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, [searchQuery, currentPage, sortBy]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("latest");
    setCurrentPage(1);
    setShowFilters(false);
    router.refresh();
  };

  const deleteSlider = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this slider?"
    );

    if (!isConfirmed) return;

    try {
      const result = await deleteSliderById(id);
      if (result.success) {
        toast.success("Slider deleted successfully");
        fetchSliders();
      } else {
        toast.error(result.message || "Failed to delete slider");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-16 w-16 bg-gray-200 rounded mx-auto"></div>
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
      <Card key={`grid-skeleton-${index}`} className="animate-pulse">
        <CardHeader className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-40 bg-gray-200 rounded w-full mb-4"></div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end">
          <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="w-full p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Slider Management</h1>
          <Breadcrumb className="text-sm text-gray-500 mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/slider/list-sliders">
                  Sliders
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
            <SlidersHorizontal size={16} />
            {viewMode === "table" ? "Grid View" : "Table View"}
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
          
          <Link href="/admin/slider/add-slider">
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Slider
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-1 block">Search sliders</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="text-sm font-medium mb-1 block">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
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
                  <th className="text-left p-4 font-medium text-gray-600">Title</th>
                  <th className="text-center p-4 font-medium text-gray-600">Image</th>
                  <th className="text-center p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeletons()
                ) : sliders.length > 0 ? (
                  sliders.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">
                        <div className="font-medium">{item.title}</div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100 text-center">
                        {item.image ? (
                          <div className="relative h-16 w-16 rounded overflow-hidden mx-auto">
                            <Image
                              src={`https://greenglow.in/kauthuk_test/${item.image}`}
                              fill
                              alt={item.title}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center mx-auto">
                            <ImageIcon size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div className="flex justify-center items-center space-x-2">
                          <Button
                            onClick={() => router.push(`/admin/slider/edit-slider/${item.id}`)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                          >
                            <Pencil size={16} />
                          </Button>
                          
                          <Button
                            onClick={() => deleteSlider(item.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <ImageIcon size={48} className="text-gray-300 mb-2" />
                        <p>No sliders found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add a new slider or try changing your search filters
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            renderGridSkeletons()
          ) : sliders.length > 0 ? (
            sliders.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-lg font-semibold">{truncateText(item.title, 30)}</CardTitle>
                </CardHeader>
                
                <CardContent className="p-4">
                  {item.image ? (
                    <div className="relative h-40 w-full rounded overflow-hidden">
                      <Image
                        src={`https://greenglow.in/kauthuk_test/${item.image}`}
                        fill
                        alt={item.title}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon size={36} className="text-gray-300" />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Button
                    onClick={() => router.push(`/admin/slider/edit-slider/${item.id}`)}
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Pencil size={16} className="mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => deleteSlider(item.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-12 flex flex-col items-center justify-center bg-white rounded-lg">
              <ImageIcon size={48} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No sliders found</h3>
              <p className="text-gray-500 mb-4">Add a new slider or try changing your search filters</p>
              <Link href="/admin/slider/add-slider">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Add New Slider</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && sliders.length > 0 && totalPages > 1 && (
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
    </div>
  );
};

export default ListSlidersPage;