import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex justify-center">
          <Image
            src="/logo.png"


            alt="JJ Swart Deductify"
            width={400}
            height={100}
            priority
            className="h-auto w-auto max-w-[300px]"
          />
        </div>
        <p className="text-neutral-400 text-lg">
          The modern tax intake platform for forward-thinking accounting firms.
        </p>

        <div className="flex justify-center">
          <Link
            href="/admin"
            className="rounded-full bg-white text-black px-8 py-3 font-semibold hover:bg-neutral-200 transition-colors"
          >
            Firm Login
          </Link>
        </div>
      </div>
    </div>
  );
}
