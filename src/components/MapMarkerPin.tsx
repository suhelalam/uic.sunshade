/**
 * Round map pin: circle with gradient ring, white border, photo or initials inside.
 * No tail – clean and simple.
 */

type Props = {
  imageUrl?: string;
  creatorPhotoUrl?: string;
  title?: string;
  creatorName?: string;
  organizer?: string;
};

function getInitials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ACCENT = "#FF385C";
const ACCENT_SOFT = "#FF8FA3";

export function MapMarkerPin({ imageUrl, creatorPhotoUrl, title, creatorName, organizer }: Props) {
  const displayImage = imageUrl || creatorPhotoUrl;
  const hasImage = Boolean(displayImage);
  const initials = getInitials(organizer || title || creatorName);

  const size = 44;
  const r = size / 2;
  const border = 2;
  const innerR = r - border - 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer gradient ring */}
      <div
        className="absolute inset-0 rounded-full shadow-md"
        style={{
          background: `linear-gradient(135deg, ${ACCENT_SOFT}, ${ACCENT})`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />
      {/* White border */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          inset: border,
        }}
      />
      {/* Inner: photo or initials */}
      <div
        className="absolute overflow-hidden rounded-full flex items-center justify-center font-semibold"
        style={{
          inset: border + 2,
          background: hasImage ? "transparent" : "rgba(255,255,255,0.95)",
          color: ACCENT,
          fontSize: 12,
        }}
      >
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={title || creatorName || "Event"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>
    </div>
  );
}
