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

const UIC_RED = "#D50032";
const UIC_RED_SOFT = "#E85C7A";

export function MapMarkerPin({ imageUrl, creatorPhotoUrl, title, creatorName, organizer }: Props) {
  const displayImage = imageUrl || creatorPhotoUrl;
  const hasImage = Boolean(displayImage);
  const initials = getInitials(organizer || title || creatorName);

  const size = 44;
  const border = 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer ring: UIC red with subtle shadow depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(145deg, ${UIC_RED_SOFT}, ${UIC_RED})`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2), 0 4px 12px rgba(0,30,98,0.15)",
        }}
      />
      {/* White border (navy-tint optional) */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          inset: border,
          boxShadow: "inset 0 0 0 1px rgba(0,30,98,0.08)",
        }}
      />
      {/* Inner: photo or initials */}
      <div
        className="absolute overflow-hidden rounded-full flex items-center justify-center font-semibold"
        style={{
          inset: border + 2,
          background: hasImage ? "transparent" : "rgba(255,255,255,0.95)",
          color: UIC_RED,
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
