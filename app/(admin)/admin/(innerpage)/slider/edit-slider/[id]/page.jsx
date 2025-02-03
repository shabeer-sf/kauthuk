"use client";

import { getOneSlider, updateSlider } from "@/actions/slider";
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
import { SliderSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-day-picker/style.css";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const EditSliderPage = () => {
  const { id } = useParams(); // Get slider ID from URL params
  const sliderId = Number(id); // Ensure it's a number
  const [sliderData, setSliderData] = useState(null); // Store existing slider data
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(SliderSchema),
    defaultValues: {
      title: "",
      image: "",
      date: null,
      description: "",
    },
  });

  // Fetch slider data when the component mounts
  useEffect(() => {
    const fetchSliderData = async () => {
      setIsLoading(true);
      try {
        const response = await getOneSlider(sliderId);
        console.log("Fetched slider:", response);
        setSliderData(response);
        reset(response); // Populate form with existing data
      } catch (error) {
        console.error("Error fetching slider data:", error);
        toast.error("Failed to load slider data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (sliderId) {
      fetchSliderData();
    }
  }, [sliderId, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateSlider(sliderId, data);
      toast.success("Slider updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error updating slider:", error);
      toast.error("Failed to update the slider.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sliderData && isLoading) {
    return <p>Loading...</p>;
  }

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
              <BreadcrumbLink href={`/admin/slider/edit-slider/${id}`}>
                Edit Slider
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full space-y-3">
        <div className="w-full bg-[#343a40] px-3 py-2 rounded-t-xl text-white">
          Edit Slider
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
            {isLoading ? "Updating..." : "Update Slider"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditSliderPage;
