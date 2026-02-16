/**
 * UIC-style footer: navy, structured, simple. Matches institutional footer pattern.
 */

export function Footer() {
  return (
    <footer className="shrink-0 border-t-2 border-[#D50032] bg-[#001E62] text-white">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 sm:text-sm">Sunshade</h3>
            <p className="mt-1 text-xs text-white/70 sm:mt-2 sm:text-sm">
              Campus event map for the University of Illinois Chicago.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 sm:text-sm">University of Illinois Chicago</h3>
            <p className="mt-1 text-xs text-white/70 sm:mt-2 sm:text-sm">
              1200 West Harrison Street<br />
              Chicago, Illinois 60607
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xs text-white/70 sm:text-sm">
              © {new Date().getFullYear()} The Board of Trustees of the University of Illinois.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
