import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import QuizDetail from "@/pages/quiz/QuizDetail";
import QuizPlay   from "@/pages/quiz/QuizPlay";
import QuizResult from "@/pages/quiz/QuizResult";

// ── MusicProvider lives at layout level, NOT inside any route ──
// This means the audio <Audio> singleton never gets destroyed
// when the user switches sidenav tabs. Music keeps playing.
import { MusicProvider } from "@/context/MusicContext";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  return (
    <MusicProvider>
      <div className="min-h-screen" style={{ background: "#eee025" }}>
        <Sidenav
          routes={routes}
          brandImg={
            sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
          }
        />
        <div className="p-4 xl:ml-80">
          <DashboardNavbar />
          <Configurator />
          <IconButton
            size="lg"
            color="white"
            className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
            ripple={false}
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </IconButton>
          <Routes>
            {routes.map(
              ({ layout, pages }) =>
                layout === "dashboard" &&
                pages.map(({ path, element }) => (
                  <Route key={path} exact path={path} element={element} />
                ))
            )}
            <Route path="/quiz/:quizId"        element={<QuizDetail />} />
            <Route path="/quiz/:quizId/play"   element={<QuizPlay />}   />
            <Route path="/quiz/:quizId/result" element={<QuizResult />} />
          </Routes>
          <div className="text-blue-gray-600">
            <Footer />
          </div>
        </div>
      </div>
    </MusicProvider>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";
export default Dashboard;