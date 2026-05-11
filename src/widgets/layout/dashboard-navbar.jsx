import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useAuth } from "@/context/authContext";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut, userStats } = useAuth();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/auth/sign-in");
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-black-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="black"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="black"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="black">
            {page}
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <IconButton
            variant="text"
            color="black"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-black-500" />
          </IconButton>

          {/* User Menu */}
          {user ? (
            <Menu>
              <MenuHandler>
                <Button
                  variant="text"
                  color="black"
                  className="hidden items-center gap-2 px-4 xl:flex normal-case"
                >
                  {/* EXP Badge */}
                  {userStats && (
                    <span style={{
                      background: '#FFE566', border: '2px solid #111', borderRadius: 8,
                      padding: '1px 8px', fontSize: 11, fontWeight: 900, color: '#111',
                      boxShadow: '2px 2px 0 #111',
                    }}>
                      ⚡ {userStats.total_exp} EXP
                    </span>
                  )}
                  <UserCircleIcon className="h-5 w-5 text-black-500" />
                  <span className="text-sm">{user.email}</span>
                </Button>
              </MenuHandler>
              <MenuList>
                {userStats && (
                  <MenuItem disabled className="text-xs text-gray-500 font-semibold">
                    Quiz: {userStats.quizzes_completed} · Perfect: {userStats.perfect_scores}
                  </MenuItem>
                )}
                <MenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="black"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-black-500" />
                Sign In
              </Button>
              <IconButton
                variant="text"
                color="black"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-black-500" />
              </IconButton>
            </Link>
          )}

          <IconButton
            variant="text"
            color="black"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-black-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
