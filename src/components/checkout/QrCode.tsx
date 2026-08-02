"use client";
// QrCode — 钱包地址 QR 码 (task-0041)
import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  return (
    <div className="p-2 bg-white inline-block rounded border border-border">
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}