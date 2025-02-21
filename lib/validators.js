import { optional, z } from "zod";

export const CategorySchema = z.object({
  title: z.string().min(1, "Category title is required"),
});
export const SubcategorySchema = z.object({
  title: z.string().min(1, "Subcategory title is required"),
  cat_id: z.number().min(1, "Category is required"),
});
export const BlogSchema = z.object({
  title: z.string().min(1, "Blog title is required"),
  description: z.string().min(1, "Blog description is required"),
  image: z
    .any()
    .optional(),
  date: z.date(),
});


export const SliderSchema = z.object({
  title: z.string().min(1, "Slider title is required"),
  subtitle: z.string().min("1",{
    message:"Subtitle is required"
  }),
  image: z.any().optional(),
  href: z.string().min("1",{
    message:"Href is required"
  }),
  link: z.string().min("1",{
    message:"Link is required"
  }),
  linkTitle: z.string().min("1",{
    message:"Link Title is required"
  }),
  description: z.string().min("1",{
    message:"Description Title is required"
  }),
});


export const AttributeSchema = z.object({
  title: z.string().min(1, "Attribute name is required"),
});

export const AttributeValueSchema = z.object({
  value: z.string().min(1, "Attribute value is required"),
  attribute_id: z.number().min(1, "Attribute is required"),
});

export const ProductSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Product description is required"),
  cat_id: z.number().min(1, "Category is required"),
  subcat_id: z.number().min(1, "Subcategory is required"),
  stock: z.enum(["yes", "no"]).default("yes"),
  stock_count: z.number().min(0, "Stock count must be a positive number"),
  base_price: z.number().min(0, "Base price must be a positive number"),
  price_rupees: z.number().min(0, "Price in rupees must be a positive number"),
  price_dollars: z.number().min(0, "Price in dollars must be a positive number"),
  status: z.enum(["active", "inactive"]).default("active"),
  image: z.any().optional(),
  quantity_limit: z.number().min(0, "Quantity limit must be a positive number"),
  terms_condition: z.string().optional(),
  highlights: z.string().optional(),
  meta_title: z.string().optional(),
  meta_keywords: z.string().optional(),
  meta_description: z.string().optional(),
  hsn_code: z.string().optional(),
  tax: z.number().optional(),
  weight: z.number().optional(),
  free_shipping: z.enum(["yes", "no"]).default("no"),
  cod: z.enum(["yes", "no"]).default("yes"),
  variation: z.enum(["yes", "no"]).default("no"),
});

export const AdminEnumSchema = z.enum(["admin", "staff"]);


// Admin Schema
export const AdminSchema = z.object({
  username: z.string().min(1, "Username is required").max(255, "Username is too long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  user_type: AdminEnumSchema.default("admin"),
});

// Admin Schema
export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required").max(255, "Username is too long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});