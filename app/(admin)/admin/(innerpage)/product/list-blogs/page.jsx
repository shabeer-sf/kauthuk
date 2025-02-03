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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useFetch from "@/hooks/use-fetch";
import { BlogSchema } from "@/lib/validators";
import { deleteBlogById, getBlogs } from "@/actions/blog";
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
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import MDEditor from "@uiw/react-md-editor";
import { truncateText } from "@/helpers/multifunction";

const ListBlogsPage = () => {
  const [boxMenu, setBoxMenu] = useState("no");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);

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
      console.log(response, response.blogs);
      setBlogs(response.blogs);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUi = (keyword) => {
    if (boxMenu == keyword) {
      setBoxMenu("no");
    } else {
      setBoxMenu(keyword);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, currentPage, sortBy]);

  const handleReset = () => {
    router.refresh();
    setBoxMenu("no");
    setSearchQuery("");
  };

  const deletDataById = async (id) => {
    // console.log("",id)

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this Blog?"
    );

    if (!isConfirmed) {
      return; // Exit the function if the user cancels
    }

    const deleteData = await deleteBlogById(id);
    if (deleteData.success) {
      toast.success("Blog deleted successfully");
      fetchBlogs();
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
              <BreadcrumbLink href="/admin/blog/list-blogs">
                Blog
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full pt-5 space-y-3">
        <div className="flex w-full justify-end gap-2 items-center">
          <Link href="/admin/blog/add-blog">
            <Button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white flex gap-1">
              <FileType size={15} />
              <p className="font-semibold">New</p>
            </Button>
          </Link>
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
                    placeholder="Search blogs..."
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
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Title
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Image
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center p-5">
                    <div className="flex items-center justify-center w-full h-[50vh]">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              )}

              {blogs.length > 0 ? (
                blogs.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-100 transition-all"
                  >
                    <td className="border p-3 text-sm text-gray-700">
                      {item.title}
                    </td>
                    <td className="border p-3 text-sm text-gray-700  group">
                      <div>
                     
                        {
                          truncateText(item.description)
                        }
                      </div>

                      {
                        <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block p-3 w-[70vh] min-h-[70vh] z-50 max-md:w-[40vh]">
                          <MDEditor.Markdown
                            source={item.description}
                            style={{ whiteSpace: "pre-wrap" }}
                          />
                        </Card>
                      }
                    </td>

                    <td className="border p-3 text-sm text-gray-700 text-center">
                      {item.image && (
                        <Image
                          src={`https://greenglow.in/kauthuk_test/${item.image}`}
                          width={90}
                          height={90}
                          alt="Blog"
                        />
                      )}
                    </td>
                    <td className="border p-3 text-sm text-gray-700 text-center">
                      {format(item.date, "LLL dd, y")}
                    </td>
                    <td className="border p-3 text-sm text-gray-700 space-x-3 text-center">
                      <button
                        onClick={() => {
                          setBoxMenu("update");
                          setFormData({
                            id: item.id,
                            title: item.catName,
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-5 text-gray-500">
                    No blog data available.
                  </td>
                </tr>
              )}
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

export default ListBlogsPage;
