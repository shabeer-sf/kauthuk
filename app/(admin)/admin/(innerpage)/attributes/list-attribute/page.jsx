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
import { useForm } from "react-hook-form";

import {
  createAttribute,
  deleteAttributeById,
  getAttributes,
  updateAttribute,
} from "@/actions/attribute";
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
import { AttributeSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AttributePage = () => {
  const [boxMenu, setBoxMenu] = useState("no");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(AttributeSchema),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
  });

  const itemsPerPage = 15;

  const router = useRouter();

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const response = await getAttributes({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
      });
      //   console.log(response, response.attributes);
      setAttributes(response.attributes);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
    } finally {
      setLoading(false);
    }
  };

  const {
    data: attribute,
    loading: isLoading,
    error,
    fn: createAttributeFN,
  } = useFetch(createAttribute);
  const {
    data: updatedattribute,
    loading: isLoading2,
    error: errorUpdate,
    fn: updateAttributeFN,
  } = useFetch(updateAttribute);

  useEffect(() => {
    fetchAttributes();
  }, [searchQuery, currentPage, sortBy, attribute, updatedattribute]);

  useEffect(() => {
    if (attribute) {
      toast.success("Attribute created successfully.");
      router.refresh();
    }
    if (updatedattribute) {
      toast.success("Attribute updated successfully.");
      router.refresh();
    }
  }, [attribute, updatedattribute]);

  const onSubmit = async (data) => {
    await createAttributeFN(data);
  };
  const onSubmit2 = async () => {
    await updateAttributeFN(formData);
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

  const deletDataById = async (id) => {
    // console.log("",id)

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this Attribute?"
    );

    if (!isConfirmed) {
      return; // Exit the function if the user cancels
    }

    const deleteData = await deleteAttributeById(id);
    if (deleteData.success) {
      toast.success("Attribute deleted successfully");
      fetchAttributes();
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
              <BreadcrumbLink href="/admin/attributes/list-attribute">
                Attribute
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
              Attribute Informations
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-3">
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
                {isLoading ? "Creating..." : "Create Attribute"}
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
                {isLoading2 ? "Updating..." : "Update Attribute"}
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
                    placeholder="Search attributes..."
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
                  Title
                </th>

                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={2}>
                  {loading && (
                    <div className="flex items-center w-full h-[50vh] justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                  )}
                </td>
              </tr>
              {attributes.length > 0 &&
                attributes?.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition-all"
                    >
                      {/* <td className="border p-3 text-sm text-gray-700">
                        {item.id}
                      </td> */}
                      <td className="border p-3 text-sm text-gray-700">
                        {item.name}
                      </td>

                      <td className="border p-3 text-sm text-gray-700 space-x-3">
                        <button
                          onClick={() => {
                            setBoxMenu("update");
                            setFormData({
                              id: item.id,
                              title: item.name,
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

export default AttributePage;
