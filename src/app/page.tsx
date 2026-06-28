import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black">QR Car</h1>
        <p className="mt-4 text-base text-[#6b7280]">
          Protect your parked car. Anyone who scans your sticker can alert you —
          anonymously.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full rounded-xl bg-[#16a34a] py-4 text-center text-base font-semibold text-white transition-colors hover:bg-[#15803d]"
          >
            Register your car
          </Link>
          <Link
            href="/s/demo"
            className="w-full rounded-xl border border-gray-200 py-4 text-center text-base font-semibold text-black transition-colors hover:bg-gray-50"
          >
            I scanned a sticker
          </Link>
        </div>
      </div>
    </main>
  );
}
