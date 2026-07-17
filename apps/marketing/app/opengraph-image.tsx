import { ImageResponse } from "next/og";

export const alt = "Biume - logiciel de compte rendu pour ostéopathe animalier";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export const headline = "De vos notes au propriétaire.";

export const brandSubtitle =
  "Un compte rendu clair, un suivi qui continue après la séance.";

export const headlineStyle = {
  fontSize: 70,
  lineHeight: 1.02,
  fontWeight: 780,
  letterSpacing: -3.2,
} as const;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 404 402" role="img" aria-labelledby="title desc">
  <title id="title">Biume logo</title>
  <desc id="desc">Rounded gradient square with a white animal paw mark.</desc>
  <defs>
    <linearGradient id="biume-gradient" x1="42" y1="34" x2="340" y2="355" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8e82e8"/>
      <stop offset="0.48" stop-color="#62a8c8"/>
      <stop offset="1" stop-color="#28c978"/>
    </linearGradient>
  </defs>
  <path
    fill="url(#biume-gradient)"
    d="M0 124C0 55.5 55.5 0 124 0h156c68.5 0 124 55.5 124 124v154c0 68.5-55.5 124-124 124H124C55.5 402 0 346.5 0 278V124Z"
  />
  <g fill="#fff">
    <circle cx="194" cy="133" r="24"/>
    <circle cx="252" cy="166" r="25"/>
    <circle cx="269" cy="233" r="25"/>
    <path d="M111 214c0-22.1 17.9-40 40-40h30c25.4 0 46 20.6 46 46v19c0 29.3-23.7 53-53 53-19.8 0-36.6-13.1-42.2-31.1-2.3-7.3-8.1-13.2-15.4-15.6C101 240.4 111 214 111 214Z"/>
  </g>
</svg>`;

export const brandLogoSrc = `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg)}`;

const colors = {
  background: "#f7f7f7",
  foreground: "#0a0a0a",
  muted: "#666666",
  border: "#e5e5e5",
  primary: "#8e82e8",
  blue: "#62a8c8",
  white: "#ffffff",
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: colors.background,
          color: colors.foreground,
          fontFamily:
            'Geist, "Geist Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(126deg, rgba(142,130,232,0.18), rgba(255,255,255,0) 48%, rgba(98,168,200,0.16))",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -170,
            top: -210,
            width: 560,
            height: 560,
            borderRadius: 999,
            background: "rgba(255,255,255,0.72)",
            border: `1px solid ${colors.white}`,
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 86px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            <img
              alt=""
              src={brandLogoSrc}
              width={82}
              height={82}
              style={{
                display: "flex",
                width: 82,
                height: 82,
                borderRadius: 25,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  lineHeight: 1,
                  fontWeight: 760,
                  letterSpacing: -1.8,
                }}
              >
                Biume
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                ...headlineStyle,
              }}
            >
              {headline}
            </div>
            <div
              style={{
                marginTop: 30,
                maxWidth: 720,
                color: colors.muted,
                fontSize: 34,
                lineHeight: 1.25,
                fontWeight: 480,
              }}
            >
              {brandSubtitle}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 28,
              borderTop: `1px solid ${colors.border}`,
              paddingTop: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                color: colors.foreground,
                fontSize: 25,
                fontWeight: 620,
              }}
            >
              <span>Compte rendu</span>
              <span style={{ color: colors.muted }}>·</span>
              <span>Timeline animal</span>
              <span style={{ color: colors.muted }}>·</span>
              <span>Relances</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: colors.muted,
                fontSize: 25,
                fontWeight: 560,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.blue})`,
                }}
              />
              biume.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
