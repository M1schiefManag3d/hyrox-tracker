// Recipe content sourced from Hyrox - Sauces & Recipes.md and Hyrox - Nutrition.md
const RECIPE_DATA = {
  proteins: [
    {
      name: "Grilled/Baked Chicken Thighs",
      costco: "Kirkland Signature boneless skinless chicken thighs (large pack — freeze half)",
      method: "Olive oil, salt, pepper, paprika — 400°F, 25 min"
    },
    {
      name: "Ground Turkey or Beef, Taco-Seasoned",
      costco: "Kirkland ground turkey or ground beef (bulk pack, portion and freeze)",
      method: "Brown with GF taco seasoning (Simply Organic / McCormick GF if Costco's own isn't confirmed GF)"
    },
    {
      name: "Baked Salmon",
      costco: "Costco fresh or frozen individually-wrapped Atlantic salmon portions",
      method: "Olive oil, salt, lemon — 400°F, 12-15 min"
    },
    {
      name: "Zero-Cook Backup",
      costco: "Kirkland canned tuna or Kirkland/Eden canned chickpeas (multi-pack)",
      method: "No cooking — pantry staple for busy weeks"
    },
    {
      name: "Sheet-Pan Egg Muffins",
      costco: "Costco 24-pack eggs, tri-color pepper bag, yellow onion bag, Kirkland organic baby spinach",
      method: "Dice peppers/onion/spinach into 12 eggs, salt/pepper, muffin tin, 350°F 18-20 min. Makes 12, ~6g protein each."
    }
  ],
  sauces: [
    {
      name: "Lemon-Tahini Sauce",
      tags: ["dairy-free", "gluten-free"],
      ingredients: ["1/4 cup tahini", "juice of 1 lemon", "1 clove garlic, minced", "2-4 tbsp water to thin", "salt to taste"],
      method: "Whisk together, add water until pourable.",
      note: "Costco tahini stock varies by location — one jar lasts months, order online if unavailable."
    },
    {
      name: "Peanut-Lime Sauce",
      tags: [],
      ingredients: ["1/4 cup Kirkland natural peanut butter", "1 tbsp GF tamari (not soy sauce)", "juice of 1 lime", "1 tsp honey", "1 tsp rice vinegar", "water to thin"],
      method: "Whisk together. Great over rice bowls with chicken or tofu.",
      note: "GF tamari isn't reliably at Costco — San-J brand as fallback."
    },
    {
      name: "Chimichurri",
      tags: [],
      ingredients: ["1 cup parsley", "2 tbsp oregano", "3 cloves garlic", "1/3 cup olive oil", "2 tbsp red wine vinegar", "chili flakes", "salt"],
      method: "Blend or chop fine. Great on beef/salmon bowls.",
      note: "Costco herb packs and pre-peeled garlic cut prep time."
    },
    {
      name: "Greek Yogurt Ranch-Style",
      tags: ["high-protein"],
      ingredients: ["1 cup Kirkland plain Greek yogurt", "1 tbsp GF ranch seasoning (or dill/garlic/onion powder mix)", "splash of water/lemon to thin"],
      method: "Whisk together.",
      note: "If Costco ranch seasoning isn't confirmed GF, mix your own from pantry spices."
    },
    {
      name: "Simple Vinaigrette",
      tags: [],
      ingredients: ["3 tbsp olive oil", "1 tbsp red wine or balsamic vinegar", "1 tsp mustard", "salt/pepper"],
      method: "Shake together in a jar.",
      note: "Kirkland olive oil, red wine vinegar, and Dijon mustard cover this fully."
    }
  ],
  breakfasts: [
    { name: "Greek Yogurt Power Bowl", protein: "~35g", method: "1.5 cups plain Greek yogurt, handful berries, 2 tbsp GF granola or walnuts, drizzle honey." },
    { name: "Savory Yogurt Bowl", protein: "~30g", method: "Greek yogurt whisked with salt/garlic powder, top with soft-boiled egg, everything bagel seasoning (check GF), cucumber." },
    { name: "3-Egg Scramble", protein: "~25g", method: "3 eggs, spinach, tomato, dairy-free cheese if desired, side of sourdough toast." },
    { name: "Sheet-Pan Egg Muffins", protein: "~18g (3 muffins)", method: "Batch-cook Sunday — see Proteins tab." }
  ],
  groceryList: {
    "Protein": ["Kirkland boneless skinless chicken thighs", "Kirkland ground turkey or beef", "Costco fresh/frozen salmon portions", "Costco 24-pack eggs", "Kirkland plain Greek yogurt (large tub)", "Kirkland canned tuna / chickpeas"],
    "Produce": ["Kirkland organic baby spinach", "Tri-color bell pepper bag", "Yellow onion bag", "Cherry tomato box", "English cucumber bag", "Avocado bag", "Citrus bag (lemons/limes)", "Pre-peeled garlic bag", "Organic parsley", "Kirkland frozen mixed berries", "Frozen roasted/Normandy veg blend"],
    "Carbs/Bases": ["Kirkland jasmine or basmati rice", "Kirkland organic quinoa", "Sweet potato bag", "Costco bakery sourdough loaf", "Bob's Red Mill GF oats or GF granola", "GF pasta (check local stock, or Barilla/Jovial elsewhere)"],
    "Pantry/Sauce": ["Kirkland olive oil", "Kirkland natural peanut butter", "Kirkland red wine vinegar", "Rice vinegar", "Dijon mustard", "Honey", "Dried dill/garlic/onion powder, oregano, paprika, chili flakes, salt/pepper", "Tahini (check stock)", "GF tamari (check stock, San-J fallback)", "GF taco/ranch seasoning (check labels)"]
  },
  weeklyRhythm: [
    "Sunday: Batch-cook 2-3 proteins, one sauce, egg muffins if doing egg breakfasts, grocery shop",
    "Every 2 weeks: reassess weight trend, adjust calories ±150-200 kcal if flat when it shouldn't be"
  ]
};
