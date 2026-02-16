/**
 * UIC-style header: full-width navy bar (institutional), optional red accent.
 * Mirrors UIC global nav — structural, not decorative.
 */

import Image from "next/image";
import { AuthButton } from "./AuthButton";

type Props = {
  accessToken?: string;
};

export function HeaderBar({ accessToken }: Props) {
  return (
    <header className="bg-[#001E62] border-b-2 border-[#D50032]">
      <div className="w-full px-2 py-2 sm:px-4 sm:py-4 lg:px-6">
        <div className="flex flex-row items-center justify-between gap-2 min-h-[44px] sm:gap-6">
          {/* Left: UIC + Sunshade branding — flush left */}
          <div className="flex min-w-0 shrink items-center gap-2 self-center sm:gap-3">
            <Image
              src="/logo.png"
              alt="Sunshade"
              width={40}
              height={40}
              className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <div className="min-w-0">
              <p className="hidden text-white/80 sm:block sm:text-xs">University of Illinois Chicago</p>
              <h1 className="text-base font-bold tracking-tight text-white truncate sm:text-xl lg:text-2xl">
                Sunshade
              </h1>
              <p className="text-[10px] text-white/70 mt-0.5 sm:text-xs">Campus events</p>
            </div>
          </div>
          {/* Right: sign-in / sign-out */}
          <div className="flex shrink-0 flex-row items-center gap-2 sm:gap-4">
            <AuthButton />
            {!accessToken && (
              <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-[11px] text-white/90 sm:text-xs">
                <span className="font-medium">Mapbox:</span> set{" "}
                <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> in{" "}
                <code className="rounded bg-white/10 px-1">.env.local</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
