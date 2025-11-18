// Get user data from either localStorage or sessionStorage
export const getUser = () => {
  const localUser =
    localStorage.getItem("userData") || localStorage.getItem("user");
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  const sessionUser =
    sessionStorage.getItem("userData") || sessionStorage.getItem("user");
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  return null;
};

export const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

export const isAuthenticated = () => {
  return getUser() !== null;
};

export const isRememberMeEnabled = () => {
  return localStorage.getItem("rememberMe") === "true";
};
