/**
 * Top page header with app title.
 * Shows a token setup notice when Mapbox token is missing.
 */

type Props = {
  accessToken?: string;
};

export function HeaderBar({ accessToken }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Sunshade
        </h1>
      </div>

      {!accessToken ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-xs text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="font-medium">Token setup</div>
          <div className="mt-1">
            Add your Mapbox public token to{" "}
            <code className="rounded bg-white px-1.5 py-0.5">.env.local</code> as{" "}
            <code className="rounded bg-white px-1.5 py-0.5">
              NEXT_PUBLIC_MAPBOX_TOKEN=...
            </code>
          </div>
        </div>
      ) : null}
    </header>
  );
}
