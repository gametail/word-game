import React, { Dispatch, SetStateAction, useContext } from "react";
import { LinkProps } from "react-router-dom";
import SocketStatus from "../SocketStatus";
import ThemeChanger from "../ThemeChanger";

interface INavBar {
  children: React.ReactElement<LinkProps> | React.ReactElement<LinkProps>[];
}

const NavBar: React.FC<INavBar> = ({ children }) => {
  const linkClassName = "text-xl normal-case btn btn-ghost";

  const styledChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, {
      className: `${linkClassName} ${child.props.className}`,
    })
  );

  return (
    <div className="z-50 shadow-md navbar bg-neutral text-neutral-content">
      {styledChildren}
      <div className="ml-auto "></div>
      <ThemeChanger />
      <SocketStatus nav />
    </div>
  );
};

export default NavBar;
