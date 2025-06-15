export const saveLoginData = (email, password) => {
  localStorage.setItem("rememberMe", "true");
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);
};

export const clearLoginData = () => {
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("email");
  localStorage.removeItem("password");
};

export const getSavedLoginData = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  const email = localStorage.getItem("email") || "";
  const password = localStorage.getItem("password") || "";

  return { rememberMe, email, password };
};
