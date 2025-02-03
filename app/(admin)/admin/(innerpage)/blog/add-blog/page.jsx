"use client";

import { createBlog } from "@/actions/blog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useFetch from "@/hooks/use-fetch";
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
import { useRouter } from "next/navigation";

const AddBlogPage = () => {
  const [selected, setSelected] = useState();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(BlogSchema),
  });
  const router = useRouter();

  const {
    data: blog,
    loading: isLoading,
    error,
    fn: createBlogFN,
  } = useFetch(createBlog);
  useEffect(() => {
    if (blog) {
      toast.success("Blog created successfully.");
      router.refresh();
    }
    // if (updatedcategory) {
    //   toast.success("Category updated successfully.");
    //   router.refresh();
    // }
  }, [blog]);

  const onSubmit = async (data) => {
    await createBlogFN(data);
  };
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
              <BreadcrumbLink href="/admin/blog/add-blog">
                Add Blog
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="w-full space-y-3">
        <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
          Blog Informations
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
              render={({ field }) => {
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          "w-full justify-start text-left font-normal  "
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
                        classNames={{
                          chevron: "fill-blue-500",
                          range_middle: "bg-blue-400",
                          day_button: "border-none",
                          today: "border-2 border-blue-700",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                );
              }}
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
              render={({ field }) => {
                return (
                  <div data-color-mode="light">
                    <MDEditor autoCapitalize="none" value={field.value} onChange={field.onChange} />
                  </div>
                );
              }}
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
            {isLoading ? "Creating..." : "Create Blog"}
          </Button>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </form>
      </Card>
    </div>
  );
};

export default AddBlogPage;
