"use client";

import { getOneBlog, updateBlog } from "@/actions/blog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BlogSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Controller, useForm } from "react-hook-form";
import "react-day-picker/style.css";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

const EditBlogPage = () => {
  const { id } = useParams(); // Get blog ID from URL params
  const blogId = Number(id); // Ensure it's a number
  const [blogData, setBlogData] = useState(null); // Store existing blog data
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(BlogSchema),
    defaultValues: {
      title: "",
      image: "",
      date: null,
      description: "",
    },
  });

  // Fetch blog data when the component mounts
  useEffect(() => {
    const fetchBlogData = async () => {
      setIsLoading(true);
      try {
        const response = await getOneBlog(blogId);
        console.log("Fetched blog:", response);
        setBlogData(response);
        reset(response); // Populate form with existing data
      } catch (error) {
        console.error("Error fetching blog data:", error);
        toast.error("Failed to load blog data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateBlog(blogId, data);
      toast.success("Blog updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update the blog.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!blogData && isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full p-2 space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/blog/list-blogs">Blog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href={`/admin/blog/edit-blog/${id}`}>
                Edit Blog
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full space-y-3">
        <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
          Edit Blog
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
              <p className="text-sm text-red-500">{errors.title?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/png, image/jpeg"
              {...register("image")}
              className={errors.image ? "border-red-500" : ""}
            />
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image?.message}</p>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Date</label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={cn(
                        "w-full justify-start text-left font-normal"
                      )}
                      variant="outline"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "LLL dd, y")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto" align="start">
                    <DayPicker
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div data-color-mode="light">
                  <MDEditor
                    autoCapitalize="none"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description?.message}
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
            {isLoading ? "Updating..." : "Update Blog"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditBlogPage;
