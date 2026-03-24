"use client";

import { useState } from "react";

type Props = {
  url: string;
  title: string;
  shareText: string;
};

export default function RequestShareButtons({ url, title, shareText }: Props) {
  const [copied, setCopied] = useState(false);

  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
      <a href={linkedInUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
        Share on LinkedIn
      </a>
      <a href={xUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
        Share on X
      </a>
      <button type="button" className="btn btn-ghost" style={{ fontSize: "0.875rem" }} onClick={copyLink}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
        Help more vendors discover: {title}
      </span>
    </div>
  );
}
