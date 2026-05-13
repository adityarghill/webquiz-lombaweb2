import { Routes, Route } from "react-router-dom";
import {
  Sidenav, DashboardNavbar, Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController } from "@/context";
import QuizDetail from "@/pages/quiz/QuizDetail";
import QuizPlay   from "@/pages/quiz/QuizPlay";
import QuizResult from "@/pages/quiz/QuizResult";

// ── Music singleton (survives tab navigation) ──────────────────────────────
import { MusicProvider } from "@/context/MusicContext";

// ── Focus timer singleton (survives tab navigation) ────────────────────────
import { FokusProvider }    from "@/context/FokusContext";
import FokusFloatingBar     from "@/widgets/layout/FokusFloatingBar";

export function Dashboard() {
  const [controller] = useMaterialTailwindController();
  const { sidenavType } = controller;

  return (
    <MusicProvider>
      <FokusProvider>
        <div className="min-h-screen" style={{ background: "#eee025" }}>
          <Sidenav
            routes={routes}
            brandImg={sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"}
          />

          <div className="p-4 xl:ml-80">
            <DashboardNavbar />

            <Routes>
              {routes.map(
                ({ layout, pages }) =>
                  layout === "dashboard" &&
                  pages.map(({ path, element }) => (
                    <Route key={path} exact path={path} element={element} />
                  ))
              )}
              <Route path="/quiz/:quizSlug"        element={<QuizDetail />} />
              <Route path="/quiz/:quizSlug/play"   element={<QuizPlay />}   />
              <Route path="/quiz/:quizSlug/result" element={<QuizResult />} />
            </Routes>

            <div className="text-blue-gray-600">
              <Footer />
            </div>
          </div>

          {/* Floating Pomodoro bar — outside content div so it's truly fixed */}
          <FokusFloatingBar />
        </div>
      </FokusProvider>
    </MusicProvider>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";
export default Dashboard;
