"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  File,
  FileType,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useFetch from "@/hooks/use-fetch";
import { AdminSchema } from "@/lib/validators";
import {
  createAdmin,
  deleteAdminById,
  getAdmins,
  toggleAdmin,
  updateAdmin,
} from "@/actions/admin";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AdminPage = () => {
  const [boxMenu, setBoxMenu] = useState("no");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(AdminSchema),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
  });

  const itemsPerPage = 15;

  const router = useRouter();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await getAdmins({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
      });
      //   console.log(response, response.admins);
      setAdmins(response.admins);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const {
    data: admin,
    loading: isLoading,
    error,
    fn: createAdminFN,
  } = useFetch(createAdmin);
  const {
    data: updatedadmin,
    loading: isLoading2,
    error: errorUpdate,
    fn: updateAdminFN,
  } = useFetch(updateAdmin);

  useEffect(() => {
    fetchAdmins();
  }, [searchQuery, currentPage, sortBy, admin, updatedadmin]);

  useEffect(() => {
    if (admin) {
      toast.success("Admin created successfully.");
      router.refresh();
    }
    if (updatedadmin) {
      toast.success("Admin updated successfully.");
      router.refresh();
    }
  }, [admin, updatedadmin]);

  const onSubmit = async (data) => {
    await createAdminFN(data);
  };
  const onSubmit2 = async () => {
    await updateAdminFN(formData);
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

  const toggleActive = async (id) => {
    const toggleData = await toggleAdmin(id);
    if (toggleData.id) {
      fetchAdmins();
    }
  };

  const deletDataById = async (id) => {
    if (typeof window === "undefined") return; // Prevent execution on the server
  
    const isConfirmed = window.confirm("Are you sure you want to delete this Admin?");
    if (!isConfirmed) return; // Exit if the user cancels
  
    try {
      const deleteData = await deleteAdminById(id);
      if (deleteData.success) {
        toast.success("Admin deleted successfully");
        fetchAdmins();
      } else {
        toast.error("Failed to delete admin.");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("An error occurred while deleting the admin.");
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
              <BreadcrumbLink href="/admin/list-admin">Admin</BreadcrumbLink>
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
              Admin Informations
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid lg:grid-cols-3 gap-3 p-3"
            >
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 max-md:col-span-1">
                <label
                  htmlFor="user_type"
                  className="block text-sm font-medium mb-1"
                >
                  Type
                </label>
                <Controller
                  name="user_type"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={"admin"}
                      >
                        {/* {console.log(field.value)} */}
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={"admin"}>Admin</SelectItem>
                          <SelectItem value={"staff"}>Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.user_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors?.user_type.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-3" />
              <Button
                disabled={isLoading}
                className={`text-white ${
                  isLoading ? "bg-gray-500" : "bg-blue-500"
                }`}
                type="submit"
                size="lg"
              >
                {isLoading ? "Creating..." : "Create Admin"}
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
                <Label htmlFor="title">Username</Label>
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
                {isLoading2 ? "Updating..." : "Update Admin"}
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
                    placeholder="Search admins..."
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
                  Username
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={4}>
                  {loading && (
                    <div className="flex items-center w-full h-[50vh] justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                  )}
                </td>
              </tr>
              {admins.length > 0 &&
                admins?.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition-all"
                    >
                     
                      <td className="border p-3 text-sm text-gray-700">
                        {item.username}
                      </td>
                      <td className="border p-3 text-sm text-gray-700">
                        {item.status =="staff" ? "Staff" : "Admin"}
                      </td>
                      <td className="border p-3 text-sm text-gray-700 flex justify-center">
                        <Button
                          onClick={() => toggleActive(item.id)}
                          variant={"ghost"}
                          className="p-0"
                        >
                          <Badge
                            className={cn(
                              "",
                              item.status == "active"
                                ? "bg-green-500 hover:bg-green-500"
                                : "bg-red-500 hover:bg-red-500"
                            )}
                          >
                            {item.status == "active" ? "Active" : "Inactive"}
                          </Badge>
                        </Button>
                      </td>

                      <td className="border p-3 text-sm text-gray-700 space-x-3">
                        <button
                          onClick={() => {
                            setBoxMenu("update");
                            setFormData({
                              id: item.id,
                              title: item.username,
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

export default AdminPage;
