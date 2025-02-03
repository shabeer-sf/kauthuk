// "use client";
// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Upload } from "lucide-react";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// const MediaForm = () => {
 

//     const router = useRouter();
  
//     const {
//       register,
//       handleSubmit,
//       formState: { errors },
//     } = useForm({
//       resolver: zodResolver(projectSchema),
//     });
  
//     useEffect(() => {
//       if (isOrgLoaded && isUserLoaded && membership) {
//         setIsAdmin(membership.role === "org:admin");
//       }
//     }, [isOrgLoaded, isUserLoaded, membership]);
//     const {
//       data: project,
//       loading,
//       error,
//       fn: createProjectFN,
//     } = useFetch(createProject);
  
//     useEffect(() => {
//       if (project) {
//         toast.success("Project created successfully.");
//         router.push(`/project/${project.id}`);
//       }
//     }, [loading]);
//     // Ensure both organization and user are loaded before rendering
//     if (!isOrgLoaded || !isUserLoaded) {
//       return null; // Or a loading spinner, if preferred
//     }

//   return (
//     <div className="w-full p-2 space-y-2">
//       <Breadcrumb>
//         <BreadcrumbList>
//           <BreadcrumbItem>Admin</BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>
//             <BreadcrumbPage>
//               <BreadcrumbLink href="/admin/list-sliders">
//                 List Sliders
//               </BreadcrumbLink>
//             </BreadcrumbPage>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>
//             <BreadcrumbPage>
//               <BreadcrumbLink href="/admin/add-sliders">
//                 Add Sliders
//               </BreadcrumbLink>
//             </BreadcrumbPage>
//           </BreadcrumbItem>
//         </BreadcrumbList>
//       </Breadcrumb>
//       <Card className="w-full mx-auto bg-white">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">Create Slider</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <Label htmlFor="title">Title</Label>
//               <Input
//                 id="title"
//                 value={formData.title}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, title: e.target.value }))
//                 }
//                 placeholder="Enter title"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     description: e.target.value,
//                   }))
//                 }
//                 placeholder="Enter description"
//                 className="min-h-32"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="image">Image Upload</Label>
//               <div className="flex items-center gap-4">
//                 <Input
//                   id="image"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                 />
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => document.getElementById("image").click()}
//                   className="w-full"
//                 >
//                   <Upload className="mr-2 h-4 w-4" />
//                   Upload Image
//                 </Button>
//               </div>
//               {formData.imageUrl && (
//                 <div className="mt-4">
//                   <img
//                     src={formData.imageUrl}
//                     alt="Preview"
//                     className="max-w-full h-48 object-cover rounded-lg"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-4 pt-4">
//               <Button type="submit" className="flex-1">
//                 Save
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleReset}
//                 className="flex-1"
//               >
//                 Reset
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default MediaForm;


import React from 'react'

const AddSlider = () => {
  return (
    <div>AddSlider</div>
  )
}

export default AddSlider