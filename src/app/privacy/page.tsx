import Nav from "@/components/Nav";
export default function Privacy() {
  return (
    <div><Nav />
      <div className="page-sm" style={{ lineHeight: 1.7 }}>
        <h1 className="page-title">Privacy Policy</h1>
        <p style={{ color: "#6b7280" }}>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>What we collect</h2>
        <p>We collect your name and email via ConsentKeys authentication. We collect the content of quote requests and quotes you submit. We store payment records via Stripe (we never see your card details).</p>

        <h2>How we use it</h2>
        <p>We use your information to operate the marketplace. Your contact details are only shared with a vendor <strong>after you select their quote and complete payment</strong>. We do not sell your data to advertisers.</p>

        <h2>Identity protection</h2>
        <p>Quote requests are posted publicly but anonymously. Vendors see your request details but not your name, email, or phone number until you pay and choose them.</p>

        <h2>Data retention</h2>
        <p>We retain your data while your account is active. You can request deletion by emailing <a href="mailto:support@getaquote.app">support@getaquote.app</a>.</p>

        <h2>Contact</h2>
        <p>Questions: <a href="mailto:support@getaquote.app">support@getaquote.app</a></p>
      </div>
    </div>
  );
}
