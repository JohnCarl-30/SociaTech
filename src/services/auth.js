const API_URL = "http://localhost/sociatech-api/auth";

const setToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("authToken");
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem("authToken");
};

export const signUpWithEmail = async (email, password, fullname, username) => {
  try {
    const response = await fetch(`${API_URL}/signup.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullname,
        username: username || email.split("@")[0],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Signup failed");
      error.code = data.code || "auth/unknown-error";
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store token
    setToken(data.data.token);

    // Store user data
    localStorage.setItem("userData", JSON.stringify(data.data));

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Google Authentication - PHP Backend
export const googleAuth = async (user) => {
  try {
    const response = await fetch(`${API_URL}/google-auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        google_id: user.uid,
        email: user.email,
        fullname: user.displayName || user.email.split("@")[0],
        username: user.email.split("@")[0],
        profile_image: user.photoURL || "default_pfp.png",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Google authentication failed");
    }

    // Store token and user data
    setToken(data.data.token);
    localStorage.setItem("userData", JSON.stringify(data.data));

    return data;
  } catch (error) {
    console.error("Google auth error:", error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    const token = getToken();

    if (token) {
      await fetch(`${API_URL}/logout.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    removeToken();
    localStorage.removeItem("userData");
  } catch (error) {
    console.error("Logout error:", error);
    // Remove token anyway
    removeToken();
    localStorage.removeItem("userData");
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const token = getToken();

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/verify.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Token verification failed");
    }

    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    removeToken();
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send reset email");
    }

    return data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const verifyResetToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/verify-reset-token.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid or expired token");
    }

    return data;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(`${API_URL}/reset-password.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password");
    }

    return data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export { getToken, removeToken };
