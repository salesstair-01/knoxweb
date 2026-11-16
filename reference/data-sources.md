# Client-loaded data (from network log)

## Pricing → `knoxfit.in/api/zoho/items?category_name=<name>`
A Next API route on the current site proxying a Zoho Books item store (Mongo-ish `_id`, `last_synced_at` → a synced cache, likely your middleware or the vendor's).

Categories requested: `First_Timer (Lab Trial)`, `Lab_Packs`, `Unlimited + PT Combo`, `First_Time (PT Trial)`, `Knox_Select`, `Knox_Plus`, `Gym_Access`.

Item fields used for display: `item_id`, `name`, `rate` (INR, pre-tax: shown as `₹{rate}++`), `description`, `category_name`, `status`. Tax info in `item_tax_preferences` (GST 5%).

Tab structure on the page:
- **The Lab Credits** → First Timer Packs (`First Timer (Lab Trial)`), Lab Packs, Unlimited Packs + PT Combo
- **Personal Training** → tier sub-tabs First Timer / Knox Select / Knox Plus, each split into Solo and Duo by item name
- **Gym Access** → Gym Access

## Everything else → Strapi at `strapi-knoxstage.forklyft.in`
Programs, trainers, "speak to our trainer", reset retreats. **Note: the production site reads from the vendor's *staging* Strapi.** That content needs migrating before the vendor is cut off.

Home page content is server-rendered (no client fetches seen besides Google Maps/Places and an `/api/auth/refresh` 401).
