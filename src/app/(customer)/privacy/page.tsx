import React from "react";

export const metadata = {
  title: "Privacy Policy | Pandit Ji Ka Dhaba",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#fbf7ef] min-h-screen py-16">
      <div className="container-dhaba max-w-3xl bg-white p-8 md:p-12 rounded-3xl border border-[#e9e1d4] shadow-sm space-y-6">
        <h1 className="font-serif-dhaba font-bold text-3xl text-[#102a43]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#6c7b87]">Last updated: October 2026</p>

        <section className="space-y-3 text-xs text-[#526575] leading-relaxed">
          <h2 className="font-bold text-sm text-[#102a43]">1. Information We Collect</h2>
          <p>
            When you place an order or book a table with Pandit Ji Ka Dhaba, we collect your name, phone number, delivery address, and optionally email to process your food delivery and customer support communications.
          </p>

          <h2 className="font-bold text-sm text-[#102a43]">2. Use of WhatsApp</h2>
          <p>
            Our order handoff and notification system allows you to communicate with the restaurant staff directly via WhatsApp. We never send unsolicited spam messages.
          </p>

          <h2 className="font-bold text-sm text-[#102a43]">3. Payment Security</h2>
          <p>
            Online payments are processed securely through certified payment gateways such as Razorpay. We never store credit or debit card details on our servers.
          </p>

          <h2 className="font-bold text-sm text-[#102a43]">4. Contact Us</h2>
          <p>
            If you have questions about your personal data, please contact us at support@panditjikadhaba.com.
          </p>
        </section>
      </div>
    </div>
  );
}
