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
import { Home, Analysis, FokusMode } from "@/pages/dashboard";
import { SignIn, SignUp, ForgotPassword} from "@/pages/auth";
import PetGame from "@/widgets/game/PetGame";
import QuizList from "@/pages/quiz/QuizList";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
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
        name: "Behavior Analysis",
        path: "/analysis",
        element: <Analysis />,
      },
      {
        icon: <PuzzlePieceIcon {...icon} />,
        name: "pet space",
        path: "/game",
        element: <PetGame />,
      },
    ],
  },
  // {
  //   title: "auth pages",
  //   layout: "auth",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "sign in",
  //       path: "/sign-in",
  //       element: <SignIn />,
  //     },
  //     {
  //       icon: <RectangleStackIcon {...icon} />,
  //       name: "sign up",
  //       path: "/sign-up",
  //       element: <SignUp />,
  //     },
  //     {
  //       icon: <InformationCircleIcon {...icon} />,
  //       name: "forgot password",
  //       path: "/forgot-password",
  //       element: <ForgotPassword />,
  //     },
  //   ],
  // },
];

export default routes;