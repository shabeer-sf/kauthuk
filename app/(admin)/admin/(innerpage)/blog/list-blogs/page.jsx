"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import MDEditor from "@uiw/react-md-editor";

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
  BookOpen,
  Calendar,
  Eye,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

// Hooks and Utilities
import useFetch from "@/hooks/use-fetch";
import { truncateText } from "@/helpers/multifunction";
import { cn } from "@/lib/utils";

// Actions
import { deleteBlogById, getBlogs } from "@/actions/blog";
import { toast } from "sonner";

const ListBlogsPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [previewBlog, setPreviewBlog] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const itemsPerPage = 15;
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await getBlogs({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
      });
      setBlogs(response.blogs);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, currentPage, sortBy]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("latest");
    setCurrentPage(1);
    setShowFilters(false);
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const result = await deleteBlogById(deleteConfirmId);
      if (result.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs();
        setDeleteConfirmId(null);
      } else {
        toast.error(result.message || "Failed to delete blog");
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
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-16 w-16 bg-gray-200 rounded mx-auto"></div>
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
        <div className="w-full h-48 bg-gray-200"></div>
        <CardHeader className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
          <Breadcrumb className="text-sm text-gray-500 mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/blog/list-blogs">
                  Blogs
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
          
          <Link href="/admin/blog/add-blog">
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Blog
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
                <label className="text-sm font-medium mb-1 block">Search blogs</label>
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
                  <th className="text-left p-4 font-medium text-gray-600">Description</th>
                  <th className="text-center p-4 font-medium text-gray-600">Image</th>
                  <th className="text-center p-4 font-medium text-gray-600">Date</th>
                  <th className="text-center p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeletons()
                ) : blogs.length > 0 ? (
                  blogs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">
                        <div className="font-medium">{item.title}</div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <div>{truncateText(item.description)}</div>
                          <Button
                            onClick={() => setPreviewBlog(item)}
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 p-0 h-auto mt-1"
                          >
                            <Eye size={14} className="mr-1" />
                            <span className="text-xs">View full content</span>
                          </Button>
                        </div>
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
                      
                      <td className="p-4 border-b border-gray-100 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar size={14} className="text-gray-500" />
                          {format(item.date, "LLL dd, y")}
                        </div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div className="flex justify-center items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => router.push(`/admin/blog/edit-blog/${item.id}`)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                >
                                  <Pencil size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => setDeleteConfirmId(item.id)}
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
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <BookOpen size={48} className="text-gray-300 mb-2" />
                        <p>No blogs found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add a new blog or try changing your search filters
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
          ) : blogs.length > 0 ? (
            blogs.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {/* Blog Image */}
                <div className="relative w-full h-48 bg-gray-100">
                  {item.image ? (
                    <Image
                      src={`https://greenglow.in/kauthuk_test/${item.image}`}
                      fill
                      alt={item.title}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-300" />
                    </div>
                  )}
                </div>
                
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <Calendar size={14} />
                    {format(item.date, "LLL dd, y")}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <p className="text-gray-600 text-sm">
                    {truncateText(item.description, 120)}
                  </p>
                  <Button
                    onClick={() => setPreviewBlog(item)}
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-800 p-0 h-auto mt-2"
                  >
                    <Eye size={14} className="mr-1" />
                    <span className="text-xs">Read more</span>
                  </Button>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button
                    onClick={() => router.push(`/admin/blog/edit-blog/${item.id}`)}
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Pencil size={16} className="mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => setDeleteConfirmId(item.id)}
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
              <BookOpen size={48} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No blogs found</h3>
              <p className="text-gray-500 mb-4">Add a new blog post or try changing your search filters</p>
              <Link href="/admin/blog/add-blog">
                <Button className="bg-indigo-600 hover:bg-indigo-700">Create New Blog</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && blogs.length > 0 && totalPages > 1 && (
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

      {/* Blog Preview Dialog */}
      <Dialog open={!!previewBlog} onOpenChange={(open) => !open && setPreviewBlog(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewBlog?.title || "Blog Preview"}</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <Calendar size={14} />
              {previewBlog?.date && format(previewBlog.date, "LLLL dd, yyyy")}
            </DialogDescription>
          </DialogHeader>
          
          {previewBlog?.image && (
            <div className="relative w-full h-56 my-2 overflow-hidden rounded">
              <Image
                src={`https://greenglow.in/kauthuk_test/${previewBlog.image}`}
                fill
                alt={previewBlog.title}
                className="object-cover"
              />
            </div>
          )}
          
          <div className="markdown-preview">
            <MDEditor.Markdown
              source={previewBlog?.description || ""}
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setPreviewBlog(null)}
              variant="outline"
            >
              Close
            </Button>
            {previewBlog && (
              <Button 
                onClick={() => {
                  router.push(`/admin/blog/edit-blog/${previewBlog.id}`);
                  setPreviewBlog(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Edit This Blog
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
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

export default ListBlogsPage;