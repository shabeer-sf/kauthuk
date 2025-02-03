"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FileType, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { getCategories2 } from "@/actions/category";
import {
  createSubcategory,
  deleteSubcategoryById,
  getSubcategories,
  updateSubcategory,
} from "@/actions/subcategory";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { SubcategorySchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SubcategoryPage = () => {
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    cat_id: "",
  });
  const [boxMenu, setBoxMenu] = useState("no");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(SubcategorySchema),
    // defaultValues: {
    //   cat_id: formData.cat_id || "", // Ensure it starts with a valid value
    //   title: formData.title || "",
    // },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryArray, setCategoryArray] = useState([]);

  const itemsPerPage = 15;

  const router = useRouter();

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const response = await getSubcategories({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
      });
      //   console.log(response, response.subcategories);
      setSubcategories(response.subcategories);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   setValue("cat_id", formData.cat_id); // Ensure form field sync with external state
  // }, [formData.cat_id, setValue]);

  const {
    data: subcategory,
    loading: isLoading,
    error,
    fn: createSubcategoryFN,
  } = useFetch(createSubcategory);
  const {
    data: updatedsubcategory,
    loading: isLoading2,
    error: errorUpdate,
    fn: updateSubcategoryFN,
  } = useFetch(updateSubcategory);

  useEffect(() => {
    fetchSubcategories();
  }, [searchQuery, currentPage, sortBy, subcategory, updatedsubcategory]);

  const fetchCategories = async () => {
    const categories = await getCategories2();
    // console.log("categories",categories.categories)
    setCategoryArray(categories.categories);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (subcategory) {
      toast.success("Subcategory created successfully.");
      router.refresh();
    }
    if (updatedsubcategory) {
      toast.success("Subcategory updated successfully.");
      router.refresh();
    }
  }, [subcategory, updatedsubcategory]);

  const onSubmit = async (data) => {
    await createSubcategoryFN(data);
  };
  const onSubmit2 = async () => {
    await updateSubcategoryFN(formData);
    console.log("formData",formData)
  };
  const toggleUi = (keyword) => {
    if (boxMenu == keyword) {
      setBoxMenu("no");
    } else {
      setBoxMenu(keyword);
    }
  };

  const handleReset = () => {
    router.refresh();
    reset();
    setBoxMenu("no");
    setSearchQuery("");
  };

  // const toggleActive = async (id) => {
  //   const toggleData = await toggleSubcategory(id);
  //   if (toggleData.id) {
  //     fetchSubcategories();
  //   }
  // };

  const deletDataById = async (id) => {
    // console.log("",id)

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this Subcategory?"
    );

    if (!isConfirmed) {
      return; // Exit the function if the user cancels
    }

    const deleteData = await deleteSubcategoryById(id);
    if (deleteData.success) {
      toast.success("Subcategory deleted successfully");
      fetchSubcategories();
    }
  };
  return (
    <div className="w-full p-2 space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/admin/subcategory">
                Subcategory
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full pt-5 space-y-3">
        <div className="flex w-full justify-end gap-2 items-center">
          <Button
            onClick={() => toggleUi("create")}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white flex gap-1"
          >
            <FileType size={15} />
            <p className="font-semibold">New</p>
          </Button>
          <Button
            onClick={() => toggleUi("search")}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white flex gap-1"
          >
            <Search size={15} />
            <p className="font-semibold">Search</p>
          </Button>
          <Button
            onClick={handleReset}
            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-700 text-white flex gap-1"
          >
            <RotateCcw size={15} />
            <p className="font-semibold">Reset</p>
          </Button>
        </div>
        {boxMenu == "create" && (
          <Card className="w-full space-y-3">
            <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
              Subcategory Informations
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-3">
              <div className="space-y-2">
                <label
                  htmlFor="cat_id"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <Controller
                  name="cat_id"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        defaultValue={field.value}
                      >
                        {/* {console.log(field.value)} */}
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryArray?.length > 0 &&
                            categoryArray.map((cat) => (
                              <SelectItem
                                value={cat.id.toString()}
                                key={cat.id}
                              >
                                {cat.catName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.cat_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors?.cat_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title?.message}
                  </p>
                )}
              </div>
              <Button
                disabled={isLoading}
                className={`text-white ${
                  isLoading ? "bg-gray-500" : "bg-blue-500"
                }`}
                type="submit"
                size="lg"
              >
                {isLoading ? "Creating..." : "Create Subcategory"}
              </Button>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </form>
          </Card>
        )}
        {boxMenu == "update" && (
          <Card className="w-full space-y-3">
            <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
              Update Informations
            </div>
            <form onSubmit={handleSubmit(onSubmit2)} className="space-y-6 p-3">
              <div className="space-y-2">
                <label
                  htmlFor="cat_id"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <Controller
                  name="cat_id"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                      onValueChange={(val) => {
                        field.onChange(Number(val));
                        setFormData({ ...formData, cat_id: Number(val) });
                      }}
                        value={field.value ? String(field.value) : ""}
                      >
                        {/* {console.log("formData.cat_id", formData.cat_id)}
                        {console.log("field.value", field.value)} */}
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryArray?.length > 0 &&
                            categoryArray.map((cat) => (
                              <SelectItem
                                value={cat.id.toString()}
                                key={cat.id}
                              >
                                {cat.catName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.cat_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors?.cat_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  {...register("title")}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title?.message}
                  </p>
                )}
              </div>
              <Button
                disabled={isLoading2}
                className={`text-white ${
                  isLoading2 ? "bg-gray-500" : "bg-blue-500"
                }`}
                type="submit"
                size="lg"
              >
                {isLoading2 ? "Updating..." : "Update Subcategory"}
              </Button>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              )}
            </form>
          </Card>
        )}
        {boxMenu == "search" && (
          <Card className="w-full space-y-3">
            <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
              Search
            </div>
            <div className="space-y-6 p-3">
              <div className="flex gap-4 items-center justify-between">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subcategories..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 ">
                  <Select defaultValue="latest" onValueChange={setSortBy}>
                    <SelectTrigger className="w-full ">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="w-full overflow-x-auto md:max-w-full">
          <motion.table
            className="min-w-full border border-gray-300 bg-white shadow-md rounded-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <thead className="bg-gray-200 ">
              <tr>
                {/* <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  ID
                </th> */}
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  SubCategory
                </th>
                {/* <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Show On Home
                </th> */}

                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={3}>
                  {loading && (
                    <div className="flex items-center w-full h-[50vh] justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                  )}
                </td>
              </tr>
              {subcategories.length > 0 &&
                subcategories?.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition-all"
                    >
                      {/* {console.log("item",item)} */}
                      {/* <td className="border p-3 text-sm text-gray-700">
                        {item.id}
                      </td> */}
                      <td className="border p-3 text-sm text-gray-700">
                        {item.Category?.catName}
                      </td>
                      <td className="border p-3 text-sm text-gray-700">
                        {item.subcategory}
                      </td>
                      {/* <td className="border p-3 text-sm text-gray-700 flex justify-center">
                        <Button
                          onClick={() => toggleActive(item.id)}
                          variant={"ghost"}
                          className="p-0"
                        >
                          <Badge
                            className={cn(
                              "",
                              item.showHome == "active"
                                ? "bg-green-500 hover:bg-green-500"
                                : "bg-red-500 hover:bg-red-500"
                            )}
                          >
                            {item.showHome == "active" ? "Active" : "Inactive"}
                          </Badge>
                        </Button>
                      </td> */}

                      <td className="border p-3 text-sm text-gray-700 space-x-3">
                        <button
                          onClick={() => {
                            setBoxMenu("update");
                            setValue("cat_id", item.cat_id); // Ensure form field sync with external state

                            setFormData({
                              id: item.id,
                              title: item.subcategory,
                              cat_id: item.cat_id,
                            });
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-all"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          onClick={() => deletDataById(item.id)}
                          className="text-red-500 hover:text-red-700 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </motion.table>
        </div>

        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
    </div>
  );
};

export default SubcategoryPage;
