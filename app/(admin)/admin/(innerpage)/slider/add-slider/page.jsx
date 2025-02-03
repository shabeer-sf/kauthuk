"use client";

import { createSlider } from "@/actions/slider";
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
import useFetch from "@/hooks/use-fetch";
import { SliderSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-day-picker/style.css";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const AddSliderPage = () => {
  const [selected, setSelected] = useState();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(SliderSchema),
  });
  const router = useRouter();

  const {
    data: slider,
    loading: isLoading,
    error,
    fn: createSliderFN,
  } = useFetch(createSlider);
  useEffect(() => {
    if (slider) {
      toast.success("Slider created successfully.");
      router.refresh();
    }
    // if (updatedcategory) {
    //   toast.success("Category updated successfully.");
    //   router.refresh();
    // }
  }, [slider]);

  const onSubmit = async (data) => {
    await createSliderFN(data);
  };
  return (
    <div className="w-full p-2 space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/slider/list-sliders">Slider</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/admin/slider/add-slider">
                Add Slider
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="w-full space-y-3">
        <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
          Slider Informations
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
          
          <Button
            disabled={isLoading}
            className={`text-white ${
              isLoading ? "bg-gray-500" : "bg-blue-500"
            }`}
            type="submit"
            size="lg"
          >
            {isLoading ? "Creating..." : "Create Slider"}
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

export default AddSliderPage;
