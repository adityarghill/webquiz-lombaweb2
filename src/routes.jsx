import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { Home, Tables, FokusMode, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import PetGame from "@/widgets/game/PetGame";
import QuizList from "@/pages/quiz/QuizList";
import QuizDetail from "@/pages/quiz/QuizDetail";
import QuizPlay from "@/pages/quiz/QuizPlay";
import QuizResult from "@/pages/quiz/QuizResult";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <AcademicCapIcon {...icon} />,
        name: "quiz",
        path: "/quiz",
        element: <QuizList />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Fokus Mode",
        path: "/focus-mode",
        element: <FokusMode />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <PuzzlePieceIcon {...icon} />,
        name: "pet space",
        path: "/game",
        element: <PetGame />,
      },

    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;