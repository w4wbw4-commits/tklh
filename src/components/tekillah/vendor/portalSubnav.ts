// Section sub-navigation definitions. Kept out of the layout component file so
// fast refresh stays intact (a module must export only components for HMR).
export const BOOKINGS_SUBNAV = [
  { to: "/partner/bookings", label: "الطلبات والتقويم" },
  { to: "/partner/calendar", label: "التقويم الكامل" },
  { to: "/partner/pricing", label: "التسعير والعروض" },
  { to: "/partner/checklists", label: "قوائم المهام" },
];

export const REPORTS_SUBNAV = [
  { to: "/partner/reports", label: "التقارير الشهرية" },
  { to: "/partner/invoices", label: "الفواتير الضريبية" },
  { to: "/partner/sales", label: "المبيعات" },
  { to: "/partner/analytics", label: "التحليلات" },
];
