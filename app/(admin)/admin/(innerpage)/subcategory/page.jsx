"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Label } from "@/components/ui/label";
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
  DialogClose,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  Layers,
} from "lucide-react";

// Hooks and Utilities
import useFetch from "@/hooks/use-fetch";
import { SubcategorySchema } from "@/lib/validators";
import { cn } from "@/lib/utils";

// Actions
import { getCategories2 } from "@/actions/category";
import {
  createSubcategory,
  deleteSubcategoryById,
  getSubcategories,
  updateSubcategory,
} from "@/actions/subcategory";
import { toast } from "sonner";

const SubcategoryPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryArray, setCategoryArray] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    cat_id: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const itemsPerPage = 15;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(SubcategorySchema),
  });

  const {
    data: subcategory,
    loading: isCreating,
    error: createError,
    fn: createSubcategoryFN,
  } = useFetch(createSubcategory);

  const {
    data: updatedSubcategory,
    loading: isUpdating,
    error: updateError,
    fn: updateSubcategoryFN,
  } = useFetch(updateSubcategory);

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const response = await getSubcategories({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
      });
      setSubcategories(response.subcategories);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await getCategories2();
      setCategoryArray(categories.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, [searchQuery, currentPage, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (subcategory) {
      toast.success("Subcategory created successfully");
      setShowCreateModal(false);
      reset();
      fetchSubcategories();
    }
  }, [subcategory]);

  useEffect(() => {
    if (updatedSubcategory) {
      toast.success("Subcategory updated successfully");
      setShowEditModal(false);
      fetchSubcategories();
    }
  }, [updatedSubcategory]);

  const onSubmitCreate = async (data) => {
    await createSubcategoryFN(data);
  };

  const onSubmitUpdate = async (e) => {
    e.preventDefault();
    await updateSubcategoryFN(formData);
  };

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
      const result = await deleteSubcategoryById(deleteConfirmId);
      if (result.success) {
        toast.success("Subcategory deleted successfully");
        fetchSubcategories();
        setDeleteConfirmId(null);
      } else {
        toast.error(result.message || "Failed to delete subcategory");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  const handleEdit = (item) => {
    setValue("cat_id", item.cat_id);
    setFormData({
      id: item.id,
      title: item.subcategory,
      cat_id: item.cat_id,
    });
    setShowEditModal(true);
  };

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
        <td className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
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
          <h1 className="text-2xl font-bold tracking-tight">Subcategory Management</h1>
          <Breadcrumb className="text-sm text-gray-500 mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/subcategory">
                  Subcategories
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
          
          <Button 
            onClick={() => setShowCreateModal(true)} 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={16} />
            New Subcategory
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/2">
                <label className="text-sm font-medium mb-1 block">Search subcategories</label>
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
                  <th className="text-left p-4 font-medium text-gray-600">Category</th>
                  <th className="text-left p-4 font-medium text-gray-600">Subcategory</th>
                  <th className="text-center p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeletons()
                ) : subcategories.length > 0 ? (
                  subcategories.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">
                        <div className="font-medium">{item.Category?.catName}</div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div>{item.subcategory}</div>
                      </td>
                      
                      <td className="p-4 border-b border-gray-100">
                        <div className="flex justify-center items-center space-x-2">
                          <Button
                            onClick={() => handleEdit(item)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                          >
                            <Pencil size={16} />
                          </Button>
                          
                          <Button
                            onClick={() => setDeleteConfirmId(item.id)}
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
                        <Layers size={48} className="text-gray-300 mb-2" />
                        <p>No subcategories found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add a new subcategory or try changing your search filters
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
          ) : subcategories.length > 0 ? (
            subcategories.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg font-semibold">{item.subcategory}</CardTitle>
                  <CardDescription>
                    In category: {item.Category?.catName}
                  </CardDescription>
                </CardHeader>
                
                <CardFooter className="p-4 pt-4 flex justify-end gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
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
              <Layers size={48} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No subcategories found</h3>
              <p className="text-gray-500 mb-4">Add a new subcategory or try changing your search filters</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add New Subcategory
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && subcategories.length > 0 && totalPages > 1 && (
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

      {/* Create Subcategory Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory under an existing category
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat_id">Parent Category</Label>
              <Controller
                name="cat_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <SelectTrigger className={errors.cat_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryArray.length > 0 ? (
                        categoryArray.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id.toString()}
                          >
                            {cat.catName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cat_id && (
                <p className="text-sm text-red-500">{errors.cat_id.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Subcategory Title</Label>
              <Input
                id="title"
                placeholder="Enter subcategory title"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isCreating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isCreating ? "Creating..." : "Create Subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update the subcategory information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={onSubmitUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cat-id">Parent Category</Label>
              <Controller
                name="cat_id"
                control={control}
                defaultValue={formData.cat_id}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.onChange(Number(val));
                      setFormData({ ...formData, cat_id: Number(val) });
                    }}
                    value={formData.cat_id ? String(formData.cat_id) : undefined}
                  >
                    <SelectTrigger className={errors.cat_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryArray.length > 0 ? (
                        categoryArray.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id.toString()}
                          >
                            {cat.catName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cat_id && (
                <p className="text-sm text-red-500">{errors.cat_id.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-title">Subcategory Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isUpdating ? "Updating..." : "Update Subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subcategory.
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

export default SubcategoryPage;