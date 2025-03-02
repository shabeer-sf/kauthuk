'use client'

import { createProduct, getCategoriesAndSubcategories, getProductAttributes } from '@/actions/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

// Import shadcn components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { createProductSchema } from '@/lib/validators'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [attributes, setAttributes] = useState([])
  const [activeTab, setActiveTab] = useState('basic')
  const [productImagePreviews, setProductImagePreviews] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState([
    {
      id: 'new-1',
      sku: '',
      price_rupees: '',
      price_dollars: '',
      stock_count: 0,
      stock_status: 'yes',
      weight: '',
      is_default: true,
      attribute_values: [],
      images: [],
      imagePreviews: []
    }
  ])

  const router = useRouter()
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      cat_id: '',
      subcat_id: '',
      title: '',
      description: '',
      status: 'active',
      hasVariants: false,
      base_price: '',
      price_rupees: '',
      price_dollars: '',
      stock_count: 0,
      stock_status: 'yes',
      quantity_limit: 10,
      terms_condition: '',
      highlights: '',
      meta_title: '',
      meta_keywords: '',
      meta_description: '',
      hsn_code: '',
      tax: '',
      weight: '',
      free_shipping: 'no',
      cod: 'yes',
      images: [],
      attributes: [],
      variants: []
    }
  })

  // Watch for changes to hasVariants and category
  const watchHasVariants = form.watch('hasVariants')
  const watchCategoryId = form.watch('cat_id')

  // Load categories, subcategories, and attributes on page load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const categoriesData = await getCategoriesAndSubcategories()
        setCategories(categoriesData)
        
        const attributesData = await getProductAttributes()
        setAttributes(attributesData)
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Failed to load form data. Please refresh the page.')
      }
    }
    
    loadInitialData()
  }, [])

  // Update subcategories when category changes
  useEffect(() => {
    if (watchCategoryId) {
      const selectedCategory = categories.find(cat => cat.id === parseInt(watchCategoryId))
      if (selectedCategory) {
        setSubcategories(selectedCategory.SubCategory || [])
        form.setValue('subcat_id', '') // Reset subcategory selection
      }
    }
  }, [watchCategoryId, categories, form])

  // Update hasVariants state when form value changes
  useEffect(() => {
    setHasVariants(watchHasVariants)
  }, [watchHasVariants])

  // Handle image selection for product
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // Update form value
      const currentImages = form.getValues('images') || []
      form.setValue('images', [...currentImages, ...files])
      
      // Create preview URLs
      const newPreviews = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }))
      
      setProductImagePreviews([...productImagePreviews, ...newPreviews])
    }
  }

  // Handle removing a product image
  const handleRemoveProductImage = (index) => {
    const currentImages = form.getValues('images')
    const updatedImages = [...currentImages]
    updatedImages.splice(index, 1)
    form.setValue('images', updatedImages)
    
    // Also update previews
    const updatedPreviews = [...productImagePreviews]
    URL.revokeObjectURL(updatedPreviews[index].url) // Clean up URL object
    updatedPreviews.splice(index, 1)
    setProductImagePreviews(updatedPreviews)
  }

  // Handle attribute selection
  const handleAttributeSelection = (attributeId, isChecked) => {
    if (isChecked) {
      // Add attribute to selected list
      const attribute = attributes.find(attr => attr.id === attributeId)
      if (attribute) {
        setSelectedAttributes([...selectedAttributes, {
          attribute_id: attribute.id,
          is_required: false,
          values: [],
          attribute: attribute
        }])
      }
    } else {
      // Remove attribute from selected list
      setSelectedAttributes(selectedAttributes.filter(attr => attr.attribute_id !== attributeId))
    }
  }

  // Handle attribute value selection
  const handleAttributeValueSelection = (attributeIndex, valueId, isChecked) => {
    const updatedAttributes = [...selectedAttributes]
    const attribute = updatedAttributes[attributeIndex]
    
    if (isChecked) {
      // Add value
      attribute.values.push({
        attribute_value_id: valueId,
        price_adjustment_rupees: '',
        price_adjustment_dollars: ''
      })
    } else {
      // Remove value
      const valueIndex = attribute.values.findIndex(v => v.attribute_value_id === valueId)
      if (valueIndex !== -1) {
        attribute.values.splice(valueIndex, 1)
      }
    }
    
    setSelectedAttributes(updatedAttributes)
  }

  // Handle variant attribute value selection
  const handleVariantAttributeValue = (variantIndex, attributeId, valueId) => {
    const updatedVariants = [...variants]
    const variant = updatedVariants[variantIndex]
    
    // Check if there's already a value for this attribute
    const existingValueIndex = variant.attribute_values.findIndex(
      av => attributes.find(attr => attr.id === attributeId)?.AttributeValues.find(val => val.id === av.attribute_value_id)?.attribute_id === attributeId
    )
    
    if (existingValueIndex !== -1) {
      // Update existing attribute value
      variant.attribute_values[existingValueIndex].attribute_value_id = valueId
    } else {
      // Add new attribute value
      variant.attribute_values.push({
        attribute_value_id: valueId
      })
    }
    
    setVariants(updatedVariants)
  }

  // Add a new variant
  const addVariant = () => {
    setVariants([...variants, {
      id: `new-${variants.length + 1}`,
      sku: '',
      price_rupees: '',
      price_dollars: '',
      stock_count: 0,
      stock_status: 'yes',
      weight: '',
      is_default: false,
      attribute_values: [],
      images: [],
      imagePreviews: []
    }])
  }

  // Remove a variant
  const removeVariant = (index) => {
    const updatedVariants = [...variants]
    
    // If removing the default variant, set the first remaining one as default
    if (updatedVariants[index].is_default && updatedVariants.length > 1) {
      const newDefaultIndex = index === 0 ? 1 : 0
      updatedVariants[newDefaultIndex].is_default = true
    }
    
    // Clean up image previews
    updatedVariants[index].imagePreviews.forEach(preview => {
      URL.revokeObjectURL(preview.url)
    })
    
    updatedVariants.splice(index, 1)
    setVariants(updatedVariants)
  }

  // Set variant as default
  const setVariantAsDefault = (index) => {
    const updatedVariants = [...variants]
    updatedVariants.forEach((variant, i) => {
      variant.is_default = i === index
    })
    setVariants(updatedVariants)
  }

  // Handle variant image selection
  const handleVariantImageSelection = (variantIndex, e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const updatedVariants = [...variants]
      
      // Update variant images
      updatedVariants[variantIndex].images = [
        ...updatedVariants[variantIndex].images,
        ...files
      ]
      
      // Create preview URLs
      const newPreviews = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }))
      
      updatedVariants[variantIndex].imagePreviews = [
        ...updatedVariants[variantIndex].imagePreviews || [],
        ...newPreviews
      ]
      
      setVariants(updatedVariants)
    }
  }

  // Handle removing a variant image
  const handleRemoveVariantImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...variants]
    
    // Remove image
    updatedVariants[variantIndex].images.splice(imageIndex, 1)
    
    // Remove and clean up preview
    URL.revokeObjectURL(updatedVariants[variantIndex].imagePreviews[imageIndex].url)
    updatedVariants[variantIndex].imagePreviews.splice(imageIndex, 1)
    
    setVariants(updatedVariants)
  }

  // Update variant field
  const updateVariantField = (variantIndex, field, value) => {
    const updatedVariants = [...variants]
    updatedVariants[variantIndex][field] = value
    setVariants(updatedVariants)
  }

  // Prepare form data with selected attributes and variants
  const prepareFormData = (data) => {
    // Add selected attributes
    data.attributes = selectedAttributes.map(attr => ({
      attribute_id: attr.attribute_id,
      is_required: attr.is_required,
      values: attr.values
    }))
    
    // Add variants if hasVariants is true
    if (data.hasVariants) {
      data.variants = variants.map(variant => ({
        sku: variant.sku,
        price_rupees: variant.price_rupees,
        price_dollars: variant.price_dollars,
        stock_count: variant.stock_count,
        stock_status: variant.stock_status,
        weight: variant.weight,
        is_default: variant.is_default,
        attribute_values: variant.attribute_values,
        images: variant.images
      }))
    }
    
    return data
  }

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      
      // Prepare complete form data
      const completeData = prepareFormData(data)
      
      // Send data to server
      const result = await createProduct(completeData)
      
      toast.success('Product created successfully!')
      
      // Reset form
      form.reset()
      setProductImagePreviews([])
      setSelectedAttributes([])
      setVariants([{
        id: 'new-1',
        sku: '',
        price_rupees: '',
        price_dollars: '',
        stock_count: 0,
        stock_status: 'yes',
        weight: '',
        is_default: true,
        attribute_values: [],
        images: [],
        imagePreviews: []
      }])
      setActiveTab('basic')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error.message || 'Failed to create product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check form completion status for each tab
  const isBasicInfoComplete = () => {
    const fields = ['title', 'cat_id', 'subcat_id', 'description', 'price_rupees', 'price_dollars'];
    return fields.every(field => form.getValues(field) && !form.getFieldState(field).error);
  };

  const isImagesComplete = () => {
    return productImagePreviews.length > 0;
  };

  const isAttributesComplete = () => {
    // Check if variant attributes have values selected when hasVariants is true
    if (hasVariants) {
      const variantAttributes = selectedAttributes.filter(attr => attr.attribute?.is_variant);
      return variantAttributes.every(attr => attr.values && attr.values.length > 0);
    }
    return true; // Not required if no variants
  };

  const isVariantsComplete = () => {
    if (!hasVariants) return true;
    return variants.every(variant => 
      variant.sku && 
      variant.price_rupees && 
      variant.price_dollars && 
      variant.attribute_values.length > 0
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product with all details</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      
      {/* Form completion progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Form Completion</span>
          <span className="text-sm font-medium">
            {[
              isBasicInfoComplete(),
              isImagesComplete(),
              isAttributesComplete(),
              hasVariants ? isVariantsComplete() : true
            ].filter(Boolean).length} of {hasVariants ? 4 : 3} sections complete
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all" 
            style={{ 
              width: `${
                ((isBasicInfoComplete() ? 1 : 0) + 
                (isImagesComplete() ? 1 : 0) + 
                (isAttributesComplete() ? 1 : 0) + 
                (hasVariants ? (isVariantsComplete() ? 1 : 0) : 0)) / 
                (hasVariants ? 4 : 3) * 100
              }%` 
            }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="variants" disabled={!hasVariants}>Variants</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>
                    Enter the basic information for your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Title*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cat_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(category => (
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.id.toString()}
                                  >
                                    {category.catName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcat_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory*</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!watchCategoryId || subcategories.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                              <SelectContent>
                                {subcategories.map(subcategory => (
                                  <SelectItem 
                                    key={subcategory.id} 
                                    value={subcategory.id.toString()}
                                  >
                                    {subcategory.subcategory}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="base_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              min="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_rupees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              min="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_dollars"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              min="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="stock_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Count</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              min="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Status</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">In Stock</SelectItem>
                                <SelectItem value="no">Out of Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity_limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              min="1" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum quantity per order
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="hasVariants"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Product Variants
                          </FormLabel>
                          <FormDescription>
                            Enable if this product has variants like different sizes, colors, etc.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('images')}>
                    Next: Images
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload high-quality images for your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="product-images"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG or WebP (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          id="product-images"
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          multiple
                          className="hidden"
                          onChange={handleImageSelection}
                        />
                      </label>
                    </div>

                    <FormMessage>
                      {form.formState.errors.images?.message}
                    </FormMessage>

                    {productImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {productImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-40 rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveProductImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2 bg-primary">
                                Main Image
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setActiveTab('basic')}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('attributes')}>
                    Next: Attributes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent value="attributes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Attributes</CardTitle>
                  <CardDescription>
                    Select attributes that define this product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attributes.map(attribute => (
                      <div 
                        key={attribute.id} 
                        className="flex items-center space-x-2 border rounded-md p-4"
                      >
                        <Checkbox 
                          id={`attr-${attribute.id}`}
                          checked={selectedAttributes.some(a => a.attribute_id === attribute.id)}
                          onCheckedChange={(checked) => 
                            handleAttributeSelection(attribute.id, checked)
                          }
                        />
                        <label
                          htmlFor={`attr-${attribute.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {attribute.display_name}
                        </label>
                        <Badge variant="outline">{attribute.type}</Badge>
                        {attribute.is_variant && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            Variant
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedAttributes.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Configure Selected Attributes</h3>
                      <Accordion type="multiple" className="w-full">
                        {selectedAttributes.map((attr, index) => (
                          <AccordionItem key={attr.attribute_id} value={`attr-${attr.attribute_id}`}>
                            <AccordionTrigger>
                              {attr.attribute.display_name}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`attr-req-${attr.attribute_id}`}
                                  checked={attr.is_required}
                                  onCheckedChange={(checked) => {
                                    const updated = [...selectedAttributes]
                                    updated[index].is_required = checked
                                    setSelectedAttributes(updated)
                                  }}
                                />
                                <label
                                  htmlFor={`attr-req-${attr.attribute_id}`}
                                  className="text-sm font-medium"
                                >
                                  Required
                                </label>
                              </div>

                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Values</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {attr.attribute.AttributeValues.map(value => (
                                    <div key={value.id} className="flex items-center justify-between border rounded-md p-3">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`attr-val-${attr.attribute_id}-${value.id}`}
                                          checked={attr.values.some(v => v.attribute_value_id === value.id)}
                                          onCheckedChange={(checked) => 
                                            handleAttributeValueSelection(index, value.id, checked)
                                          }
                                        />
                                        <label
                                          htmlFor={`attr-val-${attr.attribute_id}-${value.id}`}
                                          className="text-sm font-medium"
                                        >
                                          {value.display_value}
                                        </label>
                                        
                                        {attr.attribute.type === 'color' && value.color_code && (
                                          <div 
                                            className="w-6 h-6 rounded-full border"
                                            style={{ backgroundColor: value.color_code }}
                                          />
                                        )}
                                      </div>
                                      
                                      {attr.attribute.affects_price && 
                                       attr.values.some(v => v.attribute_value_id === value.id) && (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs">+₹</span>
                                          <Input
                                            type="number"
                                            className="w-20 h-8 text-xs"
                                            placeholder="0.00"
                                            value={
                                              attr.values.find(v => v.attribute_value_id === value.id)?.price_adjustment_rupees || ''
                                            }
                                            onChange={(e) => {
                                              const updatedAttrs = [...selectedAttributes]
                                              const valueIndex = updatedAttrs[index].values.findIndex(
                                                v => v.attribute_value_id === value.id
                                              )
                                              if (valueIndex !== -1) {
                                                updatedAttrs[index].values[valueIndex].price_adjustment_rupees = e.target.value
                                              }
                                              setSelectedAttributes(updatedAttrs)
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setActiveTab('images')}>
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab(hasVariants ? 'variants' : 'advanced')}
                  >
                    {hasVariants ? 'Next: Variants' : 'Next: Advanced'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Configure variants like different sizes, colors, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Variant selection guidance */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Creating Variants</h3>
                    <p className="text-sm text-blue-700">
                      Add different variants of your product (e.g., Small/Blue, Medium/Red). 
                      Each variant can have its own price, stock, and images.
                    </p>
                  </div>

                  {/* Variant List */}
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <Card key={variant.id} className={`border ${variant.is_default ? 'border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">Variant #{index + 1}</CardTitle>
                              {variant.is_default && (
                                <Badge className="bg-primary">Default</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!variant.is_default && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setVariantAsDefault(index)}
                                >
                                  Set as Default
                                </Button>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-8 w-8"
                                      disabled={variants.length === 1}
                                      onClick={() => removeVariant(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Remove variant</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-6">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">SKU*</label>
                              <Input
                                placeholder="SKU-001"
                                value={variant.sku}
                                onChange={(e) => updateVariantField(index, 'sku', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Price (₹)*</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={variant.price_rupees}
                                onChange={(e) => updateVariantField(index, 'price_rupees', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Price ($)*</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={variant.price_dollars}
                                onChange={(e) => updateVariantField(index, 'price_dollars', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Stock</label>
                              <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={variant.stock_count}
                                onChange={(e) => updateVariantField(index, 'stock_count', parseInt(e.target.value))}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Stock Status</label>
                              <Select 
                                value={variant.stock_status}
                                onValueChange={(value) => updateVariantField(index, 'stock_status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">In Stock</SelectItem>
                                  <SelectItem value="no">Out of Stock</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Weight (kg)</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={variant.weight}
                                onChange={(e) => updateVariantField(index, 'weight', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Variant Attributes */}
                          {selectedAttributes.some(attr => attr.attribute.is_variant) && (
                            <div className="mt-6">
                              <h4 className="text-sm font-medium mb-3">Variant Attributes</h4>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {selectedAttributes
                                  .filter(attr => attr.attribute.is_variant)
                                  .map(attr => (
                                    <div key={attr.attribute_id} className="space-y-2">
                                      <label className="text-sm font-medium">
                                        {attr.attribute.display_name}
                                      </label>
                                      <Select
                                        value={
                                          variant.attribute_values.find(
                                            av => attr.attribute.AttributeValues.find(
                                              val => val.id === av.attribute_value_id
                                            )?.attribute_id === attr.attribute_id
                                          )?.attribute_value_id?.toString() || ""
                                        }
                                        onValueChange={(value) => 
                                          handleVariantAttributeValue(
                                            index, 
                                            attr.attribute_id, 
                                            parseInt(value)
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder={`Select ${attr.attribute.display_name}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {attr.attribute.AttributeValues
                                            .filter(val => attr.values.some(v => v.attribute_value_id === val.id))
                                            .map(value => (
                                              <SelectItem 
                                                key={value.id} 
                                                value={value.id.toString()}
                                              >
                                                {value.display_value}
                                              </SelectItem>
                                            ))
                                          }
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}

                          {/* Variant Images */}
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Variant Images</h4>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-center w-full">
                                <label
                                  htmlFor={`variant-images-${index}`}
                                  className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-3 text-gray-500" />
                                    <p className="mb-2 text-xs text-gray-500">
                                      <span className="font-semibold">Click to upload</span> images for this variant
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      PNG, JPG or WebP (MAX. 5MB)
                                    </p>
                                  </div>
                                  <input
                                    id={`variant-images-${index}`}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleVariantImageSelection(index, e)}
                                  />
                                </label>
                              </div>

                              {variant.imagePreviews?.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3 md:grid-cols-4">
                                  {variant.imagePreviews.map((preview, imgIndex) => (
                                    <div key={imgIndex} className="relative group">
                                      <img
                                        src={preview.url}
                                        alt={`Variant ${index + 1} Preview ${imgIndex + 1}`}
                                        className="object-cover w-full h-32 rounded-lg"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                        onClick={() => handleRemoveVariantImage(index, imgIndex)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                      {imgIndex === 0 && (
                                        <Badge className="absolute bottom-1 left-1 bg-primary text-xs">
                                          Main
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Add variant button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={addVariant}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Variant
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setActiveTab('attributes')}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('advanced')}>
                    Next: Advanced
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Options</CardTitle>
                  <CardDescription>
                    Configure additional product details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="highlights"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Highlights</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Key highlights or features of the product..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each highlight on a new line or separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="terms_condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms & Conditions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Product-specific terms and conditions..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Any special terms that apply to this product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="hsn_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HSN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="HSN code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="free_shipping"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Shipping</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash on Delivery</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">SEO Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="meta_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input placeholder="SEO title" {...field} />
                            </FormControl>
                            <FormDescription>
                              Shown in search engine results (defaults to product title if empty)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meta_keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Keywords</FormLabel>
                            <FormControl>
                              <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated keywords for SEO
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meta_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description for search engines..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Short description shown in search results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setActiveTab(hasVariants ? 'variants' : 'attributes')}
                  >
                    Back
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button">Review & Submit</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Product Creation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to create this product? Please make sure all required information is correct.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={form.handleSubmit(onSubmit)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Product'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}