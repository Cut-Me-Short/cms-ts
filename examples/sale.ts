import { CMS } from "../src";

async function trackSaleExample() {
  const cms = new CMS({
    apiKey: "your_api_key",
    baseUrl: "https://dev.url.com",
  });

  try {

    const fullSaleResponse = await cms.trackSale({
      eventName: "cms_purchase_completed",
      customerExternalId: "user_799",
      customerName: "AK Thala",
      customerEmail: "thala@ak.com",
      invoiceId: "inv_001",
      amount: 299.99, 
      currency: "INR",
      timestamp: new Date().toISOString(),
    });
    console.log("Full sale tracked:", fullSaleResponse);

  } catch (error) {
    console.error("❌ Error tracking sale:", error);
  }
}

trackSaleExample();
