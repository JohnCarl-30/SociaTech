const API_URL = "http://localhost/Sociatech/backend/auth";

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error(text || "Server returned non-JSON response");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const signUpWithEmail = async (email, password, fullname, username) => {
  try {
    const response = await fetch(`${API_URL}/signup.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for sessions
      body: JSON.stringify({
        email,
        password,
        fullname,
        username: username || email.split("@")[0],
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for sessions
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Invalid email or password");
      if (response.status === 400)
        throw new Error("Email and password are required");

      const text = await response.text();
      throw new Error(text || "Server error. Please try again later.");
    }

    const data = await response.json();

    // Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify(data.data.user));

    return data;
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};

export const googleAuth = async (user) => {
  try {
    const response = await fetch(`${API_URL}/google-auth.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        google_id: user.uid,
        email: user.email,
        fullname: user.displayName || user.email.split("@")[0],
        username: user.email.split("@")[0],
        profile_image: user.photoURL || "default_pfp.png",
      }),
    });

    const data = await handleResponse(response);

    // Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify(data.data.user));

    return data;
  } catch (error) {
    console.error("Google auth error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await fetch(`${API_URL}/logout.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for sessions
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("userData");
  }
};

export const verifySession = async () => {
  try {
    const response = await fetch(`${API_URL}/verify.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Session verification error:", error);
    localStorage.removeItem("userData");
    throw error;
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const verifyResetToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/verify-reset-token.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(`${API_URL}/reset-password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, password }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};
