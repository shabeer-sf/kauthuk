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
import { ProductSchema } from "@/lib/validators";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories2 } from "@/actions/category";
import { getSubcategories2 } from "@/actions/subcategory";
import { Checkbox } from "@/components/ui/checkbox";

const AddProductPage = () => {
  const [selected, setSelected] = useState();
  const [categoryArray, setCategoryArray] = useState([]);
  const [subcategoryArray, setSubcategoryArray] = useState([]);
  const [isVariant, setIsVariant] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  const attributes = [
    {
      id: 1,
      name: "Size",
      values: [
        { id: 101, value: "Small" },
        { id: 102, value: "Medium" },
        { id: 103, value: "Large" },
      ],
    },
    {
      id: 2,
      name: "Color",
      values: [
        { id: 201, value: "Red" },
        { id: 202, value: "Blue" },
        { id: 203, value: "Green" },
      ],
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(ProductSchema),
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
      toast.success("Product created successfully.");
      router.refresh();
    }
    // if (updatedcategory) {
    //   toast.success("Category updated successfully.");
    //   router.refresh();
    // }
  }, [blog]);

  const fetchCategories = async () => {
    const categories = await getCategories2();
    // console.log("categories",categories.categories)
    setCategoryArray(categories.categories);
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchSubcategories = async (cat_id) => {
    const subcategories = await getSubcategories2(cat_id);
    console.log("subcategories", subcategories.subcategories);
    setSubcategoryArray(subcategories.subcategories);
  };

  const onSubmit = async (data) => {
    await createBlogFN(data);
  };
  const handleAttributeChange = (attributeId, valueId) => {
    setSelectedAttributes((prev) => {
      const newValues = prev[attributeId] ? [...prev[attributeId]] : [];
      if (newValues.includes(valueId)) {
        return { ...prev, [attributeId]: newValues.filter((v) => v !== valueId) };
      } else {
        return { ...prev, [attributeId]: [...newValues, valueId] };
      }
    });
  };
  
  const handleSubImagesChange = (attributeId, files) => {
    setSubImages((prev) => ({
      ...prev,
      [attributeId]: Array.from(files),
    }));
  };
  return (
    <div className="w-full p-2 space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/blog/list-blogs">
              Product
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/admin/blog/add-blog">
                Add Product
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="w-full space-y-3">
        <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
          Product Informations
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid md:grid-cols-2 gap-2 p-3"
        >
          <div className="space-y-2 max-md:col-span-1">
            <label htmlFor="cat_id" className="block text-sm font-medium mb-1">
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
                      fetchSubcategories(Number(val));
                    }}
                    defaultValue={field.value}
                  >
                    {/* {console.log(field.value)} */}
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryArray?.length > 0 &&
                        categoryArray.map((cat) => (
                          <SelectItem value={cat.id.toString()} key={cat.id}>
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
          <div className="space-y-2 max-md:col-span-1">
            <label
              htmlFor="subcat_id"
              className="block text-sm font-medium mb-1"
            >
              Subcategory
            </label>
            <Controller
              name="subcat_id"
              control={control}
              render={({ field }) => {
                return (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={field.value}
                  >
                    {/* {console.log(field.value)} */}
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryArray?.length > 0 &&
                        subcategoryArray.map((sub) => (
                          <SelectItem value={sub.id.toString()} key={sub.id}>
                            {sub.subcategory}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.subcat_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors?.subcat_id.message}
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

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              {...register("meta_title")}
              className={errors.meta_title ? "border-red-500" : ""}
            />
            {errors.meta_title && (
              <p className="text-sm text-red-500">
                {errors.meta_title?.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="meta_keywords">Meta Keywords</Label>
            <Input
              id="meta_keywords"
              {...register("meta_keywords")}
              className={errors.meta_keywords ? "border-red-500" : ""}
            />
            {errors.meta_keywords && (
              <p className="text-sm text-red-500">
                {errors.meta_keywords?.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Input
              id="meta_description"
              {...register("meta_description")}
              className={errors.meta_description ? "border-red-500" : ""}
            />
            {errors.meta_description && (
              <p className="text-sm text-red-500">
                {errors.meta_description?.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="hsn_code">Hsn Code</Label>
            <Input
              id="hsn_code"
              {...register("hsn_code")}
              className={errors.hsn_code ? "border-red-500" : ""}
            />
            {errors.hsn_code && (
              <p className="text-sm text-red-500">{errors.hsn_code?.message}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="tax">Tax (in percentage)</Label>
            <Input
              id="tax"
              {...register("tax")}
              className={errors.tax ? "border-red-500" : ""}
            />
            {errors.tax && (
              <p className="text-sm text-red-500">{errors.tax?.message}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="quantity_limit">Quantity Limit</Label>
            <Input
              id="quantity_limit"
              {...register("quantity_limit")}
              className={errors.quantity_limit ? "border-red-500" : ""}
            />
            {errors.quantity_limit && (
              <p className="text-sm text-red-500">
                {errors.quantity_limit?.message}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
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
                    <MDEditor
                      autoCapitalize="none"
                      value={field.value}
                      onChange={field.onChange}
                    />
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
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="highlights"
              className="block text-sm font-medium mb-1"
            >
              Highlights
            </label>
            <Controller
              name="highlights"
              control={control}
              render={({ field }) => {
                return (
                  <div data-color-mode="light">
                    <MDEditor
                      autoCapitalize="none"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                );
              }}
            />
            {errors.highlights && (
              <p className="text-sm text-red-500">
                {errors.highlights?.message}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="terms_condition"
              className="block text-sm font-medium mb-1"
            >
              Terms and Conditions
            </label>
            <Controller
              name="terms_condition"
              control={control}
              render={({ field }) => {
                return (
                  <div data-color-mode="light">
                    <MDEditor
                      autoCapitalize="none"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                );
              }}
            />
            {errors.terms_condition && (
              <p className="text-sm text-red-500">
                {errors.terms_condition?.message}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2 flex items-center gap-3">
            <Label htmlFor="variants">Variants</Label>
            <Checkbox
              id="variants"
              onCheckedChange={setIsVariant}
              checked={isVariant}
            />
          </div>

          {isVariant ? (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <h3 className="text-lg font-medium">Attributes</h3>
      {attributes.map((attr) => (
        <div key={attr.id} className="mt-2">
          <h4 className="text-sm font-medium">{attr.name}</h4>
          {attr.values.map((value) => (
            <div key={value.id} className="flex items-center gap-2 mt-1">
              <Checkbox
                checked={selectedAttributes[attr.id]?.includes(value.id)}
                onCheckedChange={() => handleAttributeChange(attr.id, value.id)}
              />
              <span>{value.value}</span>
            </div>
          ))}
          {/* Sub-image picker based on attribute */}
          {selectedAttributes[attr.id]?.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Select Sub-Images for {attr.name}</h4>
              <input 
                type="file" 
                multiple 
                onChange={(e) => handleSubImagesChange(attr.id, e.target.files)} 
                className="mt-1"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="mt-4">
    <h3 className="text-lg font-medium">Upload Sub-Images</h3>
    <input 
      type="file" 
      multiple 
      onChange={(e) => handleSubImagesChange(null, e.target.files)} 
      className="mt-1"
    />
  </div>
)}
          <div className="md:cols-span-2"></div>
          <Button
            disabled={isLoading}
            className={`text-white ${
              isLoading ? "bg-gray-500" : "bg-blue-500"
            }`}
            type="submit"
            size="lg"
          >
            {isLoading ? "Creating..." : "Create Product"}
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

export default AddProductPage;
