import { CMS } from "../src";

async function trackLeadExample() {
  const cms = new CMS({
    apiKey: "your_api_key",
    baseUrl: "https://dev.url.com",
  });

  try {
    console.log("\n📝 Tracking lead in deferred mode (step 1)...");
    const deferredLeadResponse = await cms.trackLead({
      clickId: "Zug6qD9qOC",
      eventName: "signup_initiated",
      customerExternalId: "user_demo_0099",
      customerName: "My Demo",
      customerEmail: "my@example.com",
      mode: "deferred",
    });
    console.log("✅ Deferred lead (step 1) tracked:", deferredLeadResponse);

    const followUpResponse = await cms.trackLead({
      customerExternalId: "user_demo_0099",
      eventName: "email_verified"
    });
    console.log("✅ Deferred follow-up tracked:", followUpResponse);

  } catch (error) {
    console.error("❌ Error tracking lead:", error);
  }
}

trackLeadExample();
