import Nav from "@/components/Nav";
export default function Terms() {
  return (
    <div><Nav />
      <div className="page-sm" style={{ lineHeight: 1.7 }}>
        <h1 className="page-title">Terms of Service</h1>
        <p style={{ color: "#6b7280" }}>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Service Description</h2>
        <p>GetAQuote is a marketplace that connects users seeking service quotes with vendors who provide those services. We charge a commission on successful matches.</p>

        <h2>2. Identity and Privacy</h2>
        <p>User identity (name, email, phone) is kept anonymous from vendors until a user selects a quote and completes payment. Upon payment, the user's contact details are disclosed to the winning vendor only.</p>
        <p><strong>Identity disclosure on provider change:</strong> If GetAQuote changes identity providers, or the company is sold or changes control, we will not reveal a user's real identity unless the user first sees a clear warning and manually types <em>I consent</em>.</p>

        <h2>3. Payments and Commission</h2>
        <p>GetAQuote charges a 15% commission on the quoted price at the time of payment. This fee is non-refundable once identity has been disclosed to the vendor.</p>

        <h2>4. Vendor Obligations</h2>
        <p>Vendors must provide accurate information, respond to selected matches within 24 hours, and deliver services as quoted. Misrepresentation may result in account suspension.</p>

        <h2>5. User Obligations</h2>
        <p>Users must post genuine requests and complete payment if they select a quote. Fraudulent requests are prohibited.</p>

        <h2>6. Disputes</h2>
        <p>GetAQuote facilitates the introduction but is not a party to the service agreement between users and vendors. Disputes should be resolved directly between parties. We may assist in mediation at our discretion.</p>

        <h2>7. Limitation of Liability</h2>
        <p>GetAQuote is not liable for the quality, safety, or completion of services rendered by vendors. Use vendor services at your own discretion.</p>

        <h2>8. Contact</h2>
        <p>Questions? Email us at <a href="mailto:support@getaquote.app">support@getaquote.app</a></p>
      </div>
    </div>
  );
}
