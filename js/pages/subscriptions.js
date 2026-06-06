import { listSubscriptions } from "../api/youtube.js";
import { renderSubscriptionList, section } from "../ui/render.js";

export async function renderSubscriptions() {
  const data = await listSubscriptions();
  return section("Subscriptions", renderSubscriptionList(data.items || []));
}
