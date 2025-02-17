import React from "react";

const CategoryList = () => {
  // Dummy categories and subcategories
  const categories = [
    {
      name: "Electronics",
      subcategories: ["Smartphones", "Laptops", "Accessories"],
    },
    {
      name: "Fashion",
      subcategories: ["Men", "Women", "Kids"],
    },
    {
      name: "Home & Kitchen",
      subcategories: ["Furniture", "Appliances", "Decor"],
    },
    {
      name: "Sports",
      subcategories: ["Fitness", "Outdoor", "Team Sports"],
    },
    {
      name: "Sports2",
      subcategories: ["Fitness2", "Outdoor2", "Team Sports2"],
    },
  ];

  return (
    <div className="w-full p-2 flex justify-start">
      <div className="flex gap-4 flex-wrap">
        {categories.map((category, index) => (
          <div key={index} className="relative group">
            {/* Main Category */}
            <div className="px-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-200 tracking-[0px] font-semibold md:font-medium text-sm ">
              {category.name}
            </div>

            {/* Subcategories (shown on hover) */}
            <div className="absolute top-full z-[9999] left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {category.subcategories.map((subcategory, subIndex) => (
                <div
                  key={subIndex}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  {subcategory}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
