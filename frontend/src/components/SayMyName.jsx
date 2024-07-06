import React from "react";

const SayMyName = ({ providedName }) => {
  if (providedName) {
    providedName();
  }

  return <div></div>;
};

export default SayMyName;
