// Re-export product data from frontend for CMS usage
// Images are served from the frontend public folder

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: "cookie" | "energy-bar" | "desert-date";
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  discount: string;
  weight: string;
  description: string;
  benefits: string[];
  ingredients: string;
  nutritionHighlights: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Almond Protein Cookie",
    slug: "almond-protein-cookie",
    category: "cookie",
    image: "/virteez/Almond cookie box.jpeg",
    images: ["/virteez/Almond cookie box.jpeg", "/virteez/Almond cookies in plate.jpeg", "/virteez/Almond cookies in plate along with box.jpeg"],
    rating: 4.8, reviews: 34, price: 299, originalPrice: 399, discount: "25% OFF", weight: "200g (Pack of 6)",
    description: "Crunchy almond protein cookies loaded with real almonds and whey protein. Each cookie packs 10g of protein with no added sugar.",
    benefits: ["10g Protein per cookie", "No Added Sugar", "Real Almonds", "High Fibre"],
    ingredients: "Whey Protein Concentrate, Almonds (18%), Oat Flour, Coconut Oil, Stevia, Vanilla Extract, Salt.",
    nutritionHighlights: ["10g Protein", "5g Fibre", "0g Added Sugar", "150 Kcal"],
  },
  {
    id: 2,
    name: "Blueberry Protein Cookie",
    slug: "blueberry-protein-cookie",
    category: "cookie",
    image: "/virteez/Blueberry cookie box front side.jpeg",
    images: ["/virteez/Blueberry cookie box front side.jpeg", "/virteez/Blueberry cookies.jpeg", "/virteez/Blueberry cookies 2.jpeg"],
    rating: 4.9, reviews: 42, price: 299, originalPrice: 399, discount: "25% OFF", weight: "200g (Pack of 6)",
    description: "Bursting with real blueberries and packed with high-quality whey protein.",
    benefits: ["10g Protein per cookie", "Real Blueberries", "Antioxidant-rich", "No Added Sugar"],
    ingredients: "Whey Protein Concentrate, Dried Blueberries (15%), Oat Flour, Coconut Oil, Stevia, Natural Flavour, Salt.",
    nutritionHighlights: ["10g Protein", "4g Fibre", "0g Added Sugar", "145 Kcal"],
  },
  {
    id: 3,
    name: "Cashew Protein Cookie",
    slug: "cashew-protein-cookie",
    category: "cookie",
    image: "/virteez/Cashew cookie box.jpeg",
    images: ["/virteez/Cashew cookie box.jpeg", "/virteez/Cashew cookies in plate along with box.jpeg"],
    rating: 4.7, reviews: 28, price: 319, originalPrice: 429, discount: "25% OFF", weight: "200g (Pack of 6)",
    description: "Premium cashew-loaded protein cookies with a buttery crunch.",
    benefits: ["10g Protein per cookie", "Real Cashews", "Healthy Fats", "No Preservatives"],
    ingredients: "Whey Protein Concentrate, Cashew Nuts (17%), Oat Flour, Coconut Oil, Stevia, Vanilla, Salt.",
    nutritionHighlights: ["10g Protein", "4g Fibre", "0g Added Sugar", "160 Kcal"],
  },
  {
    id: 4,
    name: "Coconut Protein Cookie",
    slug: "coconut-protein-cookie",
    category: "cookie",
    image: "/virteez/Coconut cookie box.jpeg",
    images: ["/virteez/Coconut cookie box.jpeg", "/virteez/Coconut cookies in plate along with box.jpeg"],
    rating: 4.6, reviews: 22, price: 279, originalPrice: 379, discount: "26% OFF", weight: "200g (Pack of 6)",
    description: "Tropical coconut meets high-protein goodness.",
    benefits: ["10g Protein per cookie", "MCT from Coconut", "Natural Energy", "Gut Friendly"],
    ingredients: "Whey Protein Concentrate, Desiccated Coconut (16%), Oat Flour, Coconut Oil, Stevia, Salt.",
    nutritionHighlights: ["10g Protein", "5g Fibre", "0g Added Sugar", "155 Kcal"],
  },
  {
    id: 5,
    name: "Cranberry Protein Cookie",
    slug: "cranberry-protein-cookie",
    category: "cookie",
    image: "/virteez/Cranberry cookie box front side.jpeg",
    images: ["/virteez/Cranberry cookie box front side.jpeg", "/virteez/Cranberry cookies.jpeg"],
    rating: 4.7, reviews: 31, price: 299, originalPrice: 399, discount: "25% OFF", weight: "200g (Pack of 6)",
    description: "Tangy cranberry meets protein power.",
    benefits: ["10g Protein per cookie", "Real Cranberries", "Rich in Vitamin C", "No Added Sugar"],
    ingredients: "Whey Protein Concentrate, Dried Cranberries (14%), Oat Flour, Coconut Oil, Stevia, Natural Flavour, Salt.",
    nutritionHighlights: ["10g Protein", "4g Fibre", "0g Added Sugar", "148 Kcal"],
  },
  {
    id: 6,
    name: "Walnut Protein Cookie",
    slug: "walnut-protein-cookie",
    category: "cookie",
    image: "/virteez/Walnut cookie box.jpeg",
    images: ["/virteez/Walnut cookie box.jpeg", "/virteez/Walnut cookies in plate.jpeg"],
    rating: 4.8, reviews: 26, price: 329, originalPrice: 449, discount: "27% OFF", weight: "200g (Pack of 6)",
    description: "Omega-3 rich walnuts meet premium whey protein.",
    benefits: ["10g Protein per cookie", "Omega-3 Fatty Acids", "Brain Health", "No Added Sugar"],
    ingredients: "Whey Protein Concentrate, Walnut Pieces (16%), Oat Flour, Coconut Oil, Stevia, Cinnamon, Salt.",
    nutritionHighlights: ["10g Protein", "5g Fibre", "0g Added Sugar", "162 Kcal"],
  },
  {
    id: 7,
    name: "Assorted Cookie Box",
    slug: "assorted-cookie-box",
    category: "cookie",
    image: "/virteez/Assorted cookie box.jpeg",
    images: ["/virteez/Assorted cookie box.jpeg", "/virteez/Assorted cookie box left side.jpeg", "/virteez/All three infused cookies.jpeg"],
    rating: 5.0, reviews: 58, price: 549, originalPrice: 749, discount: "27% OFF", weight: "400g (12 Cookies)",
    description: "All our best-selling flavours in one box! A perfect gift with 12 protein cookies across all flavours.",
    benefits: ["All Flavours Included", "Great Gift Option", "10g Protein Each", "Best Value"],
    ingredients: "See individual cookie flavours for full ingredient details.",
    nutritionHighlights: ["10g Protein each", "12 Cookies", "0g Added Sugar", "All Flavours"],
  },
  {
    id: 8,
    name: "Protein Energy Bar",
    slug: "protein-energy-bar",
    category: "energy-bar",
    image: "/virteez/Energy bar with packaging.jpeg",
    images: ["/virteez/Energy bar with packaging.jpeg", "/virteez/Energy bar.jpeg", "/virteez/Energy bar closeup.jpeg"],
    rating: 4.9, reviews: 67, price: 149, originalPrice: 199, discount: "25% OFF", weight: "60g (Single Bar)",
    description: "A chewy, dense protein bar packed with 21g of grass-fed whey protein, real nuts, and dark chocolate chips.",
    benefits: ["21g Protein", "Pre/Post Workout", "No Artificial Sweeteners", "Grass-fed Whey"],
    ingredients: "Grass-fed Whey Protein Isolate, Dark Chocolate Chips, Oats, Peanut Butter, Honey, Almonds, Coconut Oil, Salt.",
    nutritionHighlights: ["21g Protein", "6g Fibre", "2g Added Sugar", "220 Kcal"],
  },
  {
    id: 9,
    name: "Protein Energy Bar — Pack of 6",
    slug: "protein-energy-bar-pack-6",
    category: "energy-bar",
    image: "/virteez/Energy bar with packaging.jpeg",
    images: ["/virteez/Energy bar with packaging.jpeg", "/virteez/Energy bar closeup.jpeg"],
    rating: 4.9, reviews: 45, price: 749, originalPrice: 1194, discount: "37% OFF", weight: "360g (Pack of 6)",
    description: "Stock up on your favourite protein bars! Six individually wrapped bars for the week.",
    benefits: ["6 Bars Pack", "21g Protein Each", "Week's Supply", "Best Value"],
    ingredients: "Grass-fed Whey Protein Isolate, Dark Chocolate Chips, Oats, Peanut Butter, Honey, Almonds, Coconut Oil, Salt.",
    nutritionHighlights: ["21g Protein each", "6 Bars", "2g Added Sugar", "220 Kcal each"],
  },
  {
    id: 10,
    name: "Desert Date Protein Drops",
    slug: "desert-date-protein-drops",
    category: "desert-date",
    image: "/virteez/Desert dates drops.jpeg",
    images: ["/virteez/Desert dates drops.jpeg", "/virteez/Desert date drops 2.jpeg"],
    rating: 4.5, reviews: 19, price: 249, originalPrice: 349, discount: "29% OFF", weight: "150g",
    description: "Naturally sweet desert dates coated in a protein-rich chocolate shell.",
    benefits: ["Natural Sweetness", "Superfood Dates", "Protein-coated", "No Refined Sugar"],
    ingredients: "Whey Protein Concentrate, Desert Dates, Dark Chocolate, Coconut Oil, Stevia.",
    nutritionHighlights: ["8g Protein", "3g Fibre", "0g Refined Sugar", "130 Kcal"],
  },
];

export const categories = [
  { key: "all", label: "All Products" },
  { key: "cookie", label: "Protein Cookies" },
  { key: "energy-bar", label: "Energy Bars" },
  { key: "desert-date", label: "Desert Date Drops" },
] as const;

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: number) {
  return products.find((p) => p.id === id);
}

// Category label map for display
export const categoryLabels: Record<string, string> = {
  cookie: "Cookies",
  "energy-bar": "Energy Bars",
  "desert-date": "Snacks",
};
