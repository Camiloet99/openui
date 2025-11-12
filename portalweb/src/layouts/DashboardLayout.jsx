import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import brain from "@/assets/cerebro.png";
import homeIcon from "@/assets/layout/home.png";
import chatIcon from "@/assets/layout/chat.png";
import profileIcon from "@/assets/layout/profile.png";
import logoutIcon from "@/assets/layout/logout.png";
import partner1 from "@/assets/partner-1-white.png";
import partner2 from "@/assets/partner-2-white.png";

function Item({ to, imgSrc, label }) {
  return (
    <NavLink
      to={to}
      className="group flex flex-col items-center justify-center gap-1.5 text-center text-[11px] leading-tight select-none cursor-pointer"
    >
      {({ isActive }) => {
        const iconBase =
          "grid place-items-center h-11 w-11 rounded-[40%] transition-all duration-200";
        const iconState = isActive
          ? "bg-[#5944F9] shadow-[0_10px_24px_rgba(89,68,249,0.45)]"
          : "bg-transparent";
        const iconHover =
          "group-hover:bg-[#5944F9] group-hover:shadow-[0_10px_24px_rgba(89,68,249,0.45)] active:scale-95";

        return (
          <>
            <span className={`${iconBase} ${iconState} ${iconHover}`}>
              <img
                src={imgSrc}
                alt=""
                className="h-5 w-5 object-contain transition-all duration-200 opacity-85 group-hover:opacity-100 [filter:brightness(0)_invert(1)]"
                draggable={false}
              />
            </span>
            <span className="text-white/85 group-hover:text-white">
              {label}
            </span>
          </>
        );
      }}
    </NavLink>
  );
}

/* ---------- Bottom nav (mobile) ---------- */
function MobileNav() {
  const items = [
    { to: "/courses", icon: homeIcon, label: "Inicio" },
    { to: "/chat", icon: chatIcon, label: "Chat Nio" },
    { to: "/profile", icon: profileIcon, label: "Mi perfil" },
  ];

  return (
    <nav
      className="
        lg:hidden
        fixed left-1/2 -translate-x-1/2 bottom-3
        z-[70]
        w-[92%] max-w-[520px]
        rounded-[22px] bg-white/10 backdrop-blur-xl
        ring-1 ring-white/15 shadow-[0_15px_40px_rgba(0,0,0,.35)]
        px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]
      "
      aria-label="Navegación principal"
    >
      <ul className="grid grid-cols-3 gap-2">
        {items.map(({ to, icon, label }) => (
          <li key={to} className="flex justify-center">
            <NavLink
              to={to}
              className="group flex flex-col items-center gap-1.5 text-[11px] leading-tight select-none"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "grid place-items-center h-11 w-11 rounded-[40%] transition-all duration-200",
                      isActive
                        ? "bg-[#5944F9] shadow-[0_10px_24px_rgba(89,68,249,0.45)]"
                        : "bg-white/8 ring-1 ring-white/10",
                      "active:scale-95",
                    ].join(" ")}
                  >
                    <img
                      src={icon}
                      alt=""
                      className={[
                        "h-5 w-5 object-contain transition-all duration-200",
                        "[filter:brightness(0)_invert(1)]",
                        isActive
                          ? "opacity-100"
                          : "opacity-85 group-hover:opacity-100",
                      ].join(" ")}
                      draggable={false}
                    />
                  </span>
                  <span
                    className={[
                      "transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/85 group-hover:text-white",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function DashboardLayout() {
  const { logout, session } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1F2336] text-white">
      {/* Sidebar desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-24 flex-col items-center bg-white/5 p-3 lg:flex">
        {/* Logo */}
        <Link
          to="/courses"
          aria-label="Ir a cursos"
          className="mt-3 rounded-[40%] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <img
            src={brain}
            alt="Cerebro"
            className="h-10 w-10 object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
            draggable={false}
          />
        </Link>

        <nav className="mt-12 flex w-full flex-col items-stretch gap-4">
          <Item to="/courses" imgSrc={homeIcon} label="Inicio" />
          <Item to="/chat" imgSrc={chatIcon} label="Chat Nio" />
        </nav>

        <div className="mt-auto w-full" />
        <div className="mb-2 w-full">
          <Item to="/profile" imgSrc={profileIcon} label="Mi perfil" />
        </div>

        <button
          onClick={logout}
          className="mb-2 flex w-full flex-col items-center justify-center gap-1.5 text-[11px] text-white/85 transition group cursor-pointer"
          title="Salir"
        >
          <span className="grid place-items-center h-11 w-11 rounded-[40%] bg-transparent transition-all duration-200 group-hover:bg-[#5944F9] group-hover:shadow-[0_10px_24px_rgba(89,68,249,0.45)] active:scale-95">
            <img
              src={logoutIcon}
              alt=""
              className="h-5 w-5 object-contain transition-all duration-200 opacity-85 group-hover:opacity-100 [filter:brightness(0)_invert(1)]"
              draggable={false}
            />
          </span>
          <span className="group-hover:text-white">Salir</span>
        </button>
      </aside>

      <MobileNav />

      <main className="min-h-screen px-5 py-6 lg:pl-24 lg:px-10 lg:py-8 pb-28 lg:pb-8">
        <div className="mx-auto w-full max-w-[1600px] px-2 sm:px-4 lg:px-0">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-medium">
              Hola,{" "}
              {session?.user?.name?.split(" ")[2] ||
                session?.user?.name ||
                "Usuario"}
            </h1>
            <div className="flex items-center gap-8">
              <img
                src={partner1}
                alt="Partner 1"
                className="shrink-0 h-14 sm:h-16 lg:h-[88px] max-h-[88px] object-contain drop-shadow-md"
                draggable={false}
              />
              <img
                src={partner2}
                alt="Partner 2"
                className="shrink-0 h-14 sm:h-16 lg:h-[88px] max-h-[88px] object-contain drop-shadow-md"
                draggable={false}
              />
            </div>
          </div>

          <Outlet key={location.pathname} />
        </div>
      </main>
    </div>
  );
}
