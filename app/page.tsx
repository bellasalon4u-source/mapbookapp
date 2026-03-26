export default function HomePage() {
  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "system-ui"
      }}
    >

      {/* MAP AREA */}

      <div
        style={{
          flex: 1,
          background: "#e8eefc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 22
        }}
      >
        MapBook map loading...
      </div>


      {/* SEARCH BAR */}

      <div
        style={{
          padding: 16,
          background: "white",
          borderTop: "1px solid #ddd"
        }}
      >
        🔍 Search services near you
      </div>


      {/* BOTTOM MENU */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: 14,
          background: "white",
          borderTop: "1px solid #ddd"
        }}
      >
        🏠
        🔎
        ➕
        💬
        👤
      </div>

    </main>
  )
}
