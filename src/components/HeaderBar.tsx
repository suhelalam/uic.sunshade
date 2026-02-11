import Image from "next/image";

type Props = {
  accessToken?: string;
};

export function HeaderBar({ accessToken }: Props) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Sunshade logo"
          width={48}
          height={48}
          className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
        />

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
          Sunshade
        </h1>
      </div>

      {!accessToken ? (
        <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-2.5 text-[11px] text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs">
          <div className="font-medium">Token setup</div>
          <div className="mt-1">
            Add your Mapbox public token to{" "}
            <code className="rounded bg-white px-1.5 py-0.5">
              .env.local
            </code>{" "}
            as{" "}
            <code className="rounded bg-white px-1.5 py-0.5">
              NEXT_PUBLIC_MAPBOX_TOKEN=...
            </code>
          </div>
        </div>
      ) : null}
    </header>
  );
}