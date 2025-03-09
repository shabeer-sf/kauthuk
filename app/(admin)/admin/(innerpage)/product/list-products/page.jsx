"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  Package,
  Calendar,
  Eye,
  ImageIcon,
  Tag,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  Truck,
  IndianRupee,
  DollarSign,
  PackageOpen,
} from "lucide-react";

// Helpers
import { truncateText } from "@/helpers/multifunction";
import { cn } from "@/lib/utils";

// Actions
import { deleteProductById, getProducts } from "@/actions/product";
import { toast } from "sonner";
import { getCategories2 } from "@/actions/category";

const ListProductsPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [previewProduct, setPreviewProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [categories, setCategories] = useState([]);

  const itemsPerPage = 10;
  const router = useRouter();

  // Fetch categories for filters
  const fetchCategories = async () => {
    try {
      const response = await getCategories2();

      console.log("response", response.categories);
      setCategories(response.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        category: categoryFilter === "all" ? "" : categoryFilter,
        subcategory: subcategoryFilter === "all" ? "" : subcategoryFilter,
        status: statusFilter === "all" ? "" : statusFilter,
      });
      setProducts(response.products || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  
  // And update your handleReset function:
 
  

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    searchQuery,
    currentPage,
    sortBy,
    categoryFilter,
    subcategoryFilter,
    statusFilter,
  ]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("latest");
    setCategoryFilter("all");
    setSubcategoryFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
    setShowFilters(false);
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const result = await deleteProductById(deleteConfirmId);
      if (result.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
        setDeleteConfirmId(null);
      } else {
        toast.error(result.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <tr key={`skeleton-${index}`} className="animate-pulse">
          <td className="p-4 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="p-4 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="p-4 border-b border-gray-100">
            <div className="h-16 w-16 bg-gray-200 rounded mx-auto"></div>
          </td>
          <td className="p-4 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </td>
          <td className="p-4 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </td>
          <td className="p-4 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
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
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <Card
          key={`grid-skeleton-${index}`}
          className="animate-pulse overflow-hidden"
        >
          <div className="w-full h-48 bg-gray-200"></div>
          <CardHeader className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex justify-between mt-2">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-end">
            <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </CardFooter>
        </Card>
      ));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="w-full p-4 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Product Management
          </h1>
          <Breadcrumb className="text-sm text-gray-500 mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/products/list-products">
                  Products
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
            {viewMode === "table" ? (
              <>
                <LayoutGrid size={16} /> Grid View
              </>
            ) : (
              <>
                <ListFilter size={16} /> Table View
              </>
            )}
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

          <Link href="/admin/product/add-product">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Search products
                </label>
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

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.catName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="All Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </SelectContent>
</Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
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
                  <th className="text-left p-4 font-medium text-gray-600">
                    Product
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Image
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Price (₹)
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Stock
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeletons()
                ) : products.length > 0 ? (
                  products.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 border-b border-gray-100">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.hasVariants && (
                            <span className="flex items-center gap-1">
                              <Layers size={12} />
                              {item.ProductVariants?.length || 0} variants
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 border-b border-gray-100">
                        <div className="flex flex-col">
                          <span>{item.SubCategory?.Category?.catName}</span>
                          <span className="text-xs text-gray-500">
                            {item.SubCategory?.subcategory}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 border-b border-gray-100 text-center">
                        {item.ProductImages && item.ProductImages.length > 0 ? (
                          <div className="relative h-16 w-16 rounded overflow-hidden mx-auto">
                            <Image
                              src={`https://greenglow.in/kauthuk_test/${item.ProductImages[0].image_path}`}
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

                      <td className="p-4 border-b border-gray-100 text-center">
                        <div className="flex items-center justify-center text-gray-900 font-medium">
                          <IndianRupee size={14} className="mr-1" />
                          {formatPrice(item.price_rupees)}
                        </div>
                        <div className="flex items-center justify-center text-xs text-gray-500 mt-1">
                          <DollarSign size={10} className="mr-0.5" />
                          {formatPrice(item.price_dollars)}
                        </div>
                      </td>

                      <td className="p-4 border-b border-gray-100 text-center">
                        <div className="font-medium">{item.stock_count}</div>
                        <div className="text-xs mt-1">
                          {item.stock_status === "yes" ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              In Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="p-4 border-b border-gray-100 text-center">
                        {item.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-800"
                          >
                            Inactive
                          </Badge>
                        )}
                      </td>

                      <td className="p-4 border-b border-gray-100">
                        <div className="flex justify-center items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => setPreviewProduct(item)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                >
                                  <Eye size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    router.push(
                                      `/admin/products/edit-product/${item.id}`
                                    )
                                  }
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
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={48} className="text-gray-300 mb-2" />
                        <p>No products found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add a new product or try changing your search filters
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
          ) : products.length > 0 ? (
            products.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-full h-48 bg-gray-100">
                  {item.ProductImages && item.ProductImages.length > 0 ? (
                    <Image
                      src={`https://greenglow.in/kauthuk_test/${item.ProductImages[0].image_path}`}
                      fill
                      alt={item.title}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-300" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    {item.status === "active" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                      {item.title}
                    </CardTitle>
                    {item.hasVariants && (
                      <Badge variant="outline" className="ml-2">
                        <Layers size={12} className="mr-1" />
                        {item.ProductVariants?.length || 0} variants
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1 text-sm">
                    <Tag size={14} />
                    {item.SubCategory?.Category?.catName} &gt;{" "}
                    {item.SubCategory?.subcategory}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <p className="text-gray-600 text-sm mb-3">
                    {truncateText(item.description, 80)}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <IndianRupee size={14} className="text-gray-700" />
                      <span className="font-medium text-gray-900">
                        {formatPrice(item.price_rupees)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      {item.stock_status === "yes" ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 size={12} className="mr-1" />
                          In Stock ({item.stock_count})
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          <XCircle size={12} className="mr-1" />
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    {item.free_shipping === "yes" && (
                      <span className="flex items-center">
                        <Truck size={12} className="mr-1" />
                        Free Shipping
                      </span>
                    )}
                    {item.cod === "yes" && (
                      <span className="flex items-center">
                        <ShoppingCart size={12} className="mr-1" />
                        COD Available
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button
                    onClick={() => setPreviewProduct(item)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        router.push(`/admin/products/edit-product/${item.id}`)
                      }
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
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-12 flex flex-col items-center justify-center bg-white rounded-lg">
              <Package size={48} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                Add a new product or try changing your search filters
              </p>
              <Link href="/admin/product/add-product">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Create New Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Product Preview Dialog */}
      <Dialog
        open={!!previewProduct}
        onOpenChange={(open) => !open && setPreviewProduct(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewProduct?.title || "Product Preview"}</span>
              {previewProduct?.status === "active" ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center">
                <Tag size={12} className="mr-1" />
                {previewProduct?.SubCategory?.Category?.catName} &gt;{" "}
                {previewProduct?.SubCategory?.subcategory}
              </Badge>
              {previewProduct?.hasVariants && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 flex items-center"
                >
                  <Layers size={12} className="mr-1" />
                  Has Variants
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Product Images Gallery */}
          {previewProduct?.ProductImages &&
            previewProduct.ProductImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 my-3">
                {previewProduct.ProductImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={cn(
                      "relative rounded overflow-hidden border border-gray-200",
                      index === 0 ? "col-span-4 h-56" : "h-24"
                    )}
                  >
                    <Image
                      src={`https://greenglow.in/kauthuk_test/${image.image_path}`}
                      fill
                      alt={`Product image ${index + 1}`}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Price Information
              </h3>
              <div className="mt-1 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">
                    {previewProduct?.base_price} ₹
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price (₹):</span>
                  <span className="font-medium">
                    {previewProduct?.price_rupees} ₹
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ($):</span>
                  <span className="font-medium">
                    ${previewProduct?.price_dollars}
                  </span>
                </div>
                {previewProduct?.tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{previewProduct.tax}%</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Inventory Information
              </h3>
              <div className="mt-1 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className="font-medium">
                    {previewProduct?.stock_count} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock Status:</span>
                  <span className="font-medium">
                    {previewProduct?.stock_status === "yes" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        In Stock
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        Out of Stock
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity Limit:</span>
                  <span className="font-medium">
                    {previewProduct?.quantity_limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HSN Code:</span>
                  <span className="font-medium">
                    {previewProduct?.hsn_code || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-medium text-gray-500">
              Shipping Information
            </h3>
            <div className="mt-1 flex gap-4">
              <div className="flex items-center">
                <Truck size={16} className="text-gray-400 mr-2" />
                <span>
                  {previewProduct?.free_shipping === "yes"
                    ? "Free Shipping"
                    : "Paid Shipping"}
                </span>
              </div>
              <div className="flex items-center">
                <ShoppingCart size={16} className="text-gray-400 mr-2" />
                <span>
                  {previewProduct?.cod === "yes" ? "COD Available" : "No COD"}
                </span>
              </div>
              {previewProduct?.weight && (
                <div className="flex items-center">
                  <PackageOpen size={16} className="text-gray-400 mr-2" />
                  <span>Weight: {previewProduct.weight} kg</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <div className="mt-1 text-gray-700 border p-3 rounded-md bg-gray-50 max-h-40 overflow-y-auto">
              {previewProduct?.description}
            </div>
          </div>

          {/* Product Attributes */}
          {previewProduct?.ProductAttributes &&
            previewProduct.ProductAttributes.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-500">
                  Product Attributes
                </h3>
                <Accordion type="single" collapsible className="mt-1">
                  <AccordionItem value="attributes">
                    <AccordionTrigger className="text-sm">
                      View All Attributes
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {previewProduct.ProductAttributes.map((attr) => (
                          <div key={attr.id} className="border p-2 rounded-md">
                            <div className="font-medium">
                              {attr.Attribute.display_name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {attr.ProductAttributeValues.map((attrValue) => (
                                <div
                                  key={attrValue.id}
                                  className="flex justify-between items-center"
                                >
                                  <span>
                                    {attrValue.AttributeValue.display_value}
                                  </span>
                                  {(attrValue.price_adjustment_rupees ||
                                    attrValue.price_adjustment_dollars) && (
                                    <div className="text-xs text-gray-500">
                                      {attrValue.price_adjustment_rupees &&
                                        `+₹${attrValue.price_adjustment_rupees}`}
                                      {attrValue.price_adjustment_dollars &&
                                        ` / +${attrValue.price_adjustment_dollars}`}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

          {/* Product Variants */}
          {previewProduct?.hasVariants &&
            previewProduct.ProductVariants &&
            previewProduct.ProductVariants.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-500">
                  Product Variants ({previewProduct.ProductVariants.length})
                </h3>
                <Accordion type="single" collapsible className="mt-1">
                  <AccordionItem value="variants">
                    <AccordionTrigger className="text-sm">
                      View All Variants
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {previewProduct.ProductVariants.map((variant) => (
                          <Card key={variant.id} className="p-3 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-3">
                              {/* Variant image if available */}
                              {variant.ProductImages &&
                                variant.ProductImages.length > 0 && (
                                  <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                                    <Image
                                      src={`https://greenglow.in/kauthuk_test/${variant.ProductImages[0].image_path}`}
                                      fill
                                      alt="Variant image"
                                      className="object-cover"
                                    />
                                  </div>
                                )}

                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div className="font-medium">
                                    {variant.is_default && (
                                      <Badge
                                        variant="outline"
                                        className="mr-2 bg-blue-50 text-blue-700 border-blue-200"
                                      >
                                        Default
                                      </Badge>
                                    )}
                                    SKU: {variant.sku}
                                  </div>
                                  <div className="flex items-center">
                                    {variant.stock_status === "yes" ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200"
                                      >
                                        In Stock ({variant.stock_count})
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                      >
                                        Out of Stock
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Price (₹):
                                    </span>
                                    <span className="font-medium">
                                      {variant.price_rupees} ₹
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Price ($):
                                    </span>
                                    <span className="font-medium">
                                      ${variant.price_dollars}
                                    </span>
                                  </div>
                                  {variant.weight && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Weight:
                                      </span>
                                      <span className="font-medium">
                                        {variant.weight} kg
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Variant attributes */}
                                {variant.VariantAttributeValues &&
                                  variant.VariantAttributeValues.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {variant.VariantAttributeValues.map(
                                        (attrValue) => (
                                          <Badge
                                            key={attrValue.id}
                                            variant="outline"
                                            className="bg-gray-50"
                                          >
                                            {
                                              attrValue.AttributeValue.Attribute
                                                .display_name
                                            }
                                            :{" "}
                                            {
                                              attrValue.AttributeValue
                                                .display_value
                                            }
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

          {/* SEO Information */}
          {(previewProduct?.meta_title ||
            previewProduct?.meta_keywords ||
            previewProduct?.meta_description) && (
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-500">
                SEO Information
              </h3>
              <Accordion type="single" collapsible className="mt-1">
                <AccordionItem value="seo">
                  <AccordionTrigger className="text-sm">
                    View SEO Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      {previewProduct?.meta_title && (
                        <div>
                          <span className="font-medium">Meta Title:</span>
                          <p className="mt-1 text-gray-700">
                            {previewProduct.meta_title}
                          </p>
                        </div>
                      )}
                      {previewProduct?.meta_keywords && (
                        <div>
                          <span className="font-medium">Meta Keywords:</span>
                          <p className="mt-1 text-gray-700">
                            {previewProduct.meta_keywords}
                          </p>
                        </div>
                      )}
                      {previewProduct?.meta_description && (
                        <div>
                          <span className="font-medium">Meta Description:</span>
                          <p className="mt-1 text-gray-700">
                            {previewProduct.meta_description}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Terms and Highlights */}
          {(previewProduct?.terms_condition || previewProduct?.highlights) && (
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-500">
                Additional Information
              </h3>
              <Accordion type="single" collapsible className="mt-1">
                <AccordionItem value="additional">
                  <AccordionTrigger className="text-sm">
                    View Additional Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {previewProduct?.highlights && (
                        <div>
                          <span className="font-medium">Highlights:</span>
                          <div className="mt-1 text-gray-700 border p-2 rounded-md bg-gray-50">
                            {previewProduct.highlights}
                          </div>
                        </div>
                      )}
                      {previewProduct?.terms_condition && (
                        <div>
                          <span className="font-medium">
                            Terms & Conditions:
                          </span>
                          <div className="mt-1 text-gray-700 border p-2 rounded-md bg-gray-50">
                            {previewProduct.terms_condition}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={() => setPreviewProduct(null)} variant="outline">
              Close
            </Button>
            {previewProduct && (
              <Button
                onClick={() => {
                  router.push(
                    `/admin/products/edit-product/${previewProduct.id}`
                  );
                  setPreviewProduct(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Edit This Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product and all its related data including variants, attributes,
              and images.
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

export default ListProductsPage;
