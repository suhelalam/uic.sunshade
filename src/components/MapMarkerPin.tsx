/**
 * React component for the map marker pin (location icon).
 * Rendered into the Mapbox marker DOM element.
 */

export function MapMarkerPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={36}
      height={36}
      aria-hidden
      className="block"
    >
      <path
        fill="#FF385C"
        d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      />
      <circle cx="12" cy="9.5" r="2.1" fill="white" />
    </svg>
  );
}
