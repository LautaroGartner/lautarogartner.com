import { Polar } from "@polar-sh/sdk";

function readCookie(req, name) {
  const encoded = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.slice(1).join("=");

  if (!encoded) return undefined;
  try { return decodeURIComponent(encoded); } catch { return encoded; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!accessToken || !productId) {
    return res.status(503).json({ error: "Checkout is not configured" });
  }

  const visitorId = readCookie(req, "datafast_visitor_id");
  const sessionId = readCookie(req, "datafast_session_id");
  const metadata = {};
  if (visitorId) metadata.datafast_visitor_id = visitorId;
  if (sessionId) metadata.datafast_session_id = sessionId;

  try {
    const polar = new Polar({ accessToken });
    const checkout = await polar.checkouts.create({
      products: [productId],
      metadata,
      successUrl: process.env.POLAR_SUCCESS_URL || "https://www.lautarogartner.com/web?checkout=success",
      returnUrl: "https://www.lautarogartner.com/web",
    });

    return res.status(200).json({ id: checkout.id, url: checkout.url });
  } catch (error) {
    console.error("Polar checkout creation failed", error);
    return res.status(502).json({ error: "Unable to create checkout" });
  }
}
