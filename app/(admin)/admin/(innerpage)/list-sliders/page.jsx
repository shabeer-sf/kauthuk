"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const ResponsiveTable = () => {
  return (
    <div className="w-full p-2 space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/admin/list-sliders">
                List Sliders
              </BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full pt-5">
        
      <div className="w-full overflow-x-auto md:max-w-full">
        <motion.table
          className="min-w-full border border-gray-300 bg-white shadow-md rounded-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <thead className="bg-gray-200 ">
            <tr>
              <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                Title
              </th>
              <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                Image
              </th>
              <th className="border p-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-100 transition-all">
              <td className="border p-3 text-sm text-gray-700">1</td>
              <td className="border p-3 text-sm text-gray-700">
                Sample Slider
              </td>
              <td className="border p-3">
                <Image
                  src="https://images.pexels.com/photos/30154480/pexels-photo-30154480/free-photo-of-dusk-at-the-beach-with-urban-skyline.jpeg"
                  alt="Slider"
                  width={90}
                  height={90}
                  className="w-32 rounded"
                />
              </td>
              <td className="border p-3 text-sm text-gray-700 space-x-3">
                <button className="text-blue-500 hover:text-blue-700 transition-all">
                  <Pencil size={20} />
                </button>
                <button className="text-red-500 hover:text-red-700 transition-all">
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100 transition-all">
              <td className="border p-3 text-sm text-gray-700">1</td>
              <td className="border p-3 text-sm text-gray-700">
                Sample Slider
              </td>
              <td className="border p-3">
                <Image
                  src="https://images.pexels.com/photos/30154480/pexels-photo-30154480/free-photo-of-dusk-at-the-beach-with-urban-skyline.jpeg"
                  alt="Slider"
                  width={90}
                  height={90}
                  className="w-32 rounded"
                />
              </td>
              <td className="border p-3 text-sm text-gray-700 space-x-3">
                <button className="text-blue-500 hover:text-blue-700 transition-all">
                  <Pencil size={20} />
                </button>
                <button className="text-red-500 hover:text-red-700 transition-all">
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100 transition-all">
              <td className="border p-3 text-sm text-gray-700">1</td>
              <td className="border p-3 text-sm text-gray-700">
                Sample Slider
              </td>
              <td className="border p-3">
                <Image
                  src="https://images.pexels.com/photos/30154480/pexels-photo-30154480/free-photo-of-dusk-at-the-beach-with-urban-skyline.jpeg"
                  alt="Slider"
                  width={90}
                  height={90}
                  className="w-32 rounded"
                />
              </td>
              <td className="border p-3 text-sm text-gray-700 space-x-3">
                <button className="text-blue-500 hover:text-blue-700 transition-all">
                  <Pencil size={20} />
                </button>
                <button className="text-red-500 hover:text-red-700 transition-all">
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100 transition-all">
              <td className="border p-3 text-sm text-gray-700">1</td>
              <td className="border p-3 text-sm text-gray-700">
                Sample Slider
              </td>
              <td className="border p-3">
                <Image
                  src="https://images.pexels.com/photos/30154480/pexels-photo-30154480/free-photo-of-dusk-at-the-beach-with-urban-skyline.jpeg"
                  alt="Slider"
                  width={90}
                  height={90}
                  className="w-32 rounded"
                />
              </td>
              <td className="border p-3 text-sm text-gray-700 space-x-3">
                <button className="text-blue-500 hover:text-blue-700 transition-all">
                  <Pencil size={20} />
                </button>
                <button className="text-red-500 hover:text-red-700 transition-all">
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100 transition-all">
              <td className="border p-3 text-sm text-gray-700">1</td>
              <td className="border p-3 text-sm text-gray-700">
                Sample Slider
              </td>
              <td className="border p-3">
                <Image
                  src="https://images.pexels.com/photos/30154480/pexels-photo-30154480/free-photo-of-dusk-at-the-beach-with-urban-skyline.jpeg"
                  alt="Slider"
                  width={90}
                  height={90}
                  className="w-32 rounded"
                />
              </td>
              <td className="border p-3 text-sm text-gray-700 space-x-3">
                <button className="text-blue-500 hover:text-blue-700 transition-all">
                  <Pencil size={20} />
                </button>
                <button className="text-red-500 hover:text-red-700 transition-all">
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-100 transition-all">
              <td className="border p-3 text-sm text-gray-700">1</td>
              <td className="border p-3 text-sm text-gray-700">
                Sample Slider
              </td>
              <td className="border p-3">
                <Image
                  src="https://images.pexels.com/photos/30154480/pexels-photo-30154480/free-photo-of-dusk-at-the-beach-with-urban-skyline.jpeg"
                  alt="Slider"
                  width={90}
                  height={90}
                  className="w-32 rounded"
                />
              </td>
              <td className="border p-3 text-sm text-gray-700 space-x-3">
                <button className="text-blue-500 hover:text-blue-700 transition-all">
                  <Pencil size={20} />
                </button>
                <button className="text-red-500 hover:text-red-700 transition-all">
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          </tbody>
        </motion.table>
      </div>
      </div>
    </div>
  );
};

export default ResponsiveTable;
