import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, LightBulbIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";


const isAuthPage = (pageName) => {
  const authKeywords = ["sign in", "sign up", "login", "register", "forgot password", "lupa password"];
  return authKeywords.some(keyword => pageName.toLowerCase().includes(keyword));
};


const getCustomIcon = (pageName, defaultIcon) => {
  const name = pageName.toLowerCase();
  if (name === "focus mode") return <LightBulbIcon className="h-5 w-5" />;
  if (name === "behaviour analytic") return <ChartBarIcon className="h-5 w-5" />;
  return defaultIcon;
};

export function Sidenav({ routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;

 
  const cartoonyShadow = "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const cartoonyBorder = "border-4 border-black";
  const buttonShadow = "shadow-[4px_4px_0px_0px_black]";
  const buttonHover = "hover:shadow-[2px_2px_0px_0px_black] hover:translate-y-0.5";
  const buttonActive = "active:translate-y-1 active:shadow-[1px_1px_0px_0px_black]";

  
  const filteredRoutes = routes.map(route => ({
    ...route,
    pages: route.pages?.filter(page => !isAuthPage(page.name)) || []
  })).filter(route => route.pages.length > 0 || !route.title);

  return (
    <>
      
      {openSidenav && (
        <div
          onClick={() => setOpenSidenav(dispatch, false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden transition-all duration-300"
        />
      )}

      <aside
        className={`
          fixed inset-0 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-2xl
          transition-transform duration-300 ease-out
          ${openSidenav ? "translate-x-0" : "-translate-x-80"}
          xl:translate-x-0
          z-50
          bg-[#FFFDF5] ${cartoonyBorder} ${cartoonyShadow}
          font-bold flex flex-col
        `}
      >
        {/* Branding Area */}
        <div className="relative pt-6 pb-4 px-6 text-center border-b-4 border-black/20">
          <Typography
            variant="h3"
            className="font-black uppercase tracking-wider text-black drop-shadow-md"
          >
            ZooAsk
          </Typography>
          <Typography
            variant="small"
            className="font-medium text-black/80 mt-1 italic"
          >
            Belajar dengan Quiz seru, hilangkan bosanmu!
          </Typography>
          {/* Close button - now properly anchored inside sidebar */}
          <IconButton
            variant="text"
            size="sm"
            ripple={false}
            className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-white border-2 border-black shadow-[3px_3px_0px_0px_black] hover:translate-y-0.5 active:translate-y-1 active:shadow-[1px_1px_0px_0px_black] transition-all xl:hidden"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={3} className="h-5 w-5 stroke-black font-bold" />
          </IconButton>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {filteredRoutes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-6 flex flex-col gap-2">
              {title && (
                <li className="mx-2 mt-2 mb-1">
                  <Typography
                    variant="small"
                    className="font-black uppercase tracking-wider text-black border-l-4 border-black pl-2"
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {pages.map(({ icon, name, path }) => {
                const finalIcon = getCustomIcon(name, icon);
                return (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`} end>
                      {({ isActive }) => (
                        <Button
                          ripple={false}
                          fullWidth
                          className={`
                            flex items-center gap-4 px-4 py-3 capitalize font-extrabold tracking-wide
                            transition-all duration-150 ease-in
                            ${buttonShadow} ${buttonHover} ${buttonActive}
                            rounded-xl border-2 border-black
                            ${isActive 
                              ? "bg-yellow-400 text-black shadow-[4px_4px_0px_0px_black] hover:bg-yellow-500" 
                              : "bg-white text-black hover:bg-gray-100"
                            }
                          `}
                        >
                          <span className="flex items-center">{finalIcon}</span>
                          <Typography color="inherit" className="font-black capitalize">
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "ZooAsk",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
