import { site_settings } from "@/lib/site_settings";
import { font_class_names } from "@/app/fonts";
import Header from "./chrome/Header";
import Footer from "./chrome/Footer";
import HeroCarousel from "./blocks/HeroCarousel";
import IntroText from "./blocks/IntroText";
import ImageCards from "./blocks/ImageCards";
import ProgramFeature from "./blocks/ProgramFeature";
import Ticker from "./blocks/Ticker";
import Accordion from "./blocks/Accordion";
import FeatureSlider from "./blocks/FeatureSlider";
import HeadingCta from "./blocks/HeadingCta";
import LinkTiles from "./blocks/LinkTiles";
import Studios from "./blocks/Studios";
import PageTitle from "./blocks/PageTitle";
import PackageGrid from "./blocks/PackageGrid";
import OfferBanner from "./blocks/OfferBanner";
import Spacer from "./blocks/Spacer";

// Editors get fields and preset variants only: no colours, CSS or HTML.

// Puck adds a `puck` helper prop (contains functions). Strip it so client
// components only receive plain, serialisable props on the server render.
function plain(Component) {
  function PlainBlock({ puck, editMode, ...props }) {
    return <Component {...props} />;
  }
  PlainBlock.displayName = `Plain(${Component.name})`;
  return PlainBlock;
}

const image_field = (label = "Image URL") => ({ type: "text", label });
const link_field = (label = "Button link") => ({ type: "text", label });

const limited_richtext = {
  type: "richtext",
  options: {
    blockquote: false, bulletList: false, code: false, codeBlock: false, heading: false,
    horizontalRule: false, listItem: false, orderedList: false, strike: false,
    textAlign: false, underline: false,
  },
};

function category_options() {
  const options = [];
  const seen = new Set();
  const add_groups = (groups) => {
    for (const group of groups) {
      if (!seen.has(group.category_id)) {
        seen.add(group.category_id);
        options.push({ label: group.heading, value: group.category_id });
      }
    }
  };
  for (const tab of site_settings.pricing_menu) {
    if (tab.tiers) {
      for (const tier of tab.tiers) add_groups(tier.groups.map((group) => ({ ...group, heading: `${tier.label}: ${group.heading}` })));
    } else {
      add_groups(tab.groups);
    }
  }
  return options;
}

export const config = {
  categories: {
    hero: { title: "Hero", components: ["HeroCarousel", "PageTitle"] },
    content: { title: "Content", components: ["IntroText", "ImageCards", "ProgramFeature", "FeatureSlider", "HeadingCta", "Accordion", "LinkTiles"] },
    commerce: { title: "Pricing & offers", components: ["PackageGrid", "OfferBanner"] },
    global: { title: "Global", components: ["Studios"] },
    layout: { title: "Layout", components: ["Ticker", "Spacer"] },
  },

  root: {
    fields: {
      title: { type: "text", label: "Page title (browser tab / SEO)" },
      header_style: {
        type: "radio",
        label: "Header",
        options: [
          { label: "Over hero image", value: "overlay" },
          { label: "Solid", value: "solid" },
        ],
      },
    },
    defaultProps: { title: "New page", header_style: "solid" },
    render: ({ children, header_style }) => (
      <div className={font_class_names} style={{ background: "var(--c-bg)", color: "var(--c-text)", fontFamily: "var(--ff-body)", minHeight: "100vh", position: "relative" }}>
        <Header overlay={header_style === "overlay"} />
        <main>{children}</main>
        <Footer />
      </div>
    ),
  },

  components: {
    HeroCarousel: {
      label: "Hero carousel",
      fields: {
        slides: {
          type: "array",
          label: "Slides",
          min: 1,
          max: 8,
          getItemSummary: (slide, index) => slide.alt || `Slide ${index + 1}`,
          arrayFields: {
            image: image_field("Desktop image URL"),
            mobile_image: image_field("Mobile image URL (optional)"),
            alt: { type: "text", label: "Alt text" },
            heading: { type: "text", label: "Heading override (optional)" },
            button_label: { type: "text", label: "Button label override (optional)" },
            button_link: { type: "text", label: "Button link override (optional)" },
          },
          defaultItemProps: { image: "", mobile_image: "", alt: "", heading: "", button_label: "", button_link: "" },
        },
        heading: { type: "text", label: "Heading" },
        text: { type: "textarea", label: "Panel text" },
        button_label: { type: "text", label: "Button label" },
        button_link: link_field(),
        show_counter: { type: "radio", label: "Show counter + arrows", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
        autoplay_seconds: { type: "number", label: "Autoplay (seconds, 0 = off)", min: 0, max: 20 },
      },
      defaultProps: { slides: [], heading: "", text: "", button_label: "", button_link: "", show_counter: true, autoplay_seconds: 6 },
      render: plain(HeroCarousel),
    },

    PageTitle: {
      label: "Page title",
      fields: {
        title: { type: "text", label: "Title" },
        columns: { type: "array", label: "Intro columns", max: 3, arrayFields: { text: { type: "textarea", label: "Text" } }, defaultItemProps: { text: "" } },
      },
      defaultProps: { title: "Page title", columns: [] },
      render: plain(PageTitle),
    },

    IntroText: {
      label: "Intro text",
      fields: {
        label: { type: "text", label: "Section label" },
        lead: { ...limited_richtext, label: "Lead text" },
        aside_text: { type: "textarea", label: "Side prompt (optional)" },
        aside_button_label: { type: "text", label: "Side button label" },
        aside_button_link: link_field("Side button link"),
        cards: {
          type: "array", label: "Image cards (optional)", max: 6,
          getItemSummary: (item) => item.label || "Card",
          arrayFields: { image: image_field(), label: { type: "text", label: "Caption" }, link: { type: "text", label: "Link" } },
          defaultItemProps: { image: "", label: "Card", link: "" },
        },
        spacing: { type: "radio", label: "Spacing", options: [{ label: "Normal", value: "normal" }, { label: "Compact", value: "compact" }] },
      },
      defaultProps: { label: "Welcome", lead: "<p>Lead text</p>", aside_text: "", aside_button_label: "", aside_button_link: "", cards: [], spacing: "normal" },
      render: plain(IntroText),
    },

    ImageCards: {
      label: "Image cards",
      fields: {
        items: {
          type: "array", label: "Cards", min: 1, max: 6,
          getItemSummary: (item) => item.label || "Card",
          arrayFields: { image: image_field(), label: { type: "text", label: "Caption" }, link: { type: "text", label: "Link" } },
          defaultItemProps: { image: "", label: "Card", link: "" },
        },
      },
      defaultProps: { items: [] },
      render: plain(ImageCards),
    },

    ProgramFeature: {
      label: "Program feature",
      fields: {
        label: { type: "text", label: "Section label" },
        image: image_field(),
        ticker_items: { type: "array", label: "Ticker words", max: 6, arrayFields: { text: { type: "text", label: "Text" } }, defaultItemProps: { text: "" } },
        eyebrow: { type: "text", label: "Program name (mobile)" },
        headline: { type: "text", label: "Headline" },
        highlight: { type: "text", label: "Highlighted part (lime)" },
        button_label: { type: "text", label: "Button label" },
        button_link: link_field(),
      },
      defaultProps: { label: "Our Programs", image: "", ticker_items: [], eyebrow: "", headline: "Headline", highlight: "", button_label: "", button_link: "" },
      render: plain(ProgramFeature),
    },

    FeatureSlider: {
      label: "Feature slider",
      fields: {
        label: { type: "text", label: "Section label" },
        slides: {
          type: "array", label: "Slides", min: 1, max: 6,
          getItemSummary: (slide, index) => slide.title || `Slide ${index + 1}`,
          arrayFields: {
            image: image_field(),
            kicker: { type: "text", label: "Kicker" },
            kicker_strong: { type: "text", label: "Kicker (bold line)" },
            title: { type: "text", label: "Title" },
            body: { ...limited_richtext, label: "Body" },
            button_label: { type: "text", label: "Button label" },
            button_link: link_field(),
          },
          defaultItemProps: { image: "", kicker: "", kicker_strong: "", title: "", body: "", button_label: "", button_link: "" },
        },
      },
      defaultProps: { label: "Stay in the know", slides: [] },
      render: plain(FeatureSlider),
    },

    HeadingCta: {
      label: "Heading + button",
      fields: {
        heading: { type: "textarea", label: "Heading" },
        button_label: { type: "text", label: "Button label" },
        button_link: link_field(),
        variant: { type: "radio", label: "Variant", options: [{ label: "Plain", value: "plain" }, { label: "With side images", value: "side_images" }] },
        left_image: image_field("Left image URL"),
        right_image: image_field("Right image URL"),
      },
      resolveFields: (data, { fields }) => {
        if (data.props.variant === "side_images") return fields;
        const { left_image, right_image, ...rest } = fields;
        return rest;
      },
      defaultProps: { heading: "Heading", button_label: "Learn more", button_link: "", variant: "plain", left_image: "", right_image: "" },
      render: plain(HeadingCta),
    },

    Accordion: {
      label: "Accordion / FAQ",
      fields: {
        label: { type: "text", label: "Section label" },
        heading: { type: "textarea", label: "Heading" },
        body: { type: "textarea", label: "Intro" },
        items: {
          type: "array", label: "Items",
          getItemSummary: (item) => item.question || "Item",
          arrayFields: { question: { type: "text", label: "Question / title" }, answer: { ...limited_richtext, label: "Answer" } },
          defaultItemProps: { question: "Question", answer: "<p>Answer</p>" },
        },
        layout: { type: "radio", label: "Layout", options: [{ label: "Side by side", value: "split" }, { label: "Stacked", value: "stacked" }] },
      },
      defaultProps: { label: "FAQ", heading: "", body: "", items: [], layout: "split" },
      render: plain(Accordion),
    },

    LinkTiles: {
      label: "Testimonial + link tiles",
      fields: {
        label: { type: "text", label: "Section label" },
        testimonials: {
          type: "array", label: "Testimonials", max: 8,
          getItemSummary: (item) => item.name || "Testimonial",
          arrayFields: { quote: { type: "textarea", label: "Quote" }, name: { type: "text", label: "Name" }, location: { type: "text", label: "Location" }, avatar: image_field("Photo URL") },
          defaultItemProps: { quote: "", name: "", location: "", avatar: "" },
        },
        tiles: {
          type: "array", label: "Tiles", max: 4,
          getItemSummary: (item) => item.title || "Tile",
          arrayFields: {
            title: { type: "textarea", label: "Title" },
            link: { type: "text", label: "Link" },
            badge: { type: "radio", label: "Corner", options: [{ label: "Arrow", value: "arrow" }, { label: "App QR code", value: "qr" }] },
          },
          defaultItemProps: { title: "Tile", link: "", badge: "arrow" },
        },
      },
      defaultProps: { label: "Where do you need to go?", testimonials: [], tiles: [] },
      render: plain(LinkTiles),
    },

    Studios: {
      label: "Our studios (global)",
      fields: {
        label: { type: "text", label: "Section label" },
        show_map: { type: "radio", label: "Show map", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
      },
      defaultProps: { label: "Our Studios", show_map: true },
      render: plain(Studios),
    },

    PackageGrid: {
      label: "Packages (live prices)",
      fields: {
        mode: { type: "radio", label: "Show", options: [{ label: "Full price list (tabs)", value: "tabs" }, { label: "One category", value: "category" }] },
        default_tab: { type: "select", label: "Default tab", options: site_settings.pricing_menu.map((tab) => ({ label: tab.label, value: tab.id })) },
        category_id: { type: "select", label: "Category", options: category_options() },
        heading: { type: "text", label: "Heading (optional)" },
      },
      resolveFields: (data, { fields }) => {
        const { default_tab, category_id, heading, ...rest } = fields;
        return data.props.mode === "category" ? { ...rest, category_id, heading } : { ...rest, default_tab };
      },
      // Prices are never stored: `catalog` is filled from the packages source at render time.
      resolveData: async (data, { metadata }) => {
        const catalog = metadata && metadata.load_catalog
          ? await metadata.load_catalog({ mode: data.props.mode, category_id: data.props.category_id, heading: data.props.heading })
          : null;
        return { props: { catalog } };
      },
      defaultProps: { mode: "category", default_tab: "lab", category_id: "lab_packs", heading: "" },
      render: plain(PackageGrid),
    },

    OfferBanner: {
      label: "Offer banner",
      fields: {
        heading: { type: "text", label: "Heading" },
        text: { type: "textarea", label: "Text" },
        button_label: { type: "text", label: "Button label" },
        button_link: link_field(),
        countdown_to: { type: "text", label: "Countdown to (YYYY-MM-DD HH:MM, optional)" },
        style_variant: { type: "radio", label: "Style", options: [{ label: "Lime", value: "lime" }, { label: "Dark", value: "dark" }] },
      },
      defaultProps: { heading: "Limited offer", text: "", button_label: "Buy now", button_link: "/pricing-plans", countdown_to: "", style_variant: "lime" },
      render: plain(OfferBanner),
    },

    Ticker: {
      label: "Ticker",
      fields: {
        items: { type: "array", label: "Words", max: 6, arrayFields: { text: { type: "text", label: "Text" } }, defaultItemProps: { text: "" } },
        style_variant: { type: "radio", label: "Style", options: [{ label: "Lime", value: "lime" }, { label: "Glass", value: "glass" }] },
      },
      defaultProps: { items: [{ text: "New year new you" }, { text: "Trial offers" }], style_variant: "lime" },
      render: plain(Ticker),
    },

    Spacer: {
      label: "Spacer / divider",
      fields: {
        size: { type: "radio", label: "Size", options: [{ label: "S", value: "sm" }, { label: "M", value: "md" }, { label: "L", value: "lg" }] },
        divider: { type: "radio", label: "Divider line", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
      },
      defaultProps: { size: "md", divider: false },
      render: plain(Spacer),
    },
  },
};

export default config;
