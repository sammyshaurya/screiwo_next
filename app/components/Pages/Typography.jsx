import React from "react";

const Typography = ({ variant, className, children }) => {
  let typographyClassName = "";
  switch (variant) {
    case "title":
      typographyClassName = "text-2xl font-medium";
      break;
    case "body":
      typographyClassName = "text-base font-normal";
      break;
    default:
      typographyClassName = "";
      break;
  }

  return (
    <div className={`typography ${typographyClassName} ${className}`}>
      {children}
    </div>
  );
};

export default Typography;
