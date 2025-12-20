import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex justify-center">
          <Image
            src="https://storage.googleapis.com/jjswart/c1b522_903f82c37aab4da28ae9886f72add797~mv2.avif"


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

        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="rounded-full bg-white text-black px-6 py-3 font-semibold hover:bg-neutral-200 transition-colors"
          >
            Firm Login
          </Link>
          <Link
            href="/intake/demo-token"
            className="rounded-full border border-neutral-800 px-6 py-3 font-semibold hover:bg-neutral-900 transition-colors"
          >
            Client Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
