// ---------------------------------------------------------------------------
// Dummy dashboard data.
// Every shape here is intentionally close to what the real API will return,
// so swapping a `const` for a `fetch`/React Query call later is a
// near-zero-diff change — components only ever consume this via props.
// ---------------------------------------------------------------------------

/**
 * KPI stat cards. `icon` is a string key resolved to a lucide-react
 * component in StatCard.jsx (keeps this file component-free).
 * `sparkline` is a short recent trend used for the mini chart.
 */
export const statsData = [
  {
    id: "products",
    label: "Total Products",
    value: 27,
    formattedValue: "27",
    delta: 10,
    deltaLabel: "+10",
    trend: "up",
    icon: "package",
    sparkline: [4, 6, 5, 8, 7, 9, 10, 12, 11, 14],
  },
  {
    id: "customers",
    label: "Total Customers",
    value: 250,
    formattedValue: "250",
    delta: 3.6,
    deltaLabel: "+3.6%",
    trend: "up",
    icon: "users",
    sparkline: [180, 190, 200, 195, 210, 220, 230, 225, 240, 250],
  },
  {
    id: "orders",
    label: "Total Orders",
    value: 1500,
    formattedValue: "1,500",
    delta: -2.0,
    deltaLabel: "-2.0%",
    trend: "down",
    icon: "cart",
    sparkline: [1600, 1580, 1620, 1550, 1590, 1540, 1560, 1520, 1510, 1500],
  },
  {
    id: "sales",
    label: "Total Sales",
    value: 2500000,
    formattedValue: "\u20B925,00,000",
    delta: 3.6,
    deltaLabel: "+3.6%",
    trend: "up",
    icon: "rupee",
    sparkline: [18, 21, 19, 22, 24, 50, 26, 23, 30, 25],
  },
];

/** Monthly revenue vs cost of goods (ties to the `cost2cost` product field). */
export const revenueData = [
  { month: "Jan", revenue: 180000, cost: 90000 },
  { month: "Feb", revenue: 210000, cost: 100000 },
  { month: "Mar", revenue: 190000, cost: 95000 },
  { month: "Apr", revenue: 220000, cost: 105000 },
  { month: "May", revenue: 240000, cost: 110000 },
  { month: "Jun", revenue: 500000, cost: 200000 },
  { month: "Jul", revenue: 260000, cost: 120000 },
  { month: "Aug", revenue: 230000, cost: 108000 },
  { month: "Sep", revenue: 300000, cost: 140000 },
  { month: "Oct", revenue: 250000, cost: 118000 },
  { month: "Nov", revenue: 270000, cost: 125000 },
  { month: "Dec", revenue: 310000, cost: 145000 },
];

/**
 * New vs returning customers. Colors reference CSS custom properties
 * (with hex fallbacks) so the chart follows the active theme automatically.
 */
export const customerSplitData = [
  { name: "Returning", value: 165, color: "var(--chart-1, #8B1538)" },
  { name: "New", value: 85, color: "var(--chart-2, #D4A574)" },
];

/** Low-stock / out-of-stock watchlist. `stock` is treated as a 0–100 fill. */
export const stockReportData = [
  {
    id: "sku-raw-whey",
    name: "Raw Whey Isolate 2kg",
    sku: "PWN-2481",
    price: "\u20B94,499",
    stock: 0,
    status: "out",
  },
  {
    id: "sku-creatine",
    name: "Creatine Monohydrate 300g",
    sku: "CRM-1187",
    price: "\u20B91,199",
    stock: 6,
    status: "low",
  },
  {
    id: "sku-fatburner",
    name: "Thermogenic Fat Burner",
    sku: "TFB-3390",
    price: "\u20B91,899",
    stock: 42,
    status: "high",
  },
  {
    id: "sku-preworkout",
    name: "Pre-Workout Nitro Blast",
    sku: "PWN-5521",
    price: "\u20B91,699",
    stock: 9,
    status: "low",
  },
  {
    id: "sku-bcaa",
    name: "BCAA 2:1:1 400g",
    sku: "BCA-7742",
    price: "\u20B91,099",
    stock: 55,
    status: "high",
  },
];

/** Best-selling products table. */
export const topProductsData = [
  {
    id: "top-preworkout",
    name: "Pre-Workout Nitro Blast",
    sku: "#PWN2481",
    price: "\u20B91,699",
    discount: 15,
    sold: 300,
    orders: 70,
  },
  {
    id: "top-whey",
    name: "Whey Protein Gold 2kg",
    sku: "#WPG2148",
    price: "\u20B94,299",
    discount: null,
    sold: 260,
    orders: 65,
  },
  {
    id: "top-fatburner",
    name: "Thermogenic Fat Burner",
    sku: "#TFB3390",
    price: "\u20B91,899",
    discount: 10,
    sold: 210,
    orders: 58,
  },
  {
    id: "top-creatine",
    name: "Creatine Monohydrate 300g",
    sku: "#CRM1187",
    price: "\u20B91,199",
    discount: 5,
    sold: 190,
    orders: 50,
  },
  {
    id: "top-massgainer",
    name: "Mass Gainer 3kg",
    sku: "#MSG5521",
    price: "\u20B93,499",
    discount: null,
    sold: 140,
    orders: 40,
  },
];

/** Options for the period Select in DashboardHeader. */
export const periodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];