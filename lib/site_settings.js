// Global content edited once (phase 2: stored in `site_settings`, edited at /admin/settings).
// For the POC it is a static module shared by server and editor.

export const site_settings = {
  header: {
    nav_links: [
      { label: "Programs", href: "/programs" },
      { label: "Trainers", href: "/trainers" },
      { label: "Pricing", href: "/pricing-plans" },
      { label: "New to Knox", href: "/new-to-knox" },
      { label: "Reset:Retreats", href: "/reset-retreats" },
      { label: "Careers", href: "/careers" },
    ],
    cta: { label: "Schedule/Book Classes", href: "/schedule-class" },
  },
  studios: [
    {
      name: "New Delhi",
      address: "Opposite Flyover, Plot No. 34, DS Bawa, Basement Ring Road, Lajpat Nagar 4, New Delhi, South Delhi, Delhi 110024",
      maps_query: "Knox Fitness Lajpat Nagar 4 New Delhi",
    },
    {
      name: "Gurugram",
      address: "Ground Floor, 393, Udyog Vihar Phase 3 Rd, Phase II, Udyog Vihar, Sector 20, Gurugram, Haryana 122016",
      maps_query: "Knox Fitness Udyog Vihar Phase 3 Gurugram",
    },
  ],
  footer: {
    columns: [
      {
        title: "Connect",
        links: [
          { label: "Delhi : +91 93159-67142", href: "tel:+919315967142" },
          { label: "Gurugram : +91 93155-22626", href: "tel:+919315522626" },
          { label: "10 AM-6 PM, Monday-Saturday", href: "" },
          { label: "hello@knoxfit.in", href: "mailto:hello@knoxfit.in" },
          { label: "Instagram", href: "https://www.instagram.com/" },
          { label: "Facebook", href: "https://www.facebook.com/" },
        ],
      },
      {
        title: "Discover",
        links: [
          { label: "The Lab", href: "/programs" },
          { label: "Private Training", href: "/programs" },
          { label: "Combo Classes", href: "/programs" },
        ],
      },
      {
        title: "Member Area",
        links: [
          { label: "Download App", href: "https://appurl.io/" },
          { label: "Buy Credits", href: "/pricing-plans" },
          { label: "View Schedule", href: "/schedule-class" },
        ],
      },
      {
        title: "Info",
        links: [
          { label: "FAQ", href: "/new-to-knox" },
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms & Conditions", href: "/terms-and-conditions" },
          { label: "Careers", href: "/careers" },
        ],
      },
    ],
    copyright: "Copyright Knox Studio, 2025",
  },

  // How the tabbed price list is arranged. Category ids come from the packages
  // source; prices never live here.
  pricing_menu: [
    {
      id: "lab",
      label: "The Lab Credits",
      groups: [
        { heading: "First Timer Packs", category_id: "first_timer_lab" },
        { heading: "Lab Packs", category_id: "lab_packs" },
        { heading: "Unlimited Packs + PT Combo", category_id: "unlimited_pt_combo" },
      ],
    },
    {
      id: "pt",
      label: "Personal Training",
      tiers_heading: "Choose your training tier",
      default_tier: "plus",
      tiers: [
        { id: "first", label: "First Timer", groups: [{ heading: "First Timer Packs", category_id: "first_timer_pt" }] },
        { id: "select", label: "Knox Select", groups: [{ heading: "Membership Packs", category_id: "knox_select", split: "solo_duo" }] },
        { id: "plus", label: "Knox Plus", groups: [{ heading: "Membership Packs", category_id: "knox_plus", split: "solo_duo" }] },
      ],
    },
    {
      id: "gym",
      label: "Gym Access",
      groups: [{ heading: "Gym Access:", category_id: "gym_access" }],
    },
  ],
};
